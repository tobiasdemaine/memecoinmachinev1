import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { OpenBookV2Client } from "@openbook-dex/openbook-v2";
import fs from "fs";

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
  if (!configPath) {
    throw new Error("Config file path must be provided as the first argument");
  }

  // Replace with your RPC endpoint and wallet keypair
  const RPC_URL = config.mode == "PROD" ? config.RPC_MAIN : config.RPC_DEV;
  const kname = config.mode + "_" + config.metaData.symbol;
  const WALLET_SECRET = JSON.parse(
    fs.readFileSync("../tokens/keys/" + kname + "-keypair.json", "utf8")
  );

  const WALLET_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(WALLET_SECRET));

  const PROGRAM_ID = new PublicKey(
    "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb"
  ); // OpenBook V2 program ID

  async function createMarket() {
    // Connection and provider setup
    const connection = new Connection(RPC_URL, "confirmed");
    const wallet = new Wallet(WALLET_KEYPAIR);
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    // Initialize OpenBook client
    const client = new OpenBookV2Client(provider, PROGRAM_ID);

    // Define market parameters
    const baseMint = new PublicKey(config.tokenData.mintAccount); // Your token mint
    const quoteMint = new PublicKey(
      "So11111111111111111111111111111111111111112"
    ); // Wrapped SOL
    const name = config.tokenData.symbol + "-SOL"; // Market name

    const [marketId] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("openbook-v2", "utf8"),
        baseMint.toBuffer(),
        quoteMint.toBuffer(),
      ],
      PROGRAM_ID
    );
    console.log("Derived Market ID:", marketId.toBase58());

    const quoteLotSize = new BN(
      Math.floor(config.tokenData.tickSize * Math.pow(10, 9))
    );
    const baseLotSize = new BN(
      Math.floor(
        config.tokenData.lotSize * Math.pow(10, config.tokenData.decimals)
      )
    );
    // Create market instruction
    const [instructions, signers] = await client.createMarketIx(
      wallet.publicKey, // Payer
      name, // Market name
      quoteMint, // Quote token mint
      baseMint, // Base token mint
      quoteLotSize, // e.g., 100000 for 0.0001 SOL
      baseLotSize, // e.g., 1000 for 0.001 token
      new BN(0), // Maker fee (0 for no fees)
      new BN(0), // Taker fee (0 for no fees)
      new BN(0), // Time expiry (0 for perpetual)
      null, // Oracle A (optional)
      null, // Oracle B (optional)
      null, // Open orders admin (optional)
      null, // Consume events admin (optional)
      null // Close market admin (optional)
    );

    // Send and confirm transaction
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const message = new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash,
      instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);
    transaction.sign([WALLET_KEYPAIR, ...signers]);

    // Simulate the transaction
    console.log("Simulating transaction...");
    const simulationResult = await connection.simulateTransaction(transaction, {
      sigVerify: false, // Optional: skip signature verification
      commitment: "confirmed",
    });

    if (simulationResult.value.err) {
      console.error("Simulation failed:", simulationResult.value.err);
      console.log("Logs:", simulationResult.value.logs);
      return;
    } else {
      console.log("Simulation succeeded!");
      console.log("Units consumed:", simulationResult.value.unitsConsumed);
      console.log("Logs:", simulationResult.value.logs);

      // Calculate transaction fee
      const signatures = transaction.signatures.length; // Number of signatures
      const baseFeeLamports = signatures * 5000; // 5,000 lamports per signature
      const computeUnits = simulationResult.value.unitsConsumed || 0;
      const priorityFeeLamports = Math.floor(computeUnits / 1000); // Example: 1 lamport per 1,000 units
      const totalFeeLamports = baseFeeLamports + priorityFeeLamports;
      const totalFeeSol = totalFeeLamports / LAMPORTS_PER_SOL;

      console.log(`Transaction Fee:`);
      console.log(`- Signatures: ${signatures}`);
      console.log(
        `- Base Fee: ${baseFeeLamports} lamports (${
          baseFeeLamports / LAMPORTS_PER_SOL
        } SOL)`
      );
      console.log(
        `- Priority Fee: ${priorityFeeLamports} lamports (${
          priorityFeeLamports / LAMPORTS_PER_SOL
        } SOL)`
      );
      console.log(
        `- Total Fee: ${totalFeeLamports} lamports (${totalFeeSol} SOL)`
      );
    }
    // Estimate rent cost (approximate sizes in bytes)
    console.log("Sending real transaction...");
    const txSignature = await client.sendAndConfirmTransaction(instructions, {
      additionalSigners: signers,
    });
    console.log("Transaction Signature:", txSignature);
    console.log("Market ID (Confirmed):", marketId.toBase58());

    // Optionally fetch transaction details to verify
    const txDetails = await connection.getTransaction(txSignature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (txDetails?.meta?.logMessages) {
      console.log("Transaction Logs:", txDetails.meta.logMessages);
    }
    config.tokenData.targetMarketId = marketId.toBase58();

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Config file updated with MarketID.");
  }

  createMarket().catch(console.error);
};

main();
