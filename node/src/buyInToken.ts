import { execSwap } from "./lib/execSwap";
import * as fs from "fs";
import {
  Percent,
  Token,
  TOKEN_PROGRAM_ID,
  TokenAmount,
} from "@raydium-io/raydium-sdk";
import * as bs58 from "bs58";
import { DEFAULT_TOKEN } from "./config";
import { Keypair, PublicKey } from "@solana/web3.js";

const main = async () => {
  const configPath = process.argv[2];
  if (!configPath) {
    throw new Error("Config file path must be provided as the first argument");
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const baseToken = new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey(config.tokenData.mintAuthority),
    config.tokenData.decimals,
    config.tokenData.symbol,
    config.tokenData.tokenName
  );

  const quoteToken = DEFAULT_TOKEN.WSOL;
  const outputToken = baseToken;
  const inputTokenAmount = new TokenAmount(quoteToken, config.tokenData.amount);
  const walletSecret = process.argv[3];
  const slippage = new Percent(1, 100);
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(walletSecret))
  );

  const res = await execSwap({
    targetPool: config.tokenData.targetPool,
    inputTokenAmount,
    outputToken,
    slippage,
    wallet,
  });
  console.log(res);
};

main();
