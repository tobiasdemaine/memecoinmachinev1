/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PublicKey, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
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
import { connection, makeTxVersion } from "./config";
import { exec } from "child_process";
import { ammFetchPoolId } from "./fetchPool";
import axios from "axios";

// --- CONFIGURATION ---
const configFilePath = process.argv[2];
if (!configFilePath) {
  throw new Error("Config file path must be provided as a runtime argument.");
}
const config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
const kname = config.mode + "_" + config.metaData.symbol;

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

const TARGET_BALANCE = parseFloat(config.TARGET_BALANCE);
const WITHDRAW_AMOUNT = parseFloat(config.WITHDRAW_AMOUNT);

async function getPool() {
  const marketId = config.tokenData.targetMarketId;
  const pool = await ammFetchPoolId({
    marketId,
  });
  const account = await connection.getAccountInfo(new PublicKey(pool.id));
  if (account === null) throw Error(" get id info error ");
  const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data);

  return { pool: info, poolId: new PublicKey(pool.id) };
}

// --- FETCH TOTAL POOL BALANCE ---
async function getPoolBalance(poolState: any) {
  const baseTokenAmount = await connection.getTokenAccountBalance(
    new PublicKey(poolState.baseVault)
  );
  const quoteTokenAmount = await connection.getTokenAccountBalance(
    new PublicKey(poolState.quoteVault)
  );

  const denominator = new BN(10).pow(new BN(poolState.baseDecimal));

  return {
    baseBalance: baseTokenAmount.value.uiAmount,
    quoteBalance: quoteTokenAmount.value.uiAmount,
    totallp: poolState.lpReserve.div(denominator).toString(),
  };
}

// --- FETCH USER POOL BALANCE ---

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
  /*ammRemoveLiquidity({
    removeLpTokenAmount,
    targetPool: lpMint.toString(),
    walletTokenAccounts: accounts,
    wallet: poolWallet,
  });*/

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

async function getSolAudPrice() {
  try {
    const response = await axios.get(
      "https://api.btcmarkets.net/v3/markets/SOL-AUD/ticker"
    );
    return response.data.lastPrice;
  } catch (error) {
    console.error("Error fetching SOL-AUD price:", error);
    return null;
  }
}

// --- MONITOR & EXECUTE WITHDRAWAL ---
async function monitor() {
  console.clear();
  const { pool, poolId } = await getPool();

  const totalPool = await getPoolBalance(pool);

  console.log(`📊 Total Pool: ${totalPool.totallp} LP`);

  const acc = await connection.getMultipleAccountsInfo([poolId]);
  const parsed = acc.map((v) => LIQUIDITY_STATE_LAYOUT_V4.decode(v.data));
  const lpMint = parsed[0].lpMint;
  let lpReserve = parsed[0].lpReserve.toNumber();

  const accInfo = await connection.getParsedAccountInfo(new PublicKey(lpMint));
  //@ts-ignore
  const mintInfo = accInfo?.value?.data?.parsed?.info;

  lpReserve = lpReserve / Math.pow(10, mintInfo?.decimals);
  const actualSupply = mintInfo?.supply / Math.pow(10, mintInfo?.decimals);
  console.log(
    `🪙  lpMint - Reserve: ${lpReserve}, Actual Supply: ${actualSupply}`
  );

  //Calculate burn percentage
  const maxLpSupply = Math.max(actualSupply, lpReserve - 1);
  const burnAmt = lpReserve - actualSupply;
  console.log(`🔥 burn amt: ${burnAmt}`);
  const burnPct = (burnAmt / lpReserve) * 100;
  console.log(`🔥 ${burnPct} LP burned`);

  const lpTokenAccount = await getAssociatedTokenAddress(
    pool.lpMint,
    poolWallet.publicKey,
    true
  );

  // Check if this account exists
  //const accountInfo = await connection.getAccountInfo(lpTokenAccount);
  //if (accountInfo) {
  const balance = await connection.getTokenAccountBalance(lpTokenAccount);
  console.log(`👤 My Pool Balance: ${balance.value.uiAmount} LP`);

  const percentage = (balance.value.uiAmount / Number(totalPool.totallp)) * 100;

  console.log(`📈 Ownership: ${percentage.toFixed(2)}%`);

  const solAudPrice = await getSolAudPrice();

  const price =
    totalPool.baseBalance /
    10 ** config.decimals /
    (totalPool.quoteBalance / 10 ** 9);
  console.log(
    "🪙  Pool " + config.metaData.symbol + " balance " + totalPool.baseBalance
  );
  console.log("🪙  Pool SOL balance " + totalPool.quoteBalance);
  console.log(`🪙  ${config.metaData.symbol}-SOL: ${price}`);
  console.log(`🪙  ${config.metaData.symbol}-AUD: ${price / solAudPrice}`);
  console.log(`💵 SOL-AUD: $${solAudPrice}`);
  console.log(`💵 POOL SOL as AUD: $${solAudPrice * totalPool.quoteBalance}`);
  console.log(
    `💵 SHARE POOL SOL as AUD: $${(
      solAudPrice *
      ((totalPool.quoteBalance / 100) * percentage)
    ).toFixed(2)}`
  );
  const cando = false;

  if (balance.value.uiAmount >= TARGET_BALANCE && cando) {
    console.log(
      `🎯 Target reached! Withdrawing ${WITHDRAW_AMOUNT} LP tokens...`
    );
    await withdrawFromPool(poolWallet, poolId, WITHDRAW_AMOUNT);
    console.log(`😴 Sleeping for 1 minute...`);
    await new Promise((resolve) => setTimeout(resolve, 60000));
    console.log(`💰 Withdrawing funds to storage wallet...`);
    await transferToStorage(
      pool_wallet_file,
      storageWallet.publicKey,
      WITHDRAW_AMOUNT
    );
  } else {
    // console.log(`⏳ Waiting... Your pool amount is below target.`);
  }
  setTimeout(monitor, 60000);
}

// --- RUN SCRIPT ---
monitor();
