import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import {
  LIQUIDITY_STATE_LAYOUT_V4,
  getMultipleAccountsInfo,
  TokenAmount,
  jsonInfo2PoolKeys,
  LiquidityPoolKeys,
  Liquidity,
  Token,
  TOKEN_PROGRAM_ID,
} from "@raydium-io/raydium-sdk";
import * as fs from "fs";
import BN from "bn.js";
import assert from "assert";
import {
  buildAndSendTx,
  formatAmmKeysById,
  getWalletTokenAccount,
} from "./lib/util";
import { makeTxVersion } from "./config";
import { exec } from "child_process";

// --- CONFIGURATION ---
const configFilePath = process.argv[2];
if (!configFilePath) {
  throw new Error("Config file path must be provided as a runtime argument.");
}
const config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
const kname = config.mode + "_" + config.metadata.symbol;

let RPC_URL = "https://api.mainnet-beta.solana.com";
if (config.mode == "DEV") {
  RPC_URL = "https://api.dev.solana.com";
}
const connection = new Connection(RPC_URL, "confirmed");

const pool_wallet_file = "../tokens/keys/" + kname + "-keypair.json";
const POOL_WALLET_SECRET = JSON.parse(
  fs.readFileSync("../tokens/keys/" + kname + "-keypair.json", "utf8")
);

const STORAGE_WALLET_SECRET = JSON.parse(
  fs.readFileSync("../tokens/keys/base-keypair.json", "utf8")
);

const poolWallet = Keypair.fromSecretKey(new Uint8Array(POOL_WALLET_SECRET));
const storageWallet = Keypair.fromSecretKey(
  new Uint8Array(STORAGE_WALLET_SECRET)
);

const TOKEN_PAIR = config.TOKEN_PAIR;
const TARGET_BALANCE = parseFloat(config.TARGET_BALANCE);
const WITHDRAW_AMOUNT = parseFloat(config.WITHDRAW_AMOUNT);

async function getLiquidityPool(tokenPair: string): Promise<PublicKey | null> {
  console.log(`Fetching liquidity pool for ${tokenPair}...`);
  const response = await fetch(
    "https://api.raydium.io/v2/sdk/liquidity/mainnet.json"
  );
  const pools = await response.json();

  for (const pool of pools) {
    if (pool.name === tokenPair) {
      console.log(`✅ Found Pool: ${pool.name} | Address: ${pool.lpMint}`);
      return new PublicKey(pool.lpMint);
    }
  }

  console.error("❌ Pool not found!");
  return null;
}

// --- FETCH TOTAL POOL BALANCE ---
async function getPoolBalance(lpMint: PublicKey): Promise<TokenAmount> {
  const accountInfo = await connection.getAccountInfo(lpMint);
  if (!accountInfo) {
    throw new Error("Failed to fetch pool account info.");
  }

  const poolState = LIQUIDITY_STATE_LAYOUT_V4.decode(accountInfo.data);

  const baseTokenAmount = await connection.getTokenAccountBalance(
    poolState.baseVault
  );
  const quoteTokenAmount = await connection.getTokenAccountBalance(
    poolState.quoteVault
  );

  const denominator = new BN(10).pow(poolState.baseDecimal);

  console.log(
    "pool info:",
    "base vault balance " + baseTokenAmount.value.uiAmount,
    "quote vault balance " + quoteTokenAmount.value.uiAmount,

    "base token decimals " + poolState.baseDecimal.toNumber(),
    "quote token decimals " + poolState.quoteDecimal.toNumber(),
    "total lp " + poolState.lpReserve.div(denominator).toString()
  );

  return poolState.lpReserve.div(denominator).toString(); // 9 decimals for SOL
}

// --- FETCH USER POOL BALANCE ---
async function getUserPoolBalance(
  userWallet: PublicKey,
  lpMint: PublicKey
): Promise<number> {
  const accounts = await getMultipleAccountsInfo(connection, [userWallet]);
  if (!accounts[0]) return 0;

  const balance = await connection.getTokenAccountBalance(lpMint);
  return parseFloat(balance.value.amount);
}

// --- WITHDRAW LP TOKENS ---
type WalletTokenAccounts = Awaited<ReturnType<typeof getWalletTokenAccount>>;
type TestTxInputInfo = {
  removeLpTokenAmount: TokenAmount;
  targetPool: string;
  walletTokenAccounts: WalletTokenAccounts;
  wallet: Keypair;
};

async function ammRemoveLiquidity(input: TestTxInputInfo) {
  // -------- pre-action: fetch basic info --------
  const targetPoolInfo = await formatAmmKeysById(input.targetPool);
  assert(targetPoolInfo, "cannot find the target pool");

  // -------- step 1: make instructions --------
  const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys;
  const removeLiquidityInstructionResponse =
    await Liquidity.makeRemoveLiquidityInstructionSimple({
      connection,
      poolKeys,
      userKeys: {
        owner: input.wallet.publicKey,
        payer: input.wallet.publicKey,
        tokenAccounts: input.walletTokenAccounts,
      },
      amountIn: input.removeLpTokenAmount,
      makeTxVersion,
    });

  return {
    txids: await buildAndSendTx(
      removeLiquidityInstructionResponse.innerTransactions
    ),
  };
}

async function withdrawFromPool(
  poolWallet: Keypair,
  lpMint: PublicKey,
  amount: number
) {
  console.log(`🔄 Withdrawing ${amount} LP tokens from pool...`);
  const accounts = await getMultipleAccountsInfo(connection, [
    poolWallet.publicKey,
  ]);
  const lpToken = new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey(config.tokenData.mintAccount),
    config.tokenData.decimals,
    config.tokenData.symbol,
    config.tokenData.name
  );
  const removeLpTokenAmount = new TokenAmount(lpToken, 100);
  // TODO: Add Raydium withdraw instruction here
  ammRemoveLiquidity({
    removeLpTokenAmount,
    targetPool: lpMint.toString(),
    walletTokenAccounts: accounts,
    wallet: poolWallet,
  });

  console.log(`✅ Successfully withdrew ${amount} LP tokens.`);
}

// --- TRANSFER FUNDS FROM POOL WALLET TO STORAGE WALLET ---
async function transferToStorage(
  walletFrom: string,
  walletTo: PublicKey,
  amount: number
) {
  console.log(`🚀 Transferring ${amount} SOL to storage wallet...`);

  exec(
    `python3 ../python/getAllSolFromWallet.py ${walletFrom} ${walletTo.toBase58()} ${amount}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    }
  );
  console.log(`✅ Successfully transferred ${amount} SOL to storage wallet.`);
}

// --- MONITOR & EXECUTE WITHDRAWAL ---
async function monitorAndWithdraw() {
  const lpMint = await getLiquidityPool(TOKEN_PAIR);
  if (!lpMint) return;

  const totalPool = await getPoolBalance(lpMint);
  const userPoolBalance = await getUserPoolBalance(
    poolWallet.publicKey,
    lpMint
  );

  console.log(`📊 Total Pool: ${totalPool.toFixed(2)} LP`);
  console.log(`👤 Your Pool Balance: ${userPoolBalance.toFixed(2)} LP`);

  const percentage = (userPoolBalance / Number(totalPool.toExact())) * 100;

  console.log(`📈 Current Ownership: ${percentage.toFixed(2)}%`);

  if (userPoolBalance >= TARGET_BALANCE) {
    console.log(
      `🎯 Target reached! Withdrawing ${WITHDRAW_AMOUNT} LP tokens...`
    );
    await withdrawFromPool(poolWallet, lpMint, WITHDRAW_AMOUNT);

    console.log(`💰 Withdrawing funds to storage wallet...`);
    await transferToStorage(
      pool_wallet_file,
      storageWallet.publicKey,
      WITHDRAW_AMOUNT
    );
  } else {
    console.log(`⏳ Waiting... Your pool amount is below target.`);
  }
}

// --- RUN SCRIPT ---
setInterval(monitorAndWithdraw, 60000); // Check every 60 seconds
