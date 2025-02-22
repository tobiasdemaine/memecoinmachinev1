import json
import os
import subprocess
import sys
import time

from audit import auditAllWalletAccounts

# Check for required arguments

def execute_with_retry(command, wallet_address, max_retries=3, retry_delay=5):
    for attempt in range(max_retries):
        result = os.system(command)
        print(result)
        
        if result == 0:
            print(f"Successfully executed buy-in for wallet: {wallet_address}")
            return  # Exit the function if successful
        
        # If the command failed, print the failure message
        print(f"Attempt {attempt + 1} failed to execute buy-in for wallet: {wallet_address}")
        
        # If not the last attempt, wait and then retry
        if attempt < max_retries - 1:  
            print(f"Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
        else:
            print("Max retries reached, giving up.")


def tokenBuyIn(json_file_path):
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

    SWAP_AMOUNT = float(config["wallets"]["BASE_AMOUNT"]) / int(config["wallets"]["NUM_RECIPIENTS"]) # The amount of SOL to swap for the token
    #cli =True
    # Loop through wallets and swap all SOL for the specified token
    with open(WALLETS_FILE, 'r') as file:
        wallets = json.load(file)

        for wallet_address, wallet_file in wallets.items():
            print(f"Using wallet: {wallet_address} ({wallet_file})")
            # Load the wallet keypair
            
            # Construct the command to run the TypeScript script
            command = f"cd node && npx ts-node ./src/buyInToken.ts ../{json_file_path} ../{wallet_file}"
            print(command)
            # Execute the command
            #result = subprocess.run(command, shell=True, capture_output=True, text=True)
            execute_with_retry(command, wallet_address, 20, 3)
            
            print("snoozing for 1 second")
            time.sleep(1)
    auditAllWalletAccounts("POST TOKEN BUY IN FROM TRADING ACCOUNTS", "", config)
    print("Token buy-in process complete!")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python token_buy_in.py <jsonfile> ")
        sys.exit(1)

    json_file_path = sys.argv[1]
    tokenBuyIn(json_file_path)