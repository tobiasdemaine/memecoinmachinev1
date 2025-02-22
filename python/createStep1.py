import threading
from generateMetadata import generateMetaData
from createToken import createToken
from publishTokenMarket import publishTokenMarket
from publishTokenPool import publishTokenPool
from distributeSol import distributSol
from tokenBuyIn import tokenBuyIn
from burnLiquidity import burnLiquidity
from watchPool import watch
from tokenStart import update_json_file
from flask import request
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


def createStep1():
    
    required_params = [
        'mode', 'symbol', 'description', 'name', 'initialSupply', 'decimals', 'url', 
        'RPC_MAIN', 'RPC_DEV', 'startAmount',  'tradingWalletsNumber', 'walletBaseAmount', 
        'lotSize', 'tickSize', 'addBaseAmountNumber', 'addQuoteAmountNumber', 'burnLiquidity',
        "requestQueueSpacce", "eventQueueSpacce", "orderbookQueueSpacce",
    ]
    required_files = ['logo']
    
    if not request.form.get('useWebsiteBuilder') == 'false':
        additional_params = [
             'domain', 'ip4', 'ip6', 'ssh_user', 'ssh_password', 
        ]
        required_params.extend(additional_params)
        additional_files = [
             'hero', 'pdf' 
        ]
        required_files.extend(additional_files)
        
    print(request.files)
    print(required_files)
    files_present = all(file_name in request.files for file_name in required_files)
   
    
    for key in request.form.keys():
        print(f"Parameter: {key}, Value: {request.form[key]}")

    p = False
    for param in required_params:
        if not request.form.get(param):
            p= True
            print(f"required param: {param}")
            
    if(p):
        exit(0)
    
    
        
    symbol = request.form.get('symbol')
    mode = "PROD"
    if request.form.get('mode') == 'Devnet':
        mode = "DEV"

        
    update_json_file(mode, request.form.get('symbol'))
    file_path = f"tokens/{mode}_{symbol}.json"
    with open(file_path, 'r') as json_file:
        token_data = json.load(json_file)
    update_status(file_path, "saving data")
    
    token_data["mode"] = mode
    token_data["SOL_AMOUNT"] = float(request.form.get('startAmount'))
    token_data["initialSupply"] = request.form.get('initialSupply')
    token_data["decimals"] = int(request.form.get('decimals'))  
    token_data["name"] = request.form.get('name')
    token_data["RPC_MAIN"] = request.form.get('RPC_MAIN')
    token_data["RPC_DEV"] = request.form.get('RPC_DEV')
    token_data["url"] = request.form.get('url')

    token_data["wallets"]["NUM_RECIPIENTS"] =  int(request.form.get('tradingWalletsNumber'))
    token_data["wallets"]["BASE_AMOUNT"] = float(request.form.get('walletBaseAmount'))

    token_data["metaData"]["name"] = request.form.get('name')  
    token_data["metaData"]["symbol"] = request.form.get('symbol')
    token_data["metaData"]["website"] = request.form.get('url')
    token_data["metaData"]["description"] = request.form.get('description')
    if request.form.get('telegram'):
        token_data["metaData"]["telegram"] = request.form.get('telegram')
    if request.form.get('x'):
        token_data["metaData"]["twitter"] = request.form.get('x')

    token_data["tokenData"]["name"] = request.form.get('name')  
    token_data["tokenData"]["decimals"] = int(request.form.get('decimals'))
    token_data['tokenData']["symbol"] = request.form.get('symbol')
    token_data['tokenData']["lotSize"] = float(request.form.get('lotSize'))
    token_data['tokenData']["tickSize"] = float(request.form.get('tickSize'))
    token_data['tokenData']["addBaseAmountNumber"] = float(request.form.get('addBaseAmountNumber'))
    token_data['tokenData']["addQuoteAmountNumber"] = float(request.form.get('addQuoteAmountNumber'))
    token_data['tokenData']["lockpool"] = request.form.get('burnLiquidity')
    token_data['tokenData']["requestQueueSpacce"] = int(request.form.get('requestQueueSpacce'))
    token_data['tokenData']["eventQueueSpacce"] = int(request.form.get('eventQueueSpacce'))
    token_data['tokenData']["orderbookQueueSpacce"] = int(request.form.get('orderbookQueueSpacce'))

    token_data["website"]["symbol"] = request.form.get('symbol')
    token_data["domain"] = request.form.get('domain') or ""
    token_data["ip4"] = request.form.get('ip4') or ""
    token_data["ip6"] = request.form.get('ip6') or ""
    token_data["ssh_user"] = request.form.get('ssh_user') or ""
    token_data["ssh_password"] = request.form.get('ssh_pass') or ""
    
    if request.form.get('useWebsiteBuilder') == 'false':
        token_data["website"]["status"] = "off"
    else:
        token_data["website"]["status"] = "on"
    
   
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
    
    pdf = request.files.get('pdf')
    
    if pdf:

        pdf_path = f"tokens/media/{mode}_{symbol}_document.pdf"
        pdf.save(pdf_path)
        token_data["pdf"] = pdf_path
    
    update_file(file_path, token_data)
    update_status(file_path,  "Setup Token Acount")
    
    threading.Thread(target=finishThread, args=(file_path, token_data)).start()

    return token_data

def finishThread(file_path, token_data):
    
    update_status(file_path,  "generating metadata")
    generateMetaData(file_path)

    update_status(file_path,  "creating token")
    createToken(file_path)

    update_status(file_path,  "distributing sol to trading accounts")
    distributSol(file_path)
    
    
    if token_data["website"]["status"] == "on":
        exit(0)
    
    update_status(file_path,  "publish token market")

    publishTokenMarket(file_path)

    update_status(file_path,  "publish token pool")

    publishTokenPool(file_path)

    update_status(file_path,  "getting pool info")

    if token_data['tokenData']["lockpool"] != "false":
        update_status(file_path,  "burning liquidity")
        burnLiquidity(file_path)

    update_status(file_path,  "token buy in")

    tokenBuyIn(file_path)
    
    update_status(file_path,  "complete")

    return 