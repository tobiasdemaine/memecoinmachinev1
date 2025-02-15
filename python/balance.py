import subprocess
import sys

def get_balance(keypath):
    balance = get_balance(keypath)
    if balance is not None:
        print(f"Balance for {keypath}: {balance}")
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
        print("Usage: python baseBalance.py <token.json>")
        sys.exit(1)

    keypath = sys.argv[1]
    get_balance(keypath)