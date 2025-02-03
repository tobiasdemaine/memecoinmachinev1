#!/bin/bash

# Set variables
MODE="DEV"
TOKEN_NAME="Little"
TOKEN_SYMBOL="LITTLE"
DECIMALS=9
METADATA_URI="https://littlecapitalist.com/metadata.json"  # Replace with real URI

# Ensure Solana CLI and SPL Token CLI are installed
if ! command -v solana &> /dev/null || ! command -v spl-token &> /dev/null
then
    echo "Solana CLI or SPL Token CLI is not installed. Please install them first."
    exit 1
fi

# Set network to devnet
solana config set --url devnet

# Generate a keypair for the mint authority
echo "Generating mint authority keypair..."
solana-keygen new --outfile {$MODE}_{$TOKEN_SYMBOL}_mint-authority.json --force
MINT_AUTHORITY=$(solana-keygen pubkey mint-authority.json)
echo "Mint authority public key: $MINT_AUTHORITY"

if [ "$MODE" == "DEV" ]
then
    # Airdrop SOL to the mint authority on devnet
    echo "Airdropping 2 SOL to mint authority..."
    solana airdrop 2 $MINT_AUTHORITY
fi
if [ "$MODE" == "PROD" ]
then
    # transfer some sol to mint authority
fi

# Airdrop SOL to the mint authority on devnet
echo "Airdropping 2 SOL to mint authority..."
solana airdrop 2 $MINT_AUTHORITY

# Generate a keypair for the token mint
echo "Generating token mint keypair..."
solana-keygen new --outfile mint-keypair.json --force
MINT_ACCOUNT=$(solana-keygen pubkey mint-keypair.json)
echo "Token mint address: $MINT_ACCOUNT"

# Create the token mint account with metadata enabled
echo "Creating token mint account..."
spl-token create-token --mint-authority $MINT_AUTHORITY --decimals $DECIMALS --enable-metadata --name $TOKEN_NAME --symbol $TOKEN_SYMBOL --uri $METADATA_URI --mint $MINT_ACCOUNT

# Create a token account
echo "Creating token account..."
TOKEN_ACCOUNT=$(spl-token create-account $MINT_ACCOUNT | grep -oP 'Creating account \K\S+')
echo "Token account created: $TOKEN_ACCOUNT"

# Mint initial supply
INITIAL_SUPPLY=1000000
echo "Minting $INITIAL_SUPPLY tokens to token account..."
spl-token mint $MINT_ACCOUNT $INITIAL_SUPPLY $TOKEN_ACCOUNT

# Use Metaplex to update metadata
echo "Updating metadata using Metaplex..."
metaplex tokens update-metadata --mint $MINT_ACCOUNT --name "$TOKEN_NAME" --symbol "$TOKEN_SYMBOL" --uri "$METADATA_URI"

echo "Token creation complete with metadata!"
echo "Token Mint Address: $MINT_ACCOUNT"
echo "Token Account Address: $TOKEN_ACCOUNT"
echo "Metadata URI: $METADATA_URI"
