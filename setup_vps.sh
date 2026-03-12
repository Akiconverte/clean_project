#!/bin/bash
set -e

echo "=== Instalando Node.js 18 via NVM ==="
export NVM_DIR="/root/.nvm"
source "/root/.nvm/nvm.sh"
nvm install 18
nvm use 18
nvm alias default 18

echo "=== Versoes ==="
node -v
npm -v

echo "=== Instalando PM2 ==="
npm install -g pm2

echo "=== Clonando repositorio ==="
cd ~
rm -rf app
git clone https://github.com/Akiconverte/Lionsticket.git app
cd app

echo "=== Clone concluido! Estrutura ==="
ls -la
