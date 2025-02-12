import sys
import json
import subprocess

from tokenFarming.python.audit import auditTokenBaseAccount

def publishTokenMarket(json_file):
    

    try:
        with open(json_file, 'r') as file:
            args = json.load(file)
            
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)
    auditTokenBaseAccount("PRE CREATE MARKET", "", args)
    try:
        subprocess.run(["cd", "../node"], check=True, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"Error changing directory: {e.stderr}")
        sys.exit(1)
    command = ["npx", "ts-node", "src/newMarket.ts", "../"+json_file]

    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e.stderr}")
        sys.exit(1)
    auditTokenBaseAccount("POST CREATE MARKET", "", args)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python publishToken.py <json_file>")
        sys.exit(1)

    json_file = sys.argv[1]
    publishTokenMarket(json_file)