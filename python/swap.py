import json
import subprocess

from audit import auditWalletAccount


def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def swap_all(json_file_path, wallet_file, swapOut):
    with open(json_file_path, 'r') as f:
        config = json.load(f)
    address = run_command(f"solana-keygen pubkey {wallet_file}")
    if swapOut == "SOL":
        out = run_command(f"spl-token accounts --owner {wallet_file}")
        lines = out.splitlines()
        
        token_balance_line = lines[2].split()[1]
        token_balance = token_balance_line
        print(f"{config["metaData"]["symbol"]} Balance: {token_balance}")
        
        auditWalletAccount(address, wallet_file, "PRE SWAP ALL TOKEN FOR SOL", "", config)
        command = f"cd node && npx ts-node ./src/sellToken.ts ../{json_file_path} ../{wallet_file} {token_balance}"
        auditWalletAccount(address, wallet_file, "POST SWAP ALL TOKEN FOR SOL", "", config)
    else:
        auditWalletAccount(address, wallet_file, "PRE SWAP ALL SOL FOR TOKEN", "", config)
        command = f"cd node && npx ts-node ./src/buyInToken.ts ../{json_file_path} ../{wallet_file}"
        auditWalletAccount(address, wallet_file, "POST SWAP ALL SOL FOR TOKEN", "", config)
    run_command(command)

def swap_some(json_file_path, wallet_file, swapOut, amount):
    with open(json_file_path, 'r') as f:
        config = json.load(f)
    address = run_command(f"solana-keygen pubkey {wallet_file}")
    if swapOut == "SOL":
        auditWalletAccount(address, wallet_file, "PRE SWAP SOME TOKEN FOR SOL", amount, config)
        command = f"cd node && npx ts-node ./src/sellToken.ts ../{json_file_path} ../{wallet_file} {amount}"
        auditWalletAccount(address, wallet_file, "POST SWAP SOME TOKEN FOR SOL", amount, config)
    else:
        auditWalletAccount(address, wallet_file, "PRE SWAP SOME SOL FOR TOKEN", amount, config)
        command = f"cd node && npx ts-node ./src/buyToken.ts ../{json_file_path} ../{wallet_file} {amount}"
        auditWalletAccount(address, wallet_file, "POST SWAP SOME SOL FOR TOKEN", amount, config)
    run_command(command)