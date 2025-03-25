# MEME COIN MACHINE v1

This is a fun exploration into Solana meme coins. Launch coins, create Openbook markets and Raydium liquidity pools then snipe and trade the coins with as many accounts as you wish.

## Install and run
```
./install.sh

./run.sh
```

Open http://127.0.0.1:5000/ in your browser

## Python ENV

Always run the python environment
```
source .venv/bin/activate
```

## Create Base Account

This account is where all profit sol is paid into
```
python3 python/createBaseAccount.py
```

# MANUAL

manual is every step of the process

## 1 create token base

mode: DEV|PROD
symbol: SYMBOL

```
python3 python/tokenStart.py <mode> <symbol>
```

new json file will be generated in ./tokens/<mode>\_<symbol>.json edit it and add media files.

## 2 Generate website

```
python3 python/generateSite.py tokens/<mode>\_<symbol>.json
```

## 3 Publish website

domain your update name servers

```
python3 publishWebsite.py <mode>\_<symbol>.json
```

## 4 Create Token

```
python3 createToken.py <mode>\_<symbol>.json
```

## 5 Distribute Sol to buy in accounts

```
python3 distributeSol.py <mode>\_<symbol>.json
```

## 6 Publish the token to Raydium

```
python3 publishToken.py <mode>\_<symbol>.json
```

## 7 TOKEN BUY IN

```
python3 tokenBuyin.py <mode>\_<symbol>.json
```

## 8 TOKEN WATCH

```
python3 tokenWatch.py <mode>\_<symbol>.json
```
