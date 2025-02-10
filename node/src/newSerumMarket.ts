// Import necessary modules
import * as fs from 'fs';

import { Connection, PublicKey, Transaction, SystemProgram, Keypair, TransactionInstruction } from '@solana/web3.js';
import { myKeyPair } from './config';
import { DEVNET_PROGRAM_ID, MAINNET_PROGRAM_ID } from '@raydium-io/raydium-sdk';



const payerKeypair = myKeyPair; // This should be your wallet keypair
const connection = new Connection("devnet"); // Use 'mainnet-beta' for production
const configPath = process.argv[2];
if (!configPath) {
  throw new Error("Config file path must be provided as the first argument");
}
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const PROGRAM_ID =
    config.mode == "PROD" ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;




// Function to create a new openbook market

async function createOpenbookMarket(connection, payer, baseToken, quoteToken, marketParams) {

    // Create a new market account

    const marketKeypair = Keypair.generate();

    const marketAccount = await createAccount(connection, payer, marketKeypair, SystemProgram.programId, 0);



    // Construct the market creation instruction

    const createMarketInstruction = new TransactionInstruction({

        keys: [

            { pubkey: marketKeypair.publicKey, isSigner: true, isWritable: true }, // Market account

            { pubkey: baseToken, isSigner: false, isWritable: false }, // Base token

            { pubkey: quoteToken, isSigner: false, isWritable: false }, // Quote token

            { pubkey: payer.publicKey, isSigner: true, isWritable: true }, // Payer

        ],

        programId: PROGRAM_ID,

        data: Buffer.from( )

    });



    // Create the transaction and sign

    const transaction = new Transaction().add(createMarketInstruction);

    await connection.sendTransaction(transaction, [payer]);



    return marketKeypair.publicKey; // Return the market account address

}



// Helper function to create a new account

async function createAccount(connection, payer, keypair, programId, lamports) {

    const createAccountInstruction = SystemProgram.createAccount({

        fromPublicKey: payer.publicKey,

        newAccountPubkey: keypair.publicKey,

        lamports,

        space: 0, // Adjust based on your market account size

        programId

    });

    const transaction = new Transaction().add(createAccountInstruction);

    await connection.sendTransaction(transaction, [payer]);

    return keypair.publicKey;

}



// Example usage:

const connection = new Connection('https://api.mainnet-beta.solana.com');

const payer = // Your wallet keypair;

const baseToken = new PublicKey('...'); // Base token address

const quoteToken = new PublicKey('...'); // Quote token address



createOpenbookMarket(connection, payer, baseToken, quoteToken, { priceTickSize: 0.00001, minOrderSize: 1 }) // Create market

    .then(marketAddress => console.log('Market address:', marketAddress));
