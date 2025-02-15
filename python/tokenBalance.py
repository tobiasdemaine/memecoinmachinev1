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


def token_balance(json_file_path):
# Check for required arguments

    with open(json_file_path, 'r') as f:
        config = json.load(f)

    kname = config["mode"] + "_" + config['metaData']['symbol']
    WALLET_FILE = f"./tokens/keys/{kname}-keypair.json"

    # Ensure wallet file exists
    if not os.path.isfile(WALLET_FILE):
        print(f"Wallet file {WALLET_FILE} not found. Run the generate script first.")
        sys.exit(1)


    
    # Loop through wallets and swap all SOL for the specified token
    data = {}
    #print(f"Wallet Holdings: {wallet_address} ({wallet_file})")
    data["wallet"] = run_command(f"solana-keygen pubkey tokens/keys/{kname}-keypair.json")
    data["walletFile"] = WALLET_FILE
            # Load the wallet keypair
    out = run_command(f"solana balance {WALLET_FILE}")
    sol_balance = float(out.split()[0])
    #print(f"sol: {sol_balance}")
    data["sol"] = sol_balance
    out = run_command(f"spl-token accounts --owner {WALLET_FILE}")
    # Extract token balance from the output
    lines = out.splitlines()
    
    token_balance_line = lines[2].split()[1]
    token_balance = token_balance_line
    #print(f"{config["metaData"]["symbol"]}: {token_balance}")
    data["tokenBalance"] = token_balance
    return data   
    
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python walletHoldings.py <jsonfile> ")
        sys.exit(1)
    json_file_path = sys.argv[1]
    token_balance(json_file_path)