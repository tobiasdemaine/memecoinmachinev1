from generateMetadata import generateMetaData
from createToken import createToken
from publishTokenMarket import publishTokenMarket
from publishTokenPool import publishTokenPool
from distributeSol import distributSol
from tokenBuyIn import tokenBuyIn
from publishWebsite import publishWebsite
from regenerateSite import regenerateSite
from burnLiquidity import burnLiquidity
from tokenStart import update_json_file
import json
from PIL import Image

def update_status(file_path,  status):
    with open(file_path, 'r') as f:
        token_data = json.load(f)
    token_data["status"] = status
    with open(file_path, 'w') as json_file:
        json.dump(token_data, json_file, indent=4)

def update_file(file_path, token_data):
    with open(file_path, 'w') as json_file:
        json.dump(token_data, json_file, indent=4)


def createStep2(file_path, json_data):


    with open(file_path, 'r') as json_file:
        token_data = json.load(json_file)
    if token_data["status"] != "token created":
        return False
    
    token_data["website"] = json_data
    
    update_status(file_path,  "generating website")

    regenerateSite(file_path)

    token_data["website"]["status"] = "generated" 
    update_file(file_path, token_data)

    update_status(file_path,  "publishing website")

    token_data["website"]["status"] = "published"
    update_file(file_path, token_data)

    publishWebsite(file_path)

    update_status(file_path,  "publish token market")

    publishTokenMarket(file_path)

    update_status(file_path,  "publish token pool")

    publishTokenPool(file_path)

    if token_data['tokenData']["lockpool"] != "false":
        update_status(file_path,  "burning liquidity")
        burnLiquidity(file_path)

    update_status(file_path,  "token buy in")

    tokenBuyIn(file_path)
    
    update_status(file_path,  "tokens bought")

    return True