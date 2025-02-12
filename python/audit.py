import subprocess
import json
import os
from datetime import datetime


def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def audit(state, address, memo, config):
    kname = config["mode"] + "_" + config['metaData']['symbol']
    audit_file_path = f"tokens/{kname}.audit.json"
    if os.path.exists(audit_file_path):
        with open(audit_file_path, 'r') as file:
            var = json.load(file)
    else:
        var = []

    def get_solana_balance(address):
        result = subprocess.run(['solana', 'balance', address], stdout=subprocess.PIPE)
        return result.stdout.decode('utf-8').strip()
    
    balance = get_solana_balance(address)
    print(f"Address: {address}, Balance: {balance}, Memo: {memo}")

    out = run_command(f"spl-token accounts --owner {address}")
    # Extract token balance from the output
    lines = out.splitlines()
    
    if len(lines) > 2:
        token_balance_line = lines[2].split()[1]
    else:
        token_balance_line = "0"
    token_balance = token_balance_line
    print(f"{config["metaData"]["symbol"]}: {token_balance}")
    balance = {}
    balance["date"] = datetime.now().isoformat()
    balance["state"] = state
    balance["address"] = address
    balance["sol"] = balance
    balance[config["metaData"]["symbol"]] = token_balance
    balance["memo"] = memo

    var.append(balance)
    with open(audit_file_path, 'w') as file:
        json.dump(var, file, indent=4)

def auditBaseAccount(state, memo, config):
    base_keypair_path = "tokens/keys/base_keypair.json"
    address = run_command(f"solana-keygen pubkey {base_keypair_path}")
    audit(state, address, base_keypair_path+" | "+memo, config)

def auditTokenBaseAccount(state, memo, config):
    kname = config["mode"] + "_" + config['metaData']['symbol'] 
    base_keypair_path = f"tokens/keys/{kname}_keypair.json"
    address = run_command(f"solana-keygen pubkey {base_keypair_path}")
    audit(state, address, base_keypair_path+" | "+memo, config)

def auditWalletAccount(address, keypair_path, state, memo, config):
    audit(state, address, keypair_path+" | "+memo, config)

def auditAllWalletAccounts(state, memo, config):
    kname = config["mode"] + "_" + config['metaData']['symbol']
    WALLETS_FILE = f"./tokens/wallets/{kname}_wallets.json"
    with open(WALLETS_FILE, 'r') as file:
        wallets = json.load(file)
        for wallet_address, wallet_file in wallets.items():
            auditWalletAccount(wallet_address, wallet_file, state, memo, config)