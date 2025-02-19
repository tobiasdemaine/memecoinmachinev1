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


def token_wallet_holdings(json_file_path):
# Check for required arguments

    with open(json_file_path, 'r') as f:
        config = json.load(f)

    kname = config["mode"] + "_" + config['metaData']['symbol']
    WALLETS_FILE = f"./tokens/keys/{kname}-keypair.json"
   
    # Ensure wallet file exists
    data = {}
    if not os.path.isfile(WALLETS_FILE):
        print(f"Wallet file {WALLETS_FILE} not found. Run the generate script first.")
        sys.exit(1)

       
        
    data["wallet"] = run_command(f"solana-keygen pubkey tokens/keys/{kname}-keypair.json")
    data["walletFile"] = WALLETS_FILE
    
    out = run_command(f"solana balance {WALLETS_FILE}")
    print(out)
    sol_balance = float(out.split()[0])
    
    data["sol"] = sol_balance
    out = run_command(f"spl-token accounts --owner {WALLETS_FILE}")
    
    lines = out.splitlines()
    
    raw_data = lines[2:]
    print(raw_data)
    objects = []
    for line in raw_data:
        # Convert amount to float
        print("'"+line+"'")
        l = line.split( )
        if l :
            obj = {
                "address": l[0],
                "amount": l[1]
            }
            
            # Check if the address matches either tokenmint or poolmint
            if l[0] == config["tokenData"]["mintAccount"]:
                obj["type"] = "token"
            elif l[1] == config["tokenData"]["poolMintAccount"]:
                obj["type"] = "lp"
            else:
                # If the address doesn't match either, you might want to log this or handle it differently
                obj["type"] = "lp"
            
            objects.append(obj)

    print(objects)
    data["tokenBalance"] = objects
        
    return data      

    
    
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python walletHoldings.py <jsonfile> ")
        sys.exit(1)
    json_file_path = sys.argv[1]
    token_wallet_holdings(json_file_path)