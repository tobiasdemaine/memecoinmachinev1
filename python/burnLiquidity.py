import json
import sys
from tokenwalletHoldings import token_wallet_holdings
import subprocess

def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def burnLiquidity(json_file_path):
    with open(json_file_path, 'r') as f:
        config = json.load(f)
        
    kname = config["mode"] + "_" + config['metaData']['symbol']

    keyPath = f"tokens/keys/{kname}-keypair.json"
    print(keyPath)
    holdings = token_wallet_holdings(json_file_path)
    print("-")
    print(holdings["tokenBalance"])
    result = next((obj for obj in holdings["tokenBalance"] if obj.get("type") == "lp"), None)
    command = f"spl-token accounts  {result["address"]}  --addresses-only --owner {keyPath}"
    print(command)
    res = run_command(command)
    print(res)

    if(result):
        command = f"spl-token burn {res} {result["amount"]} --owner {keyPath}"
        print(command)
        result = run_command(command)
        print(result)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python createToken.py <config_file>")
        exit(1)
    json_file_path = sys.argv[1]
    burnLiquidity(json_file_path)