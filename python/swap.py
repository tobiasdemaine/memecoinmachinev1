import json
import subprocess


def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def swallall(json_file_path, wallet_file, swapOut):
    with open(json_file_path, 'r') as f:
        config = json.load(f)

    if swapOut == "SOL":
        
        out = run_command(f"spl-token accounts --owner {wallet_file}")
        # Extract token balance from the output
        lines = out.splitlines()
        
        token_balance_line = lines[2].split()[1]
        token_balance = token_balance_line
        print(f"{config["metaData"]["symbol"]} Balance: {token_balance}")
    
        command = f"cd node && npx ts-node ./src/sellToken.ts ../{json_file_path} ../{wallet_file} {token_balance}"
    else:
        command = f"cd node && npx ts-node ./src/buyInToken.ts ../{json_file_path} ../{wallet_file}"
    
    run_command(command)

def swallall(json_file_path, wallet_file, swapOut, amount):
    with open(json_file_path, 'r') as f:
        config = json.load(f)

    if swapOut == "SOL":
        command = f"cd node && npx ts-node ./src/sellToken.ts ../{json_file_path} ../{wallet_file} {amount}"
    else:
        command = f"cd node && npx ts-node ./src/buyToken.ts ../{json_file_path} ../{wallet_file} {amount}"
    run_command(command)