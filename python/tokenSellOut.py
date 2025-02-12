import json
import os
import subprocess
import sys
import time

def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()


# Check for required arguments
if len(sys.argv) < 2:
    print("Usage: python alletHoldinggs.py <jsonfile> ")
    sys.exit(1)

json_file_path = sys.argv[1]
with open(json_file_path, 'r') as f:
    config = json.load(f)

TOKEN_MINT = config["tokenData"]["mintAccount"] # The token you want to swap into (Example: RAY token mint address)
kname = config["mode"] + "_" + config['metaData']['symbol']
WALLETS_FILE = f"./tokens/wallets/{kname}_wallets.json"

# Ensure wallet file exists
if not os.path.isfile(WALLETS_FILE):
    print(f"Wallet file {WALLETS_FILE} not found. Run the generate script first.")
    sys.exit(1)

network = "mainnet"
if(config["mode"] == "DEV"):
    network = "devnet"

# Loop through wallets and swap all SOL for the specified token
with open(WALLETS_FILE, 'r') as file:
    wallets = json.load(file)

    for wallet_address, wallet_file in wallets.items():
        print(f"Wallet Holdings: {wallet_address} ({wallet_file})")
        # Load the wallet keypair
        out = run_command(f"spl-token accounts --owner {wallet_file}")
        # Extract token balance from the output
        lines = out.splitlines()
        
        token_balance_line = lines[2].split()[1]
        token_balance = token_balance_line
        print(f"{config["metaData"]["symbol"]} Balance: {token_balance}")
       
        command = f"cd node && npx ts-node ./src/sellToken.ts ../{json_file_path} ../{wallet_file} {token_balance}"
        result = os.system(command)
        print(result)
        
        print("-")
        
 