import json
import subprocess
import sys


def switch_token(json_file_path):
    with open(json_file_path, 'r') as f:
        config = json.load(f)

    kname = config["mode"] + "_" + config['metaData']['symbol']
    WALLETS_FILE = f"./tokens/wallets/{kname}_wallets.json"


    def run_command(command):
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {command}")
            print(result.stderr)
            exit(1)
        return result.stdout.strip()

    if config["mode"] == "DEV":
        run_command(f"solana config set --url devnet --keypair tokens/keys/{kname}-keypair.json")
    if config["mode"] == "PROD":
        run_command(f"solana config set --url mainnet --keypair tokens/keys/{kname}-keypair.json")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python switchToken<jsonfile> ")
        sys.exit(1)

    json_file_path = sys.argv[1]
    switch_token(json_file_path)