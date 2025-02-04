import subprocess
import json
import sys
import os

def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def prompt_overwrite(filepath):
    if os.path.exists(filepath):
        response = input("Base Account already exists. Do you want to overwrite it? (y/N): ").strip().lower()
        if response != 'y':
            print("Operation cancelled.")
            exit(0)

prompt_overwrite("tokens/keys/base-keypair.json")


run_command(f"solana-keygen new --outfile tokens/keys/base-keypair.json --force --starts-with bas:1")

print(f"Generated base keypair @ tokens/keys/base-keypair.json")