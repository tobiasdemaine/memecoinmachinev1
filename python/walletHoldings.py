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


def wallet_holdings(json_file_path):
# Check for required arguments

    with open(json_file_path, 'r') as f:
        config = json.load(f)

    TOKEN_MINT = config["tokenData"]["mintAccount"]
    kname = config["mode"] + "_" + config['metaData']['symbol']
    WALLETS_FILE = f"./tokens/wallets/{kname}_wallets.json"

    # Ensure wallet file exists
    if not os.path.isfile(WALLETS_FILE):
        print(f"Wallet file {WALLETS_FILE} not found. Run the generate script first.")
        sys.exit(1)

 

    walletS = []
    with open(WALLETS_FILE, 'r') as file:
        wallets = json.load(file)

        for wallet_address, wallet_file in wallets.items():
            data = {}
            
            data["wallet"] = wallet_address
            data["walletFile"] = wallet_file
            
            
            out = run_command(f"solana balance {wallet_file}")
            print(out)
            sol_balance = float(out.split()[0])
            
            data["sol"] = sol_balance
            out = run_command(f"spl-token accounts --owner {wallet_file}")
            
            lines = out.splitlines()
            
            token_balance_line = lines[2].split()[1]
            token_balance = token_balance_line
            print(token_balance)
            data["tokenBalance"] = token_balance
            walletS.append(data)

    return walletS  
    
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python walletHoldings.py <jsonfile> ")
        sys.exit(1)
    json_file_path = sys.argv[1]
    wallet_holdings(json_file_path)