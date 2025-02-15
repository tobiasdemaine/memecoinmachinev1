import json
import subprocess
import sys

from audit import auditWalletAccount

def run_command(command):
    """Run a shell command and return its output as a string."""
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {command}")
        print(e.stderr.strip())
        sys.exit(1)






def transfer_sol(sender_wallet, recipient_wallet, amount, mode):
    """Transfer the calculated SOL amount from sender to recipient."""
    print(f"\nTransferring {amount:.6f} SOL from {sender_wallet} to {recipient_wallet}...")
    #confirmation = input("Are you sure? (y/n): ").strip().lower()
    #if confirmation != 'y':
    #    print("Transfer cancelled.")
    #    sys.exit(0)
    transfer_cmd = f"solana transfer {recipient_wallet} {amount} --keypair {sender_wallet} --allow-unfunded-recipient --url {mode}"
    #transfer_cmd = f"solana transfer --allow-unfunded-recipient --keypair {sender_wallet} {recipient_wallet} {amount} --fee-payer {sender_wallet}"
    run_command(transfer_cmd)
    print(f"✅ Successfully transferred {amount:.6f} SOL to {recipient_wallet}.")




def transferSolFromMaster(address, amount, mode):
    bk = "tokens/keys/base-keypair.py"  
    m = "m"
    if mode=="DEV":
        m= "d"
    transfer_sol(address, recipient_wallet, amount, m)
    

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python transfer_sol.py <recipient_wallet_address> <amount> <mode>")
        sys.exit(1)
    recipient_wallet = sys.argv[1]
    amount = sys.argv[2]
    mode = sys.argv[3]
    transferSolFromMaster(recipient_wallet, amount, mode)
    
