import fs from "fs";
import { getWalletTokenAccount, sleepTime } from "./lib/util";
import { createPool } from "./lib/createPool";
import { connection, DEFAULT_TOKEN } from "./config";
import { PublicKey } from "@solana/web3.js";
import { Token } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";

const main = async () => {
  const configPath = process.argv[2];
  if (!configPath) {
    throw new Error("Config file path must be provided as the first argument");
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  if (config.tokenData.targetMarketId === "") {
    console.log("Target Market ID is empty. Exiting...");
    return;
  }
  if (config.tokenData.poolMintAccount !== "") {
    console.log("Pool Mint Account is already set. Exiting...");
    return;
  }
  const baseToken = new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey(config.tokenData.mintAccount),
    config.tokenData.decimals,
    config.tokenData.symbol,
    config.tokenData.tokenName
  );
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
      new PublicKey(config.tokenData.mintAuthority)
    );
    walletTokenAccounts.forEach((tokenAccount) => {
      if (
        tokenAccount.accountInfo.mint.toString() == config.tokenData.mintAccount
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
  console.log(walletTokenAccounts);

  console.log("Creating Pool...");

  const targetPool = await createPool(
    {
      baseToken,
      quoteToken: DEFAULT_TOKEN.WSOL,
      addBaseAmount: addBaseAmount,
      addQuoteAmount: addQuoteAmount,
      targetMarketId: new PublicKey(config.tokenData.targetMarketId),
      startTime,
      walletTokenAccounts,
    },
    config.mode
  );

  config.tokenData.poolMintAccount = targetPool.ammId.toString();
  config.pool = targetPool;

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("Config file updated with targetPool.");

  // now we fill the pool
};

main();
