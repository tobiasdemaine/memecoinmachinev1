import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import fs from "fs";
import { Market } from "@project-serum/serum";

async function main() {
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
  if (!configPath) {
    throw new Error("Config file path must be provided as the first argument");
  }

  // Replace with your RPC endpoint and wallet keypair
  const RPC_URL = config.mode == "PROD" ? config.RPC_MAIN : config.RPC_DEV;
  const kname = config.mode + "_" + config.metaData.symbol;

  const serumProgramId = new PublicKey(
    config.mode == "PROD"
      ? "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"
      : "EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj"
  ); // OpenBook V1 (Serum V3)

  // Load wallet
  const secretKey = JSON.parse(
    JSON.parse(
      fs.readFileSync("../tokens/keys/" + kname + "-keypair.json", "utf8")
    )
  );
  const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));

  // Constants
  const connection = new Connection(RPC_URL, "confirmed");
  const baseMint = new PublicKey(config.tokenData.mintAccount); // Your token mint
  const quoteMint = new PublicKey(
    "So11111111111111111111111111111111111111112"
  );

  async function createMarket() {
    console.log("Creating OpenDEX Serum V3 Market...");

    const baseLotSize = 1; // Replace with appropriate base lot size
    const quoteLotSize = 1; // Replace with appropriate quote lot size
    const feeRateBps = 0; // Maker fee in basis points
    const requestQueueSpace = 1024; // Size of request queue in bytes
    const eventQueueSpace = 1024; // Size of event queue in bytes
    const orderBookSpace = 100; // Size of order book

    const { transaction, signers, market } =
      await Market.makeCreateMarketTransaction(
        connection,
        payer,
        baseMint,
        quoteMint,
        baseLotSize,
        quoteLotSize,
        feeRateBps,
        requestQueueSpace,
        eventQueueSpace,
        orderBookSpace,
        payer.publicKey, // Fee payer
        payer.publicKey, // Market authority
        serumProgramId
      );

    const tx = new Transaction().add(transaction);
    const txId = await sendAndConfirmTransaction(connection, tx, [
      payer,
      ...signers,
    ]);

    console.log("Market created successfully:", txId);
    console.log("Market Address:", market.publicKey.toString());
  }

  createMarket().catch(console.error);
}

main();
