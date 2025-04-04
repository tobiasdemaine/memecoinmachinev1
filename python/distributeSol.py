import os
import subprocess
import time
import json
import sys

from audit import auditAllWalletAccounts

def execute_with_retry(command, max_retries=3, retry_delay=5):
    for attempt in range(max_retries):
        result = os.system(command)
        print(result)
        
        if result == 0:
            print(f"Successfully executed : {command}")
            return  # Exit the function if successful
        
        # If the command failed, print the failure message
        print(f"Attempt {attempt + 1} failed execute :  {command}")
        
        # If not the last attempt, wait and then retry
        if attempt < max_retries - 1:  
            print(f"Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
        else:
            print("Max retries reached, giving up.")

def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def distributSol(json_file_path):
    with open(json_file_path, 'r') as f:
        config = json.load(f)

    NUM_RECIPIENTS = int(config["wallets"]["NUM_RECIPIENTS"])
    SOL_PER_RECIPIENT = float(config["wallets"]["BASE_AMOUNT"]) / NUM_RECIPIENTS

    kname = config["mode"] + "_" + config['metaData']['symbol']


    # Generate wallets and save keypairs
    print(f"Generating {NUM_RECIPIENTS} wallets...")
    RECIPIENTS = []
    wallets = {}
    mint_account = config["tokenData"]["mintAccount"]
    for i in range(1, NUM_RECIPIENTS + 1):
        command = run_command(f"solana-keygen new --outfile tokens/wallets/{kname}_wallet_{i}.json --force --no-passphrase")
        wallet_address = run_command(f"solana-keygen pubkey tokens/wallets/{kname}_wallet_{i}.json")
        
        command = f"spl-token create-account --fee-payer tokens/keys/{kname}-keypair.json --owner {wallet_address} {mint_account}"
        execute_with_retry(command, 10, 1)
        #wsol_account = run_command(f"spl-token create-account --fee-payer tokens/keys/{kname}-keypair.json --owner {wallet_address} So11111111111111111111111111111111111111112")
        RECIPIENTS.append(wallet_address)
        wallets[f"{wallet_address}"] = f"tokens/wallets/{kname}_wallet_{i}.json"
    
        print(f"Generated wallet #{i}: {wallet_address}")
    
    with open(f"tokens/wallets/{kname}_wallets.json", 'w') as f:
        json.dump(wallets, f, indent=4)

   
    # Distribute SOL to new wallets
    for recipient in RECIPIENTS:
        print(f"Sending {SOL_PER_RECIPIENT} SOL to {recipient}...")
        command = f"solana transfer {recipient} {SOL_PER_RECIPIENT} --keypair tokens/keys/{kname}-keypair.json --allow-unfunded-recipient"
        result = run_command(command)
        print(result)
        time.sleep(1)  # Short delay to avoid rate limits

    

    #auditAllWalletAccounts("POST DISTRIBUTE SOL TO TRADING ACCOUNTS", "", config)
    print("Wallet generation and SOL distribution complete!")
    print(f"Wallets saved in tokens/wallets/{kname}_wallets.json")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 distributeSol.py <JSON_FILE>")
        sys.exit(1)

    json_file_path = sys.argv[1]
    distributSol(json_file_path)