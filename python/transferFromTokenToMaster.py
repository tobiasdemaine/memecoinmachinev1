import json
import subprocess
import sys

from getAllSolFromWallet import getAllSolFromWallet


def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def transferFromTokenToMaster(json_filePath):
    
    with open(json_file_path, 'r') as f:
        config = json.load(f)
    kname = config["mode"] + "_" + config['metaData']['symbol']
    baseAccount = run_command(f"solana-keygen pubkey tokens/keys/base-keypair.json")
    getAllSolFromWallet(f"tokens/keys/{kname}-keypair.json", baseAccount)

if __name__ == "__main__":
     # Extract mode and symbol values
    if len(sys.argv) < 2:
        print("Usage: python watchPool.py <jsonfile> ")
        sys.exit(1)   
    json_file_path = sys.argv[1]
   
    transferFromTokenToMaster(json_file_path)