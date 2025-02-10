import fs from "fs";
import { getWalletTokenAccount } from "./lib/util";
import { connection, DEFAULT_TOKEN, myKeyPair } from "./config";
import { PublicKey } from "@solana/web3.js";
import { Percent, Token, TokenAmount } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ammAddLiquidity } from "./lib/addLiquidity";

const main = async () => {
  const configPath = process.argv[2];
  if (!configPath) {
    throw new Error("Config file path must be provided as the first argument");
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  const baseToken = new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey(config.tokenData.mintAccount),
    config.tokenData.decimals,
    config.tokenData.symbol,
    config.tokenData.tokenName
  );

  const inputTokenAmountSOL = new TokenAmount(
    baseToken,
    config.tokenData.addQuoteAmountNumber * 10 ** 9
  );
  const inputTokenAmountCOIN = new TokenAmount(
    baseToken,
    config.tokenData.addBaseAmountNumber * 10 ** 9
  );

  const slippage = new Percent(1, 100);
  const walletTokenAccounts = await getWalletTokenAccount(
    connection,
    new PublicKey(config.tokenData.mintAuthority)
  );
  console.log({
    baseToken,
    quoteToken: DEFAULT_TOKEN.WSOL,
    targetPool: config.tokenData.poolMintAccount,
    inputTokenAmount: inputTokenAmountCOIN,
    slippage,
    walletTokenAccounts,
    wallet: myKeyPair,
  });
  await ammAddLiquidity({
    baseToken,
    quoteToken: DEFAULT_TOKEN.WSOL,
    targetPool: config.tokenData.poolMintAccount,
    inputTokenAmount: inputTokenAmountCOIN,
    slippage,
    walletTokenAccounts,
    wallet: myKeyPair,
  }).then(({ txids }) => {
    console.log("txids", txids);
  });

  await ammAddLiquidity({
    baseToken,
    quoteToken: DEFAULT_TOKEN.WSOL,
    targetPool: config.tokenData.poolMintAccount,
    inputTokenAmount: inputTokenAmountSOL,
    slippage,
    walletTokenAccounts,
    wallet: myKeyPair,
  }).then(({ txids }) => {
    console.log("txids", txids);
  });
};
main();
