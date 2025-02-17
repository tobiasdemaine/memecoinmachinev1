import subprocess
import sys

def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def get_token_balance(address):
    out = run_command(f"spl-token accounts --owner {address}")
    # Extract token balance from the output
    lines = out.splitlines()
    token_balance_line = lines[2].split()[1]
    token_balance = token_balance_line
    return token_balance
    
def get_balance(keypath):
    try:
        result = subprocess.run(
            ['solana', 'balance', keypath],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error occurred: {e.stderr}", file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python balance.py <token.json>")
        sys.exit(1)

    keypath = sys.argv[1]
    get_balance(keypath)