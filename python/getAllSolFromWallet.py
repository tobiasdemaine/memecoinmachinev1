import json
import subprocess
import sys

from tokenFarming.python.audit import auditWalletAccount

def run_command(command):
    """Run a shell command and return its output as a string."""
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {command}")
        print(e.stderr.strip())
        sys.exit(1)

def get_sender_wallet():
    """Fetch the Solana keypair path from the CLI config."""
    config_output = run_command("solana config get")
    for line in config_output.split("\n"):
        if "Keypair Path" in line:
            return line.split(":")[1].strip()
    return None

def get_public_key(walletpath):
    """Fetch the public key from the specified wallet path file."""
    public_key_output = run_command(f"solana-keygen pubkey {walletpath}")
    return public_key_output.strip()

def get_balance(wallet):
    """Fetch the SOL balance of the specified wallet."""
    balance_output = run_command(f"solana balance --keypair {wallet}")
    return float(balance_output.split()[0])

def get_rent_exempt_balance():
    """Fetch the minimum rent-exempt balance required for an account."""
    rent_output = run_command("solana rent 0")
    for line in rent_output.split("\n"):
        if "Minimum balance" in line:
            return float(line.split()[-1])
    return 0.002  # Default fallback

def transfer_sol(sender_wallet, recipient_wallet, amount):
    """Transfer the calculated SOL amount from sender to recipient."""
    print(f"\nTransferring {amount:.6f} SOL from {sender_wallet} to {recipient_wallet}...")
    #confirmation = input("Are you sure? (y/n): ").strip().lower()
    #if confirmation != 'y':
    #    print("Transfer cancelled.")
    #    sys.exit(0)
    transfer_cmd = f"solana transfer {recipient_wallet} {amount} --keypair {sender_wallet} --allow-unfunded-recipient"
    #transfer_cmd = f"solana transfer --allow-unfunded-recipient --keypair {sender_wallet} {recipient_wallet} {amount} --fee-payer {sender_wallet}"
    run_command(transfer_cmd)
    print(f"✅ Successfully transferred {amount:.6f} SOL to {recipient_wallet}.")

def getAllSolFromWallet(sender_wallet, recipient_wallet):
    balance = get_balance(sender_wallet)
    rent_exempt_balance = get_rent_exempt_balance()

    amount_to_send = balance - rent_exempt_balance
    if amount_to_send <= 0:
        print("❌ Insufficient funds to transfer after leaving the rent-exempt balance.")
    else:
        transfer_sol(sender_wallet, recipient_wallet, amount_to_send)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python transfer_sol.py <recipient_wallet_address> <from_keypair> >config_path>")
        sys.exit(1)
    json_file_path = sys.argv[1]
    with open(json_file_path, 'r') as f:
        config = json.load(f)
    recipient_wallet = sys.argv[1]
    sender_wallet = sys.argv[2]

    balance = get_balance(sender_wallet)
    rent_exempt_balance = get_rent_exempt_balance()
    sender_wallet
    amount_to_send = balance - rent_exempt_balance
    if amount_to_send <= 0:
        print("❌ Insufficient funds to transfer after leaving the rent-exempt balance.")
        sys.exit(1)
    pk = get_public_key(sender_wallet)
    auditWalletAccount(pk, sender_wallet, "PRE TRANSFER ALL SOL FROM WALLET", f"sol: {amount_to_send}", config)
    auditWalletAccount(recipient_wallet, "", "PRE RECEIVE ALL SOL FROM WALLET", f"sol: {amount_to_send}", config)
    transfer_sol(sender_wallet, recipient_wallet, amount_to_send)
    auditWalletAccount(pk, sender_wallet, "POST TRANSFER ALL SOL FROM WALLET", f"sol: {amount_to_send}", config)
    auditWalletAccount(recipient_wallet, "", "POST RECEIVE ALL SOL FROM WALLET", f"sol: {amount_to_send}", config)
