import { Connection, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import {
  OpenBookDex,
  createOpenBookMarket,
  MarketParams,
} from "@openbook-dex/openbook";
import { Market, OpenOrders } from '@project-serum/serum';
import { DEFAULT_TOKEN, myKeyPair } from "./config";
import { DEVNET_PROGRAM_ID, MAINNET_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { MarketOptions } from "@project-serum/serum/lib/market";
///import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Replace these with your actual keypairs and public keys
const payerKeypair = myKeyPair; // This should be your wallet keypair
const connection = new Connection("devnet"); // Use 'mainnet-beta' for production
const configPath = process.argv[2];
if (!configPath) {
  throw new Error("Config file path must be provided as the first argument");
}
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const RAYDIUM_PROGRAM_ID =
    config.mode == "PROD" ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;

const serumProgramId = new PublicKey('...'); 

async function createOpenbookMarket() {
  const mo : MarketOptions = {

  }
  const options = {
    // Base mint address
    baseMint: new PublicKey(config.tokenData.mintAccount),
    // Quote mint address
    quoteMint: DEFAULT_TOKEN.WSOL.programId,
    // The lot size of the base token
    baseLotSize: config.tokenData.lotSize,
    // The lot size of the quote token
    quoteLotSize: config.tokenData.lotSize,
    // Market maker can only make orders at this tick size
    tickSize: config.tokenData.tickSize,
    // If true, the market will be a spot market, otherwise it's a perpetual market
    isSpot: true,
    // Authority to manage the market
    marketAuthority: payerKeypair.publicKey,
    // Optional, if you want a specific market name
    name: config.tokenData.symbol + "-" + DEFAULT_TOKEN.WSOL.symbol,
    eventQueueLength: config.tokenData.eventQueueLength, // Number of events the queue can hold
    requestQueueLength: config.tokenData.requestQueueLength, // Number of requests the queue can hold
    bidsSize: config.tokenData.bidsSize, // Size of the bids orderbook, in bytes
    asksSize: config.tokenData.asksSize, // Size of the asks orderbook, in bytes
  };
    const market = await Market.

   await market.initialize(connection, payerKeypair, { 

        // ... necessary parameters for initialization

    });



    // Return the market address

    return market.address;

}



// Example usage:




async function createMarket() {
  const openBookDex = new OpenBookDex(connection, payerKeypair);

  // Define market parameters
  const marketParams: MarketParams = {
    // Base mint address
    baseMint: new PublicKey(config.tokenData.mintAccount),
    // Quote mint address
    quoteMint: DEFAULT_TOKEN.WSOL.programId,
    // The lot size of the base token
    baseLotSize: config.tokenData.lotSize,
    // The lot size of the quote token
    quoteLotSize: config.tokenData.lotSize,
    // Market maker can only make orders at this tick size
    tickSize: config.tokenData.tickSize,
    // If true, the market will be a spot market, otherwise it's a perpetual market
    isSpot: true,
    // Authority to manage the market
    marketAuthority: payerKeypair.publicKey,
    // Optional, if you want a specific market name
    name: config.tokenData.symbol + "-" + DEFAULT_TOKEN.WSOL.symbol,
    eventQueueLength: config.tokenData.eventQueueLength, // Number of events the queue can hold
    requestQueueLength: config.tokenData.requestQueueLength, // Number of requests the queue can hold
    bidsSize: config.tokenData.bidsSize, // Size of the bids orderbook, in bytes
    asksSize: config.tokenData.asksSize, // Size of the asks orderbook, in bytes
  };

  try {
    const market = await createOpenBookMarket(
      connection,
      payerKeypair,
      marketParams
    );
    console.log("Market created successfully:", market.address.toBase58());
    config.tokenData.targetMarketId = market.address.toBase58();

    config.tokenData.market = {
      RequestQueue: market.requestQueue.toBase58(),
      EventQueue: market.eventQueue.toBase58(),
      Bids: market.bids.toBase58(),
      Asks: market.asks.toBase58(),
      BaseVault: market.baseVault.toBase58(),
      QuoteVault: market.quoteVault.toBase58(),
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    // You might want to save these addresses for future reference
    console.log("Request Queue:", market.requestQueue.toBase58());
    console.log("Event Queue:", market.eventQueue.toBase58());
    console.log("Bids:", market.bids.toBase58());
    console.log("Asks:", market.asks.toBase58());
    console.log("Base Vault:", market.baseVault.toBase58());
    console.log("Quote Vault:", market.quoteVault.toBase58());
  } catch (error) {
    console.error("Failed to create market:", error);
  }
}

createMarket();
