#!/bin/bash

python3 python/tokenStart.py $1 $2
python3 python/generateSite.py tokens/$1\_$2.json