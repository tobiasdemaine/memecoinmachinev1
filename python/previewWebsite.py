import json
from regenerateSite import regenerateSite


def previewWebsite(filepath, data):
    with open(filepath, 'r') as f:
        config = json.load(f)
    config["website"] = data
    with open(filepath, 'w') as f:
        json.dump(config, f, indent=4)
    kname = config["mode"] + "_" + config['metaData']['symbol']
    regenerateSite(filepath)

