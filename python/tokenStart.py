import os
import json
import sys

def update_json_file(mode, symbol):
    base_json_path = './base.json'
    with open(base_json_path, 'r') as f:
        data = json.load(f)

    data['mode'] = mode
    data['metaData']['symbol'] = symbol

    # Create the new file name
    new_file_name = f"{mode}_{symbol}.json"
    new_file_path = os.path.join('./tokens', new_file_name)

    # Save the new JSON file with the updated values
    with open(new_file_path, 'w') as f:
        json.dump(data, f, indent=4)

    print(f"New JSON file created: {new_file_path}")
    print("Please update the JSON file with the required information and add media files.")

if __name__ == "__main__":
     # Extract mode and symbol values
    if len(sys.argv) != 3:
        print("Usage: python tokenStart.py <mode> <symbol>")
        sys.exit(1)

    mode = sys.argv[1]
    symbol = sys.argv[2]
    update_json_file(mode, symbol)