import { createMarket } from "./lib/createMarket";
import fs from "fs";

import { myKeyPair, DEFAULT_TOKEN } from "./config";
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
    },
    config.mode
  );

  console.log(targetMarketId);
  config.tokenData.targetMarketId = targetMarketId;

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("Config file updated with targetPool.");

  // now we fill the pool
};

main();
