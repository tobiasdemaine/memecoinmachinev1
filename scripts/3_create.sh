#!/bin/bash

python3 python/createToken.py tokens/$1\_$2.json
python3 python/distributeSol.py tokens/$1\_$2.json
python3 python/publishToken.py tokens/$1\_$2.json
python3 python/tokenBuyin.py tokens/$1\_$2.json