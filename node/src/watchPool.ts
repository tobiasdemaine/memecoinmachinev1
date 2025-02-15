/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PublicKey, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { LIQUIDITY_STATE_LAYOUT_V4 } from "@raydium-io/raydium-sdk";
import * as fs from "fs";
import BN from "bn.js";

import { connection } from "./config";

import { ammFetchPoolId } from "./fetchPool";
import axios from "axios";

// --- CONFIGURATION ---
const configFilePath = process.argv[2];
if (!configFilePath) {
  throw new Error("Config file path must be provided as a runtime argument.");
}
const config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
const kname = config.mode + "_" + config.metaData.symbol;

const POOL_WALLET_SECRET = JSON.parse(
  fs.readFileSync("../tokens/keys/" + kname + "-keypair.json", "utf8")
);

const poolWallet = Keypair.fromSecretKey(new Uint8Array(POOL_WALLET_SECRET));

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

// --- TRANSFER FUNDS FROM POOL WALLET TO STORAGE WALLET ---

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
  const { pool, poolId } = await getPool();

  const totalPool = await getPoolBalance(pool);

  const acc = await connection.getMultipleAccountsInfo([poolId]);
  const parsed = acc.map((v) => LIQUIDITY_STATE_LAYOUT_V4.decode(v.data));
  const lpMint = parsed[0].lpMint;
  let lpReserve = parsed[0].lpReserve.toNumber();

  const accInfo = await connection.getParsedAccountInfo(new PublicKey(lpMint));
  //@ts-ignore
  const mintInfo = accInfo?.value?.data?.parsed?.info;

  lpReserve = lpReserve / Math.pow(10, mintInfo?.decimals);
  const actualSupply = mintInfo?.supply / Math.pow(10, mintInfo?.decimals);

  //Calculate burn percentage
  //const maxLpSupply = Math.max(actualSupply, lpReserve - 1);
  const burnAmt = lpReserve - actualSupply;

  const burnPct = (burnAmt / lpReserve) * 100;

  const lpTokenAccount = await getAssociatedTokenAddress(
    pool.lpMint,
    poolWallet.publicKey,
    true
  );

  // Check if this account exists
  //const accountInfo = await connection.getAccountInfo(lpTokenAccount);
  //if (accountInfo) {
  const balance = await connection.getTokenAccountBalance(lpTokenAccount);

  const percentage = (balance.value.uiAmount / Number(totalPool.totallp)) * 100;

  const solAudPrice = await getSolAudPrice();

  const price =
    totalPool.baseBalance /
    10 ** config.decimals /
    (totalPool.quoteBalance / 10 ** 9);
  if (process.argv[3]) {
    console.clear();
    console.log(`📊 Total Pool: ${totalPool.totallp} LP`);
    console.log(
      `🪙  lpMint - Reserve: ${lpReserve}, Actual Supply: ${actualSupply}`
    );
    console.log(`🔥 burn amt: ${burnAmt}`);
    console.log(`👤 My Pool Balance: ${balance.value.uiAmount} LP`);
    console.log(`🔥 ${burnPct} LP burned`);
    console.log(`📈 Ownership: ${percentage.toFixed(2)}%`);
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
    setTimeout(monitor, 60000);
    return;
  }

  console.log(
    JSON.stringify({
      totalPool: totalPool.totallp,
      burnAmt: burnAmt,
      lpBurned: burnPct,
      myPoolLPBalance: balance.value.uiAmount,
      ownershipPercent: percentage.toFixed(2),
      poolBalance: totalPool.baseBalance,
      poolSolBalance: totalPool.quoteBalance,
      token_SOL: price,
      token_AUD: (price / solAudPrice).toFixed(2),
      SOL_AUD: solAudPrice,
      poolSOLasAUD: (solAudPrice * totalPool.quoteBalance).toFixed(2),
      sharePoolSolasAUD: (
        solAudPrice *
        ((totalPool.quoteBalance / 100) * percentage)
      ).toFixed(2),
    })
  );

  //
}

// --- RUN SCRIPT ---
monitor();
