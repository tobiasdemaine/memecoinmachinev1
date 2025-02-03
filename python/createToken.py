import subprocess
import json
import sys

def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def main():
     # Load configuration from JSON file
    if len(sys.argv) < 2:
        print("Usage: python createToken2.py <config_file>")
        exit(1)
    json_file_path = sys.argv[1]
    with open(json_file_path, 'r') as f:
        config = json.load(f)

    kname = config["mode"] + "_" + config['metaData']['symbol']
    # Generate a keypair for the token mint
    print("Generating token mint keypair...")
    run_command(f"solana-keygen new --outfile tokens/keys/{kname}-keypair.json --force --starts-with bos:1")
    run_command(f"solana config set --keypair tokens/keys/{kname}-keypair.json")
    mint_authority = run_command(f"solana-keygen pubkey {kname}-keypair.json")
    print(f"Token mint address: {mint_authority}")

    if config["mode"] == "DEV":
        run_command(f"solana config set --url devnet")
        run_command(f"solana airdrop 2 {mint_authority}")
    if config["mode"] == "PROD":
        run_command(f"solana config set --url mainnet")

    run_command(f"solana-keygen new --outfile tokens/keys/{kname}-mintaccount-keypair.json --force --starts-with mnt:1")
   
    mint_account = run_command(f"solana-keygen pubkey tokens/keys/{kname}-mintaccount-keypair.json")
    print(f"Token mint address: {mint_account}")
   

    decimals = config['decimals']
    token_name = config['metaData']['name']
    token_symbol = config['metaData']['symbol']
    metadata_uri = config['ipfsMetaDataLink']

    # Create the token mint account with metadata enabled
    print("Creating token mint account...")
    run_command(f"spl-token create-token --mint-authority {mint_authority} --decimals {decimals} --enable-metadata --name {token_name} --symbol {token_symbol} --uri {metadata_uri} --mint {mint_authority}")

    run_command(f"spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-metadata tokens/keys/{kname}-mintaccount-keypair.json")

    run_command(f"spl-token initialize-metadata {mint_account} {config.metaData.name} {config.metaData.symbol} {config.ipfsMetaDataLink}")
    # Create a token account
    print("Creating token account...")
    token_account = run_command(f"spl-token create-account {mint_account} | grep -oP 'Creating account \\K\\S+'")
    print(f"Token account created: {token_account}")

    # Mint initial supply
    initial_supply = config['initialSupply']
    print(f"Minting {initial_supply} tokens to token account...")
    run_command(f"spl-token mint {mint_authority} {initial_supply} {token_account}")

    # Use Metaplex to update metadata
    #print("Updating metadata using Metaplex...")
    #run_command(f"metaplex tokens update-metadata --mint {mint_authority} --name \"{token_name}\" --symbol \"{token_symbol}\" --uri \"{metadata_uri}\"")

    print("Token creation complete with metadata!")
    print(f"Token Mint Authority Address: {mint_authority}")
    print(f"Token Mint Address: {mint_account}")
    print(f"Token Account Address: {token_account}")
    print(f"Metadata URI: {metadata_uri}")

    config['tokenData']['decimals'] = decimals
    config['tokenData']['name'] = token_name
    config['tokenData']['symbol'] = token_symbol
    config['tokenData']['mintAuthority'] = mint_authority
    config['tokenData']['mintAccount'] = mint_account
    config['tokenData']['tokenAccount'] = token_account
    config['tokenData']['metadata'] = metadata_uri

    with open(json_file_path, 'w') as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    main()