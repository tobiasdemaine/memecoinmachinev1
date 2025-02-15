import os
import sys
import json
import subprocess

from audit import auditTokenBaseAccount

def publishTokenMarket(json_file):
    

    try:
        with open(json_file, 'r') as file:
            args = json.load(file)
            
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)
    auditTokenBaseAccount("PRE CREATE MARKET", "", args)
    command = f"cd ./node && npx ts-node ./src/newMarket.ts ../{json_file}"
    #command = ["npx", "ts-node", "./src/newMarket.ts", "../"+json_file]

    result = os.system(command)
    auditTokenBaseAccount("POST CREATE MARKET", "", args)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python publishToken.py <json_file>")
        sys.exit(1)

    json_file = sys.argv[1]
    publishTokenMarket(json_file)