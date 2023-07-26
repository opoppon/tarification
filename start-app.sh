#!/bin/bash
. /home/debian/.nvm/nvm.sh

cd /home/debian/tarification
#git pull && npm run build && npm run start
npm run start /home/debian/tarification/package.json
