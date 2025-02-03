import os
import time
from solana.rpc.api import Client
import json
from solana.keypair import Keypair
from solana.publickey import PublicKey
from solana.transaction import Transaction
from solana.system_program import TransferParams, transfer
import sys

if len(sys.argv) < 2:
    print("Usage: python3 distributeSol.py <JSON_FILE>")
    sys.exit(1)

json_file_path = sys.argv[1]
with open(json_file_path, 'r') as f:
    config = json.load(f)

NUM_RECIPIENTS = int(config.wallets.NUM_RECIPIENTS)
#WALLETS_FILE = sys.argv[2]
SOURCE_WALLET = config.wallets.SOURCE_WALLET
SOL_PER_RECIPIENT = float(config.wallets.SOL_PER_RECIPIENT)

kname = config["mode"] + "_" + config['metaData']['symbol']
client = Client("https://api.devnet.solana.com")

# Generate wallets and save keypairs
print(f"Generating {NUM_RECIPIENTS} wallets...")
#with open(WALLETS_FILE, 'w') as f:
#    pass  # Clear the file if it exists
RECIPIENTS = []

for i in range(1, NUM_RECIPIENTS + 1):
    wallet = Keypair()
    wallet_file = f"tokens/wallets/{kname}_wallet_{i}.json"
    with open(wallet_file, 'w') as f:
        f.write(wallet.secret_key.decode('utf-8'))
    wallet_address = str(wallet.public_key)
    RECIPIENTS.append(wallet_address)
   
    with open("tokens/wallets/{kname}_wallets.json", 'a') as f:
        f.write(f"{wallet_address} -> {wallet_file}\n")
    print(f"Generated wallet #{i}: {wallet_address}")

# Airdrop SOL to source wallet (if on devnet)
if config["mode"] == "DEV":
    print("Airdropping 2 SOL to source wallet (if on devnet)...")
    client.request_airdrop(PublicKey(SOURCE_WALLET), 2 * 10**9)

# Distribute SOL to new wallets
for recipient in RECIPIENTS:
    print(f"Sending {SOL_PER_RECIPIENT} SOL to {recipient}...")
    transaction = Transaction().add(
        transfer(
            TransferParams(
                from_pubkey=PublicKey(SOURCE_WALLET),
                to_pubkey=PublicKey(recipient),
                lamports=int(SOL_PER_RECIPIENT * 10**9)
            )
        )
    )
    client.send_transaction(transaction, Keypair.from_secret_key(SOURCE_WALLET))
    time.sleep(1)  # Short delay to avoid rate limits

print("Wallet generation and SOL distribution complete!")
print(f"Wallets saved in {"tokens/wallets/{kname}_wallets.json"}")