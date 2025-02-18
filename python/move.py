import subprocess


def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def move_sol_to_wallet(json_file_path, walletfrom, addressto, amount):
    command = f"solana transfer {addressto} {amount} --keypair {walletfrom} --allow-unfunded-recipient"
    result = run_command(command)
    print(result)

def move_token_to_wallet(json_file_path, walletfrom, addressto, amount):
    with open(json_file_path, 'r') as f:
        config = json.load(f)

    command = f"spl-token transfer {config["tokenData"]["mintAccount"]} {amount} {addressto} --owner {walletfrom}"
    result = run_command(command)
    print(result)