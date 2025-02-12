
import json
import os
import subprocess
import sys

from tokenFarming.python.audit import auditTokenBaseAccount



def main():
     # Load configuration from JSON file
    if len(sys.argv) < 2:
        print("Usage: python createToken.py <config_file> <amount>")
        exit(1)
    json_file_path = sys.argv[1]
    with open(json_file_path, 'r') as f:
        config = json.load(f)

    auditTokenBaseAccount("PRE REMOVE LIQUIDITY", f"Sol: {amount}", config)


    amount = sys.argv[2]
    command = f"cd ./node && npx ts-node ./src/removeLiquidity.ts ../{json_file_path} {amount}"
    auditTokenBaseAccount("POST REMOVE LIQUIDITY", f"Sol: {amount}", config)

    result = os.system(command)


if __name__ == "__main__":
    main()