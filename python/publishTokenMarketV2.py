import os
import sys
import json
import subprocess



def publishTokenMarketV2(json_file):
    

    try:
        with open(json_file, 'r') as file:
            args = json.load(file)
            
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)
    command = f"cd ./node && npx ts-node ./src/raydiumv2/amm/createMarket.ts ../{json_file}"
    #command = ["npx", "ts-node", "./src/newMarket.ts", "../"+json_file]
    
    result = os.system(command)
 
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python publishTokenMarket.py <json_file>")
        sys.exit(1)

    json_file = sys.argv[1]
    publishTokenMarketV2(json_file)