import json
import os
import subprocess
import sys
import time

from createBaseAccount import createBaseAccount

def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()


def master_wallet_holdings(mode):
# Check for required arguments

   
    WALLETS_FILE = f"./tokens/keys/base-keypair.json"

    # Ensure wallet file exists
    data = {}
    if not os.path.isfile(WALLETS_FILE):
        print(f"Wallet file {WALLETS_FILE} not found. Run the generate script first.")
        createBaseAccount()

       
    
    data["wallet"] = run_command(f"solana-keygen pubkey tokens/keys/base-keypair.json")
    data["walletFile"] = WALLETS_FILE
    url = "m"
    if mode == "DEV":
        url = "d"
    
    out = run_command(f"solana balance {WALLETS_FILE} --url {url}")
    print(out)
    sol_balance = float(out.split()[0])
    
    data["sol"] = sol_balance
    
    print(data)

    return data
    
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python walletHoldings.py <mode> ")
        sys.exit(1)
    mode = sys.argv[1]
    master_wallet_holdings(mode)