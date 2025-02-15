
import json
import os
import subprocess
import sys


def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        exit(1)
    return result.stdout.strip()

def watch(path):
   
    command = f"cd ./node && npx ts-node ./src/watchPool.ts ../{path}"

    result = run_command(command)
    print(result)
    return(json.loads(result))


if __name__ == "__main__":
     # Extract mode and symbol values
    if len(sys.argv) < 2:
        print("Usage: python watchPool.py <jsonfile> ")
        sys.exit(1)   
    json_file_path = sys.argv[1]
    with open(json_file_path, 'r') as f:
        config = json.load(f)
   
    watch(json_file_path)