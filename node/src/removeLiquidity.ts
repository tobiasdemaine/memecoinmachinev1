import {
  jsonInfo2PoolKeys,
  Liquidity,
  LiquidityPoolKeys,
  Token,
  TOKEN_PROGRAM_ID,
  TokenAccount,
  TokenAmount,
} from "@raydium-io/raydium-sdk";
import * as fs from "fs";
import { Keypair, PublicKey } from "@solana/web3.js";
import { connection, makeTxVersion, myKeyPair } from "./config";
import {
  buildAndSendTx,
  formatAmmKeysById,
  getWalletTokenAccount,
} from "./lib/util";
import assert from "assert";

// --- CONFIGURATION ---
const configFilePath = process.argv[2];
if (!configFilePath) {
  throw new Error("Config file path must be provided as a runtime argument.");
}
const config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
//const kname = config.mode + "_" + config.metaData.symbol;

type TestTxInputInfo = {
  removeLpTokenAmount: TokenAmount;
  targetPool: string;
  walletTokenAccounts: TokenAccount[];
  wallet: Keypair;
};

async function withdrawFromPool(
  poolWallet: Keypair,
  lpMint: PublicKey,
  amount: number
) {
  console.log(`🔄 Withdrawing ${amount} LP tokens from pool...`);
  const accounts = await getWalletTokenAccount(
    connection,
    poolWallet.publicKey
  );
  const lpToken = new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey(config.poolData.lpMint),
    config.poolData.lpDecimals,
    config.tokenData.symbol + "-SOL",
    config.tokenData.symbol + "-SOL"
  );

  const removeLpTokenAmount = new TokenAmount(
    lpToken,
    amount * 10 ** lpToken.decimals
  );
  const tx = await ammRemoveLiquidity({
    removeLpTokenAmount,
    targetPool: lpMint.toString(),
    walletTokenAccounts: accounts,
    wallet: poolWallet,
  });
  console.log(tx);
  console.log(`✅ Successfully withdrew ${amount} LP tokens.`);
}

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

const amount = Number(process.argv[3]);
withdrawFromPool(myKeyPair, config.tokenData.poolMintAccount, amount);
