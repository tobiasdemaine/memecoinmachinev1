#!/bin/bash
python3 python/generateSite.py tokens/$1\_$2.json
python3 python/publishWebsite.py tokens/$1\_$2.json