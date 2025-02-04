
import json
import os
import sys


if len(sys.argv) < 2:
    print("Usage: python watchPool.py <jsonfile> ")
    sys.exit(1)

json_file_path = sys.argv[1]
with open(json_file_path, 'r') as f:
    config = json.load(f)
    
command = f"cd ./node && ts-node ./src/watchPool.ts ../{json_file_path}"

result = os.system(command)
