import { execSwap } from "./lib/execSwap";
import * as fs from "fs";
import {
  Percent,
  Token,
  TOKEN_PROGRAM_ID,
  TokenAmount,
} from "@raydium-io/raydium-sdk";
import { DEFAULT_TOKEN } from "./config";
import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

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
  const RENT = 0.0025;
  const amount = new BN(
    (config.wallets.BASE_AMOUNT / config.wallets.NUM_RECIPIENTS - RENT) *
      10 ** 9
  );

  const quoteToken = DEFAULT_TOKEN.WSOL;
  const outputToken = baseToken;
  const inputTokenAmount = new TokenAmount(quoteToken, amount);
  const walletPath = process.argv[3];
  const slippage = new Percent(1, 100);
  const WALLET_SECRET = JSON.parse(fs.readFileSync(walletPath, "utf8"));

  const wallet = Keypair.fromSecretKey(new Uint8Array(WALLET_SECRET));

  await execSwap({
    targetPool: config.tokenData.poolMintAccount,
    inputTokenAmount,
    outputToken,
    slippage,
    wallet,
  });
};

main();
