#!/bin/bash

# Ensure Raydium CLI is installed
if ! command -v raydium &> /dev/null; then
    echo "Raydium CLI not installed. Please install it first."
    exit 1
fi

# Check for required arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <token_mint_address> <wallets_file>"
    echo "Example: $0 TokenMintAddressForRAY"
    exit 1
fi

TOKEN_MINT=$1  # The token you want to swap into (Example: RAY token mint address)
WALLETS_FILE=$2

# Ensure wallet file exists
if [ ! -f "$WALLETS_FILE" ]; then
    echo "Wallet file $WALLETS_FILE not found. Run the generate script first."
    exit 1
fi

# Loop through wallets and swap all SOL for the specified token
while IFS=" " read -r WALLET_ADDRESS WALLET_FILE; do
    echo "Using wallet: $WALLET_ADDRESS ($WALLET_FILE)"

    # Set the active wallet
    export SOLANA_WALLET=$WALLET_FILE

    # Get the available SOL balance
    SOL_BALANCE=$(solana balance | awk '{print $1}')

    # Ensure wallet has sufficient SOL to swap
    if (( $(echo "$SOL_BALANCE > 0.01" | bc -l) )); then
        # Subtract small amount for transaction fees (keep 0.01 SOL for fees)
        SWAP_AMOUNT=$(echo "$SOL_BALANCE - 0.01" | bc)

        echo "Swapping $SWAP_AMOUNT SOL for $TOKEN_MINT..."
        raydium swap --from SOL --to $TOKEN_MINT --amount $SWAP_AMOUNT --wallet $WALLET_FILE --slippage 0.5 --network devnet

        echo "Swap completed for wallet: $WALLET_ADDRESS"
    else
        echo "Insufficient SOL in wallet: $WALLET_ADDRESS (Balance: $SOL_BALANCE SOL)"
    fi

    sleep 2  # Avoid rate limits
done < "$WALLETS_FILE"

echo "All swaps completed!"