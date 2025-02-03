#1 create token base

mode: DEV|PROD
symbol: SYMBOL

'''
python3 python/tokenStart.py <mode> <symbol>
'''

new json file will be generated in ./tokens/<mode>\_<symbol>.json edit it and add media files.

#2 Generate website

'''
python3 python/generateSite.py tokens/<mode>\_<symbol>.json
'''

#3 Publish website
domain your update name servers

'''
python3 publishWebsite.py <mode>\_<symbol>.json
'''

#4 Create Token
'''
python3 createToken.py <mode>\_<symbol>.json
'''

#5 Distribute Sol to buy in accounts
'''
python3 distributeSol.py <mode>\_<symbol>.json
'''

#6 Publish the token to Raydium
'''
python3 publishToken.py <mode>\_<symbol>.json
'''

#7 TOKEN BUY IN
'''
python3 tokenBuyin.py <mode>\_<symbol>.json
'''

#8 TOKEN EXIT
'''
python3 tokenExit.py <mode>\_<symbol>.json
'''
