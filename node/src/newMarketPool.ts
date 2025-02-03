import { createMarket } from "./lib/createMarket";
import fs from "fs";
import { getWalletTokenAccount, sleepTime } from "./lib/util";
import BN from "bn.js";
import { createPool } from "./lib/createPool";
import { connection, myKeyPair, DEFAULT_TOKEN } from "./config";
import { PublicKey } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";

const main = async () => {
  const configPath = process.argv[2];
  if (!configPath) {
    throw new Error("Config file path must be provided as the first argument");
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  console.log("Creating Market...");

  const baseToken = new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey(config.tokenData.mintAuthority),
    config.tokenData.decimals,
    config.tokenData.symbol,
    config.tokenData.tokenName
  );

  const lotSize = new BN(config.tokenData.lotSize);
  const tickSize = new BN(config.tokenData.tickSize);

  const targetMarketId = await createMarket({
    baseToken,
    quoteToken: DEFAULT_TOKEN.WSOL,
    lotSize,
    tickSize,
    wallet: myKeyPair,
  });

  const addBaseAmount = new BN(
    config.tokenData.addBaseAmountNumber * 10 ** config.tokenData.decimals
  ); // custom token
  const addQuoteAmount = new BN(
    config.tokenData.addQuoteAmountNumber * 10 ** 9
  ); // WSOL

  const startTime =
    Math.floor(Date.now() / 1000) + config.tokenData.poolLockTime * 60 * 60;

  let walletTokenAccounts;
  let found = false;
  while (!found) {
    walletTokenAccounts = await getWalletTokenAccount(
      connection,
      config.tokenData.mintAuthority
    );
    walletTokenAccounts.forEach((tokenAccount) => {
      if (
        tokenAccount.accountInfo.mint.toString() ==
        config.tokenData.mintAuthority
      ) {
        found = true;
        return;
      }
    });

    if (!found) {
      console.log("checking new token in wallet...");
      await sleepTime(1000); // Wait for 1 seconds before retrying
    }
  }

  console.log("Creating Pool...");
  const targetPoolPubkey = await createPool({
    baseToken,
    quoteToken: DEFAULT_TOKEN.WSOL,
    addBaseAmount,
    addQuoteAmount,
    targetMarketId,
    startTime,
    walletTokenAccounts,
  });

  // const targetPool = '9cAk6wsiehHoPyEwUJ9Vy8fpb5iHz5uCupgAMRKxVfbN' // replace pool id
  const targetPool = targetPoolPubkey.toString();
  console.log(targetPool);
  config.tokenData.targetPool = targetPool;
  config.tokenData.targetMarketId = targetMarketId;

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("Config file updated with targetPool.");

  // now we fill the pool
};

main();
