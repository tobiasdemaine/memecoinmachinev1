import os
import time
import json
from solana.keypair import Keypair
import sys

if len(sys.argv) < 2:
    print("Usage: python3 distributeSol.py <JSON_FILE>")
    sys.exit(1)

json_file_path = sys.argv[1]
with open(json_file_path, 'r') as f:
    config = json.load(f)

NUM_RECIPIENTS = int(config["wallets"]["NUM_RECIPIENTS"])
SOL_PER_RECIPIENT = float(config["wallets"]["BASE_AMOUNT"]) / NUM_RECIPIENTS

kname = config["mode"] + "_" + config['metaData']['symbol']


# Generate wallets and save keypairs
print(f"Generating {NUM_RECIPIENTS} wallets...")
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


# Distribute SOL to new wallets
for recipient in RECIPIENTS:
    print(f"Sending {SOL_PER_RECIPIENT} SOL to {recipient}...")
    command = f"solana transfer --keypair tokens/keys/{kname}-keypair.json --to {recipient} {SOL_PER_RECIPIENT}"
    time.sleep(1)  # Short delay to avoid rate limits

print("Wallet generation and SOL distribution complete!")
print(f"Wallets saved in {"tokens/wallets/{kname}_wallets.json"}")