import json
import os
import subprocess
import sys
import time

from getAllSolFromWallet import getAllSolFromWallet
from tokenFarming.python.audit import auditAllWalletAccounts, auditTokenBaseAccount

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
# Get the public key of the wallet file via solana CLI
def get_wallet_pubkey():
    command = f"solana-keygen pubkey ./tokens/keys/{kname}-keypair.json"
    return run_command(command)

# Example usage
wallet_pubkey = get_wallet_pubkey()
print(f"Wallet public key: {wallet_pubkey}")
# Ensure wallet file exists
if not os.path.isfile(WALLETS_FILE):
    print(f"Wallet file {WALLETS_FILE} not found. Run the generate script first.")
    sys.exit(1)
auditTokenBaseAccount("PRE GET ALL SOL FROM TRADING ACCOUNTS", "", config)
auditAllWalletAccounts("PRE GET ALL SOL FROM TRADING ACCOUNTS", "", config)
# Loop through wallets and swap all SOL for the specified token
with open(WALLETS_FILE, 'r') as file:
    wallets = json.load(file)

    for wallet_address, wallet_file in wallets.items():
        getAllSolFromWallet(wallet_file, wallet_pubkey)
        time.sleep(1)
auditTokenBaseAccount("POST GET ALL SOL FROM TRADING ACCOUNTS", "", config)
auditAllWalletAccounts("POST GET ALL SOL FROM TRADING ACCOUNTS", "", config)

        