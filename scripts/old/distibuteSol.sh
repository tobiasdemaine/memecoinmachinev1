#!/bin/bash

# Ensure the required arguments are provided
if [ "$#" -lt 4 ]; then
    echo "Usage: $0 <mode> <token_symbol> <total_sol> <num_recipients>"
    echo "Modes: DEV | PROD"
    exit 1
fi

MODE=$1               # Mode: generate | distribute
TOKEN_SYMBOL=$2       # Token symbol (e.g., SOL, MYTOKEN)
TOTAL_SOL=$3          # Total SOL to distribute
NUM_RECIPIENTS=$4     # Number of wallets to generate
SOL_PER_RECIPIENT=$(bc <<< "scale=6; $TOTAL_SOL / $NUM_RECIPIENTS")
WALLETS_FILE="../wallets/${MODE}_{$TOKEN}_generated_wallets.txt"


# Ensure Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "Solana CLI not installed. Please install it first."
    exit 1
fi

# Get source wallet address
SOURCE_WALLET=$(solana address)

# Confirm before proceeding
echo "You are about to generate $NUM_RECIPIENTS wallets and distribute $TOTAL_SOL SOL evenly."
read -p "Do you want to proceed? (yes/no): " confirm
if [[ "$confirm" != "yes" ]]; then
    echo "Transaction cancelled."
    exit 1
fi

# Generate wallets and save keypairs
echo "Generating $NUM_RECIPIENTS wallets..."
> "$WALLETS_FILE"  # Clear the file if it exists
RECIPIENTS=()

for i in $(seq 1 $NUM_RECIPIENTS); do
    WALLET_FILE="wallet_$i.json"
    solana-keygen new --outfile $WALLET_FILE --no-bip39-passphrase --force > /dev/null 2>&1
    WALLET_ADDRESS=$(solana-keygen pubkey $WALLET_FILE)
    RECIPIENTS+=("$WALLET_ADDRESS")
    echo "$WALLET_ADDRESS -> $WALLET_FILE" >> "$WALLETS_FILE"
    echo "Generated wallet #$i: $WALLET_ADDRESS"
done

# Airdrop SOL to source wallet (if on devnet)
echo "Airdropping 2 SOL to source wallet (if on devnet)..."
solana airdrop 2 $SOURCE_WALLET > /dev/null 2>&1

# Distribute SOL to new wallets
for RECIPIENT in "${RECIPIENTS[@]}"; do
    echo "Sending $SOL_PER_RECIPIENT SOL to $RECIPIENT..."
    solana transfer --allow-unfunded-recipient --url devnet $RECIPIENT $SOL_PER_RECIPIENT > /dev/null 2>&1
    sleep 1  # Short delay to avoid rate limits
done

echo "Wallet generation and SOL distribution complete!"
echo "Wallets saved in $WALLETS_FILE"