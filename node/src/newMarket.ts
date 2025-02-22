import { createMarket } from "./lib/createMarket";
import fs from "fs";

import { myKeyPair, DEFAULT_TOKEN } from "./config";
import { PublicKey } from "@solana/web3.js";
import { Token } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
const main = async () => {
  const configPath = process.argv[2];
  if (!configPath) {
    throw new Error("Config file path must be provided as the first argument");
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  if (config.tokenData.targetMarketId !== "") {
    console.log("Target Market ID is already set. Exiting...");
    return;
  }
  if (config.tokenData.poolMintAccount !== "") {
    console.log("Pool Mint Account is already set. Exiting...");
    return;
  }

  console.log("Creating Market...");

  const baseToken = new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey(config.tokenData.mintAccount),
    config.tokenData.decimals,
    config.tokenData.symbol,
    config.tokenData.tokenName
  );

  const targetMarketId = await createMarket(
    {
      baseToken,
      quoteToken: DEFAULT_TOKEN.WSOL,
      lotSize: config.tokenData.lotSize,
      tickSize: config.tokenData.tickSize,
      wallet: myKeyPair,
      requestQueueSpacce: config.tokenData.requestQueueSpacce,
      eventQueueSpacce: config.tokenData.eventQueueSpacce,
      orderbookQueueSpacce: config.tokenData.orderbookQueueSpacce,
    },
    config.mode
  );

  config.tokenData.targetMarketId = targetMarketId;

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("Config file updated with targetPool.");

  // now we fill the pool
};

main();
