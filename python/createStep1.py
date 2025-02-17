from generateMetadata import generateMetaData
from createToken import createToken
from publishTokenMarket import publishTokenMarket
from publishTokenPool import publishTokenPool
from distributeSol import distributSol
from tokenBuyIn import tokenBuyIn
from tokenStart import update_json_file
import json
from PIL import Image

def update_status(file_path, token_data, status):
    token_data["status"] = status
    with open(file_path, 'w') as json_file:
        json.dump(token_data, json_file, indent=4)

def update_file(file_path, token_data):
    with open(file_path, 'w') as json_file:
        json.dump(token_data, json_file, indent=4)


def createStep1(request):
    required_params = [
        'mode', 'symbol', 'description', 'name', 'initialSupply', 'decimals', 'url', 'logo',
        'RPC_MAIN', 'RPC_DEV', 'startAmount',  'tradingWalletsNumber', 'walletBaseAmount', 
        'lotSize', 'tickSize', 'addBaseAmountNumber', 'addQuoteAmountNumber'
    ]

    if not request.form.get('useWebsiteBuilder') == 'false':
        additional_params = [
            'hero', 'domain', 'ip4', 'ip6', 'ssh_user', 'ssh_password', 
        ]
        required_params.extend(additional_params)

    for param in required_params:
        if not request.form.get(param):
            return False
        
    symbol = request.form.get('symbol')
    mode = "PROD"
    if request.form.get('mode') == 'Devnet':
        mode = "DEV"
        
    update_json_file(mode, request.form.get('symbol'))
    file_path = f"tokens/{mode}_{symbol}.json"
    with open(file_path, 'r') as json_file:
        token_data = json.load(json_file)
    update_status(file_path, token_data, "saving data")
    
    token_data["mode"] = mode
    token_data["SOL_AMOUNT"] = request.form.get('walletBaseAmount')
    token_data["initialSupply"] = request.form.get('initialSupply')
    token_data["decimals"] = request.form.get('decimals')  
    token_data["name"] = request.form.get('name')
    token_data["RPC_MAIN"] = request.form.get('RPC_MAIN')
    token_data["RPC_DEV"] = request.form.get('RPC_DEV')
    token_data["url"] = request.form.get('url')

    token_data["metaData"]["name"] = request.form.get('name')  
    token_data["metaData"]["symbol"] = request.form.get('symbol')
    token_data["metaData"]["uri"] = request.form.get('url')
    token_data["metaData"]["description"] = request.form.get('description')

    token_data["tokenData"]["name"] = request.form.get('name')  
    token_data["tokenData"]["decimals"] = request.form.get('decimals')
    token_data['tokenData']["symbol"] = request.form.get('symbol')
    token_data['tokenData']["lotSize"] = request.form.get('lotSize')
    token_data['tokenData']["tickSize"] = request.form.get('tickSize')
    token_data['tokenData']["addBaseAmountNumber"] = request.form.get('addBaseAmountNumber')
    token_data['tokenData']["addQuoteAmountNumber"] = request.form.get('addQuoteAmountNumber')

    token_data["website"]["symbol"] = request.form.get('symbol')
    token_data["domain"] = request.form.get('domain') | ""
    token_data["ip4"] = request.form.get('ip4') | ""
    token_data["ip6"] = request.form.get('ip6') | ""
    token_data["ssh_user"] = request.form.get('ssh_user') | ""
    token_data["ssh_password"] = request.form.get('ssh_pass') | ""
    
    update_file(file_path, token_data)
    update_status(file_path, token_data, "saving images")
    # image
    logo = request.files.get('logo')
    if logo:
        image = Image.open(logo)
        image = image.resize((512, 512))
        logo_path = f"tokens/media/{mode}_{symbol}_logo.png"
        image.save(logo_path, format='PNG')
        token_data["logo"] = logo_path

    # hero image
    hero = request.files.get('hero')
    if hero:
        image = Image.open(hero)
        image = image.resize((1920, 1080))
        hero_path = f"tokens/media/{mode}_{symbol}_hero.png"
        image.save(hero_path, format='PNG')
        token_data["hero"] = hero_path
  
    update_status(file_path, token_data, "distributing sol to trading accounts")
  
    distributSol(file_path)

    update_status(file_path, token_data, "generating metadata")

    generateMetaData(file_path)

    update_status(file_path, token_data, "creating token")
  
    createToken(file_path)

    update_status(file_path, token_data, "token created")
  
    if not request.form.get('useWebsiteBuilder') == 'false':
        return
    
    token_data["website"]["status"] = "off"
    update_file(file_path, token_data)
    
    update_status(file_path, token_data, "publish token market")

    publishTokenMarket(file_path)

    update_status(file_path, token_data, "publish token pool")

    publishTokenPool(file_path)

    update_status(file_path, token_data, "token buy in")

    tokenBuyIn(file_path)
    
    update_status(file_path, token_data, "complete")

    return 