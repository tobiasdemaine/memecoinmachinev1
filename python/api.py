from flask import Flask, jsonify
from createBaseAccount import createBaseAccount
from tokenFarming.python.publishToken import publishToken
from tokenFarming.python.publishTokenMarket import publishTokenMarket
from tokenFarming.python.publishTokenPool import publishTokenPool
from tokenStart import update_json_file
from generateSite import generateSite
from regenerateSite import regenerateSite
from publishWebsite import publishWebsite
from republishWebsite import republishWebsite
from flask import request
import os
app = Flask(__name__)

# Sample data
success = {
    "success": True
}

def hasBaseAccount():
    if not os.path.exists('tokens/keys/base-keypair.json'):
        createBaseAccount()

def filePath(mode, symbol):
    return f"tokens/{mode}_{symbol}.json"

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
        data = file.read()
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
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

@app.route('/publishtokenpool', methods=['POST'])
def publishtokenmarket():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    try:
        publishTokenPool(filePath(mode, symbol))
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

@app.route('/tokenjsonsave', methods=['POST'])
def tokenjsonsave():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    json = request.json.get('json')
    with open(filePath(mode, symbol), 'w') as file:
        file.write(json)
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

@app.route('/tokenjson', methods=['POST'])
def tokenjson():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

@app.route('/list', methods=['POST'])
def list():
    hasBaseAccount()
    tokens = []
    for file in os.listdir('tokens'):
        if file.endswith('.json') and 'META' not in file:
            with open(f'tokens/{file}', 'r') as f:
                tokens.append(f.read())
    return jsonify({"success": True, "data": tokens}), 200

@app.route('/listkeypairs', methods=['GET'])
def listkeypairs():
    keypairs = []
    for file in os.listdir('tokens/keys'):
        if file.endswith('.json'):
            with open(f'tokens/keys/{file}', 'r') as f:
                keypairs.append(f.read())
    return jsonify({"success": True, "data": keypairs}), 200

@app.route('/listwallets', methods=['GET'])
def listwallets():
    wallets = []
    for file in os.listdir('tokens/wallets'):
        if file.endswith('.json'):
            with open(f'tokens/wallets/{file}', 'r') as f:
                wallets.append(f.read())
    return jsonify({"success": True, "data": wallets}), 200

if __name__ == '__main__':
    app.run(debug=True)
