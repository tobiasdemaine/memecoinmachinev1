import json
from flask import Flask, copy_current_request_context, jsonify
from createBaseAccount import createBaseAccount
from publishToken import publishToken
from publishTokenMarket import publishTokenMarket
from publishTokenPool import publishTokenPool
from balance import get_balance, get_token_balance
from switchToken import switch_token
from tokenBalance import token_balance
from removeLiquidity import removeLiquidity
from getAllSolFromWallets import getAllSolfromWallets
from masterwalletHoldings import master_wallet_holdings
from createStep1 import createStep1
from createStep2 import createStep2
from previewWebsite import previewWebsite
from move import move_sol_to_wallet, move_token_to_wallet
from transferSolFromMaster import transferSolFromMaster
from tokenwalletHoldings import token_wallet_holdings
from transferFromTokenToMaster import transferFromTokenToMaster
from tokenSellOut import tokenSellOut
from walletHoldings import wallet_holdings
from watchPool import watch
from tokenStart import update_json_file
from generateSite import generateSite
from regenerateSite import regenerateSite
from publishWebsite import publishWebsite
from republishWebsite import republishWebsite
from swap import swap_all, swap_some
from flask import request
import os

from flask_cors import CORS
from flask import send_from_directory
import threading
app = Flask(__name__)
CORS(app)
# Sample data
success = {
    "success": True
}

def hasBaseAccount():
    if not os.path.exists('tokens/keys/base-keypair.json'):
        createBaseAccount()

def filePath(mode, symbol):
    return f"tokens/{mode}_{symbol}.json"

def filePathAudit(mode, symbol):
    return f"tokens/{mode}_{symbol}.audit.json"

@app.route('/createbaseaccount', methods=['GET'])
def createbaseaccount():
    try:
        hasBaseAccount()
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    return jsonify(success), 200

@app.route('/start', methods=['POST'])
def start():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    try:
        update_json_file(mode, symbol)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200
    

@app.route('/generatesite', methods=['POST'])
def generatesite():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    try:
        generateSite(filePath(mode, symbol))
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

@app.route('/regeneratesite', methods=['POST'])
def regeneratesite():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    try:
        regenerateSite(filePath(mode, symbol))
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

@app.route('/publishsite', methods=['POST'])
def publishsite():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    try:
        publishWebsite(filePath(mode, symbol))
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

@app.route('/republishsite', methods=['POST'])
def republishsite():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    try:
        republishWebsite(filePath(mode, symbol))
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200



@app.route('/publishtoken', methods=['POST'])
def publishtoken():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    try:
        publishToken(filePath(mode, symbol))
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    with open(filePath(mode, symbol), 'r') as file:
        data = json.loads(file.read())
    return jsonify({"success": True, "data": data}), 200

@app.route('/publishtokenmarket', methods=['POST'])
def publishtokenmarket():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    try:
        publishTokenMarket(filePath(mode, symbol))
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    with open(filePath(mode, symbol), 'r') as file:
        data = json.loads(file.read())
    return jsonify({"success": True, "data": data}), 200

@app.route('/publishtokenpool', methods=['POST'])
def publishtokenpool():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    try:
        publishTokenPool(filePath(mode, symbol))
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    with open(filePath(mode, symbol), 'r') as file:
        data = json.loads(file.read())
    return jsonify({"success": True, "data": data}), 200

@app.route('/tokenwebsitejsonsave', methods=['POST'])
def tokenwebsitejsonsave():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    json = request.json.get('data')
    
    with open(filePath(mode, symbol), 'r') as file:
        data = json.loads(file.read())
    data["website"] = json
    with open(filePath(mode, symbol), 'w') as file:
        file.write(data)
    return jsonify({"success": True, "data": data}), 200

@app.route('/tokenjson', methods=['POST'])
def tokenjson():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    with open(filePath(mode, symbol), 'r') as file:
        data = json.loads(file.read())
    return jsonify({"success": True, "data": data}), 200

@app.route('/list', methods=['GET'])
def list():
    print("LIST")
    hasBaseAccount()
    tokens = []
    for file in os.listdir('tokens'):
        if file.endswith('.json') and 'META' not in file and '.audit' not in file:
            with open(f'tokens/{file}', 'r') as f:
                tokens.append(json.loads(f.read()))
    return jsonify({"success": True, "data": tokens}), 200

@app.route('/listkeypairs', methods=['GET'])
def listkeypairs():
    keypairs = []
    for file in os.listdir('tokens/keys'):
        if file.endswith('.json'):
            with open(f'tokens/keys/{file}', 'r') as f:
                keypairs.append(f.read())
    return jsonify({"success": True, "data": keypairs}), 200

@app.route('/tradingaccounts', methods=['POST'])
def tradingAccounts():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    wallets = []
    with open(f'tokens/wallets/{mode}_{symbol}_wallets.json', 'r') as file:
        wallets = json.load(file)

        for wallet_address, wallet_file in wallets.items():
            wallets
    return jsonify({"success": True, "data": wallets}), 200

@app.route('/listwallets', methods=['GET'])
def listwallets():
    wallets = []
    for file in os.listdir('tokens/wallets'):
        if file.endswith('.json'):
            with open(f'tokens/wallets/{file}', 'r') as f:
                wallets.append(f.read())
    return jsonify({"success": True, "data": wallets}), 200

@app.route('/watch', methods=['POST'])
def watchpool():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    w = watch(filePath(mode, symbol))
    return jsonify({"success": True, "data": w}), 200

@app.route('/walletholdings', methods=['POST'])
def walletholdings():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    w =wallet_holdings(filePath(mode, symbol))
    return jsonify({"success": True, "data": w}), 200



@app.route('/basebalance', methods=['GET'])
def baseBalance():
    w = get_balance("tokens/keys.base-keypair.json")
    return jsonify({"success": True, "data": w}), 200

@app.route('/tokenbalance', methods=['POST'])
def tokenbalance():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    w = token_balance(filePath(mode, symbol))
    return jsonify({"success": True, "data": w}), 200

@app.route('/getbalance', methods=["POST"])
def getBalance():
    keypath = request.json.get('keypair')  
    data = {}
    data["sol"] = get_balance(keypath)
    data["token"]  = get_token_balance(keypath)
    return jsonify({"success": True, "data": data}), 200

@app.route('/switchToken', methods=['POST'])
def switchToken():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    switch_token(filePath(mode, symbol))
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

@app.route('/audit', methods=['POST'])
def audit():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    if not os.path.exists(filePathAudit(mode, symbol)):
        return jsonify({"success": True, "data":[]}), 200
    with open(filePathAudit(mode, symbol), 'r') as file:
        data = json.loads(file.read())
    return jsonify({"success": True, "data": data}), 200

@app.route('/withdrawliquidity', methods=['POST'])
def withdrawLiquidity():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    amount = request.json.get('amount')
    data = removeLiquidity(filePath(mode, symbol), amount)
    return jsonify({"success": True, "data": data}), 200

@app.route('/getallsolfromwallets', methods=['POST'])
def getAllsolFromWallets():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    data = getAllSolfromWallets(filePath(mode, symbol))
    return jsonify({"success": True, "data": data}), 200

@app.route('/sellalltokens', methods=['POST'])
def tokensellOut():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    data = tokenSellOut(filePath(mode, symbol))
    return jsonify({"success": True, "data": data}), 200

@app.route('/tranferfromtokentomaster', methods=['POST'])
def tranferfromtokentomaster():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    data = transferFromTokenToMaster(filePath(mode, symbol))
    return jsonify({"success": True, "data": data}), 200

@app.route('/tokenwalletholdings', methods=['POST'])
def tokenwalletholdings():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    data = token_wallet_holdings(filePath(mode, symbol))
    return jsonify({"success": True, "data": data}), 200

@app.route('/masterwalletholdings', methods=['POST'])
def masterwalletholdings():
    mode = request.json.get('mode')
    data = master_wallet_holdings(mode)
    return jsonify({"success": True, "data": data}), 200

@app.route('/masterwalletspend', methods=['POST'])
def masterwalletspend():
    mode = request.json.get('mode')
    address = request.json.get('address')
    amount = request.json.get("amount")
    data = transferSolFromMaster(address, amount, mode)
    return jsonify({"success": True, "data": data}), 200

@app.route('/newTokenStep1', methods=['POST'])
def createstep1():
    step = createStep1()
    
    return jsonify({"success": True, "data": step })

@app.route('/createStep2', methods=['POST'])
def createstep2():
    @copy_current_request_context
    def copyContextStep2():
        createStep2(request)
    threading.Thread(target=copyContextStep2, args=(request,)).start()
    return jsonify({"success": True})

@app.route('/status', methods=['POST'])
def status():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    st = {}
    st["status"] = None
    if not os.path.exists(filePath(mode, symbol)):
        return jsonify({"success": True, "data": st }), 200
    
    with open(filePath(mode, symbol), 'r') as file:
        data = json.loads(file.read())
        return jsonify({"success": True, "data": data}), 200

@app.route('/previewwebsite', methods=['POST'])
def previewwebsite():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    json = request.json.get('data')
    previewWebsite(filePath(mode, symbol), json)
    return jsonify({"success": True, }), 200

@app.route('/swapall', methods=['POST'])
def swapAll():

    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    keypath = request.json.get('keypair')
    swapout = request.json.get('swapOut')
    swap_all(filePath(mode, symbol), keypath, swapout)
    #previewWebsite(filePath(mode, symbol), json)
    return jsonify({"success": True, }), 200

@app.route('/swapsome', methods=['POST'])
def swapSome():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    keypath = request.json.get('keypair')
    swapout = request.json.get('swapOut')
    amount = request.json.get('amount')
    swap_some(filePath(mode, symbol), keypath, swapout, amount)
    return jsonify({"success": True, }), 200

@app.route('/movesoltowallet', methods=['POST'])
def movesoltowallet():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    keypathfrom = request.json.get('keypathfrom')
    keypathto = request.json.get('keypathto')
    amount = request.json.get('amount')
    move_sol_to_wallet(filePath(mode, symbol), keypathfrom, keypathto, amount)
    return jsonify({"success": True, }), 200

@app.route('/movetokenstowallet', methods=['POST'])
def movetokentowallet():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    keypathfrom = request.json.get('keypathfrom')
    keypathto = request.json.get('keypathto')
    amount = request.json.get('amount')
    print(filePath(mode, symbol), keypathfrom, keypathto, amount)
    move_token_to_wallet(filePath(mode, symbol), keypathfrom, keypathto, amount)
    return jsonify({"success": True, }), 200

@app.route('/website')
def website():
    return send_from_directory('../reactApp/dist', 'index.html')

@app.route('/website/<path:path>', methods=["GET"])
def website_serve_static(path):
    return send_from_directory('../reactApp/dist', path)

@app.route('/')
def home():
    return send_from_directory('../UI/dist', 'index.html')

@app.route('/<path:path>', methods=["GET"])
def serve_static(path):
    return send_from_directory('../UI/dist', path)
    
if __name__ == '__main__':
    app.run(debug=True)
