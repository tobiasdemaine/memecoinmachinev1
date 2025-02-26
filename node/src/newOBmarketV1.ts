import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as BufferLayout from "@solana/buffer-layout";
import fs from "fs";
import BN from "bn.js";
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
  const WALLET_SECRET = JSON.parse(
    fs.readFileSync("../tokens/keys/" + kname + "-keypair.json", "utf8")
  );

  const WALLET_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(WALLET_SECRET));
  const PROGRAM_ID = new PublicKey(
    config.mode == "PROD"
      ? "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"
      : "EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj"
  ); // OpenBook V1 (Serum V3)

  const InitMarketLayout = BufferLayout.struct([
    BufferLayout.u8("instruction"), // Instruction discriminator (2 for InitMarket)
    BufferLayout.ns64("baseLotSize"),
    BufferLayout.ns64("quoteLotSize"),
    BufferLayout.ns64("feeRateBps"),
    BufferLayout.ns64("vaultSignerNonce"),
    BufferLayout.ns64("quoteDustThreshold"),
  ]);

  async function simulateAndCreateMarketV1() {
    const connection = new Connection(RPC_URL, "confirmed");

    const baseMint = new PublicKey("YOUR_BASE_MINT_ADDRESS");
    const quoteMint = new PublicKey(
      "So11111111111111111111111111111111111111112"
    ); // Wrapped SOL

    const quoteLotSizeHuman = 0.0001; // 0.0001 SOL
    const baseLotSizeHuman = 0.001; // 0.001 of your token
    const quoteDecimals = 9;
    const baseDecimals = 6;

    const quoteLotSize = Math.floor(
      quoteLotSizeHuman * Math.pow(10, quoteDecimals)
    ); // 100000 lamports
    const baseLotSize = Math.floor(
      baseLotSizeHuman * Math.pow(10, baseDecimals)
    ); // 1000 units

    // Optimized queue sizes
    const requestQueueSize = 5;
    const eventQueueSize = 20;
    const orderBookSize = 10;

    // Generate keypairs for all required accounts
    const marketKeypair = Keypair.generate();
    const requestQueueKeypair = Keypair.generate();
    const eventQueueKeypair = Keypair.generate();
    const bidsKeypair = Keypair.generate();
    const asksKeypair = Keypair.generate();
    const baseVaultKeypair = Keypair.generate();
    const quoteVaultKeypair = Keypair.generate();

    console.log("Generated Market ID:", marketKeypair.publicKey.toBase58());

    // Derive vault signer PDA (required for Serum)
    const [vaultSigner, vaultSignerNonce] = await PublicKey.findProgramAddress(
      [marketKeypair.publicKey.toBuffer()],
      PROGRAM_ID
    );

    // Create account instructions for queues and vaults
    const instructions: TransactionInstruction[] = [];

    // Rent exemptions
    const requestQueueSpace = requestQueueSize * 72 + 100; // +100 for header
    const eventQueueSpace = eventQueueSize * 56 + 100;
    const orderBookSpace = orderBookSize * 88 + 100; // Per side
    const vaultSpace = 165; // SPL token account size

    instructions.push(
      // Request Queue
      SystemProgram.createAccount({
        fromPubkey: WALLET_KEYPAIR.publicKey,
        newAccountPubkey: requestQueueKeypair.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          requestQueueSpace
        ),
        space: requestQueueSpace,
        programId: PROGRAM_ID,
      }),
      // Event Queue
      SystemProgram.createAccount({
        fromPubkey: WALLET_KEYPAIR.publicKey,
        newAccountPubkey: eventQueueKeypair.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          eventQueueSpace
        ),
        space: eventQueueSpace,
        programId: PROGRAM_ID,
      }),
      // Bids
      SystemProgram.createAccount({
        fromPubkey: WALLET_KEYPAIR.publicKey,
        newAccountPubkey: bidsKeypair.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          orderBookSpace
        ),
        space: orderBookSpace,
        programId: PROGRAM_ID,
      }),
      // Asks
      SystemProgram.createAccount({
        fromPubkey: WALLET_KEYPAIR.publicKey,
        newAccountPubkey: asksKeypair.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          orderBookSpace
        ),
        space: orderBookSpace,
        programId: PROGRAM_ID,
      }),
      // Base Vault
      SystemProgram.createAccount({
        fromPubkey: WALLET_KEYPAIR.publicKey,
        newAccountPubkey: baseVaultKeypair.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          vaultSpace
        ),
        space: vaultSpace,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Quote Vault
      SystemProgram.createAccount({
        fromPubkey: WALLET_KEYPAIR.publicKey,
        newAccountPubkey: quoteVaultKeypair.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          vaultSpace
        ),
        space: vaultSpace,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize token accounts
      Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        baseMint,
        baseVaultKeypair.publicKey,
        vaultSigner
      ),
      Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        quoteMint,
        quoteVaultKeypair.publicKey,
        vaultSigner
      )
    );

    // InitMarket instruction data
    const initMarketData = Buffer.alloc(InitMarketLayout.span);
    InitMarketLayout.encode(
      {
        instruction: 2, // InitMarket discriminator
        baseLotSize,
        quoteLotSize,
        feeRateBps: 0,
        vaultSignerNonce: vaultSignerNonce.toNumber(),
        quoteDustThreshold: 100,
      },
      initMarketData
    );

    // InitMarket instruction
    instructions.push(
      new TransactionInstruction({
        keys: [
          { pubkey: marketKeypair.publicKey, isSigner: true, isWritable: true },
          {
            pubkey: requestQueueKeypair.publicKey,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: eventQueueKeypair.publicKey,
            isSigner: false,
            isWritable: true,
          },
          { pubkey: bidsKeypair.publicKey, isSigner: false, isWritable: true },
          { pubkey: asksKeypair.publicKey, isSigner: false, isWritable: true },
          {
            pubkey: baseVaultKeypair.publicKey,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: quoteVaultKeypair.publicKey,
            isSigner: false,
            isWritable: true,
          },
          { pubkey: baseMint, isSigner: false, isWritable: false },
          { pubkey: quoteMint, isSigner: false, isWritable: false },
          { pubkey: vaultSigner, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: initMarketData,
      })
    );

    // Build the transaction
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const transaction = new Transaction({
      recentBlockhash,
      feePayer: WALLET_KEYPAIR.publicKey,
    });

    instructions.forEach((ix) => transaction.add(ix));
    const signers = [
      marketKeypair,
      requestQueueKeypair,
      eventQueueKeypair,
      bidsKeypair,
      asksKeypair,
      baseVaultKeypair,
      quoteVaultKeypair,
    ];
    transaction.sign(WALLET_KEYPAIR, ...signers);

    // Simulate the transaction
    console.log("Simulating transaction...");
    const simulationResult = await connection.simulateTransaction(transaction);

    if (simulationResult.value.err) {
      console.error("Simulation failed:", simulationResult.value.err);
      console.log("Logs:", simulationResult.value.logs);
      return;
    } else {
      console.log("Simulation succeeded!");
      console.log("Units consumed:", simulationResult.value.unitsConsumed);

      const signatures = transaction.signatures.length;
      const baseFeeLamports = signatures * 5000;
      const computeUnits = simulationResult.value.unitsConsumed || 0;
      const priorityFeeLamports = Math.floor(computeUnits / 1000);
      const totalFeeLamports = baseFeeLamports + priorityFeeLamports;
      const totalFeeSol = totalFeeLamports / LAMPORTS_PER_SOL;
      console.log(
        `Transaction Fee: ${totalFeeLamports} lamports (${totalFeeSol} SOL)`
      );
    }

    // Estimate rent cost
    const totalBytes =
      requestQueueSpace +
      eventQueueSpace +
      orderBookSpace * 2 +
      vaultSpace * 2 +
      376; // Market account
    const rentLamports = await connection.getMinimumBalanceForRentExemption(
      totalBytes
    );
    const rentSol = rentLamports / LAMPORTS_PER_SOL;
    console.log(
      `Estimated Rent Cost: ${rentLamports} lamports (${rentSol} SOL)`
    );
    /* console.log(`Total Estimated Cost: ${totalFeeSol + rentSol} SOL`);

  // Send the real transaction


  const shouldSend = true;
  if (shouldSend) {
    console.log("Sending real transaction...");
    const txSignature = await connection.sendTransaction(transaction, [WALLET_KEYPAIR, ...signers], {
      commitment: "confirmed",
    });
    await connection.confirmTransaction(txSignature, "confirmed");
    console.log("Transaction Signature:", txSignature);
    console.log("Market ID (Confirmed):", marketKeypair.publicKey.toBase58());
  } else {
    console.log("Transaction not sent (simulation only).");
    console.log("Market ID (Predicted):", marketKeypair.publicKey.toBase58());
  }*/
  }

  simulateAndCreateMarketV1().catch(console.error);
}

main();
