import os
import sys
import json
import subprocess

from audit import auditTokenBaseAccount

def publishTokenPool(json_file):
    

    try:
        with open(json_file, 'r') as file:
            args = json.load(file)
          
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)
    auditTokenBaseAccount("PRE CREATE POOL", "", args)
    command = f"cd ./node && npx ts-node ./src/newPool.ts ../{json_file}"
    
    
    result = os.system(command)
    auditTokenBaseAccount("POST CREATE POOL", "", args)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python publishPool.py <json_file>")
        sys.exit(1)

    json_file = sys.argv[1]
    publishTokenPool(json_file)