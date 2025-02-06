from flask import Flask, jsonify
from createBaseAccount import createBaseAccount
from tokenStart import update_json_file
from generateSite import generateSite
from regenerateSite import regenerateSite
from publishWebsite import publishWebsite
from flask import request
app = Flask(__name__)

# Sample data
success = {
    "success": True
}

def filePath(mode, symbol):
    return f"tokens/{mode}_{symbol}.json"

@app.route('/createbaseaccount', methods=['GET'])
def createbaseaccount():
    createBaseAccount()
    return jsonify(success), 200

@app.route('/start', methods=['POST'])
def start():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    update_json_file(mode, symbol)
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200
    

@app.route('/generatesite', methods=['POST'])
def generatesite():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    generateSite(filePath(mode, symbol))
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

@app.route('/regeneratesite', methods=['POST'])
def regeneratesite():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    regenerateSite(filePath(mode, symbol))
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

@app.route('/publishsite', methods=['POST'])
def publishsite():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    publishWebsite(filePath(mode, symbol))
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
def tokenjsonsave():
    symbol = request.json.get('symbol')
    mode = request.json.get('mode')
    json = request.json.get('json')
    with open(filePath(mode, symbol), 'r') as file:
        data = file.read()
    return jsonify({"success": True, "data": data}), 200

if __name__ == '__main__':
    app.run(debug=True)
