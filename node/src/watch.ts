//import { Pubkey } from '@solana/solders';
import { PublicKey } from "@solana/web3.js"; // Assuming a TypeScript version of Solana's API
import * as fs from "fs";
import { connection } from "./config";

const configFilePath = process.argv[2];
if (!configFilePath) {
  throw new Error("Config file path must be provided as a runtime argument.");
}
const config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));

async function getTokenAmountsExample() {
  const solanaClient = connection;
  const marketId = new PublicKey(config.poolData.marketId);
  const baseTokenAccount = new PublicKey(config.poolData.baseVault);
  const quoteTokenAccount = new PublicKey(config.poolData.quoteVault);
  //const owner = new PublicKey(config.poolData.owner);

  console.log("marketId", marketId.toString());
  console.log("base_token_account", baseTokenAccount.toString());
  console.log("quote_token_account", quoteTokenAccount.toString());
  //console.log('owner', owner.toString());

  // Fetch token balances
  const baseTokenInfo = await solanaClient.getTokenAccountBalance(
    baseTokenAccount
  );
  const quoteTokenInfo = await solanaClient.getTokenAccountBalance(
    quoteTokenAccount
  );
  //const ownerTokenInfo = await solanaClient.getTokenAccountBalance(owner);

  console.log("base_token_info", JSON.stringify(baseTokenInfo));
  console.log("quote_token_info", JSON.stringify(quoteTokenInfo));
  //console.log('owner_token_info', JSON.stringify(ownerTokenInfo));
}

getTokenAmountsExample().catch((error) =>
  console.error("An error occurred:", error)
);
