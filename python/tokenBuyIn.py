import json
import os
import sys
from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.publickey import PublicKey
from solana.transaction import Transaction
from solana.system_program import TransferParams, transfer
import time

# Check for required arguments
if len(sys.argv) < 2:
    print("Usage: python token_buy_in.py <jsonfile> ")
    sys.exit(1)

json_file_path = sys.argv[1]
with open(json_file_path, 'r') as f:
    config = json.load(f)

TOKEN_MINT = config["tokenData"]["mintAccount"] # The token you want to swap into (Example: RAY token mint address)
kname = config["mode"] + "_" + config['metaData']['symbol']
WALLETS_FILE = "../tokens/wallets/{kname}_wallets.json"

# Ensure wallet file exists
if not os.path.isfile(WALLETS_FILE):
    print(f"Wallet file {WALLETS_FILE} not found. Run the generate script first.")
    sys.exit(1)

network = "mainnet"
if(config["mode"] == "DEV"):
    network = "devnet"

SWAP_AMOUNT = float(config["wallets"]["BASE_AMOUNT"]) / int(config["wallets"]["NUM_RECIPIENTS"]) # The amount of SOL to swap for the token
#cli =True
# Loop through wallets and swap all SOL for the specified token
with open(WALLETS_FILE, 'r') as file:
    for line in file:
        wallet_address, wallet_file = line.strip().split("->")
        print(f"Using wallet: {wallet_address} ({wallet_file})")
        # Load the wallet keypair
        with open("./tokens/wallets/"+wallet_file, 'r') as wf:
            secret_key = wf.read().strip().encode('utf-8')
        #wallet = Keypair.from_secret_key(secret_key)

        # Construct the command to run the TypeScript script
        command = f"cd ./node && ts-node ./src/buyInToken.ts ../{json_file_path} {secret_key}"

        # Execute the command
        result = os.system(command)

        # Check if the command was successful
        if result != 0:
            print(f"Failed to execute buy-in for wallet: {wallet_address}")
        else:
            print(f"Successfully executed buy-in for wallet: {wallet_address}")
        print("snoozing for 1 second")
        time.sleep(1)

print("Token buy-in process complete!")