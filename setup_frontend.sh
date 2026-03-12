#!/bin/bash
set -e

export NVM_DIR="/root/.nvm"
source "/root/.nvm/nvm.sh"

echo "=== Iniciando Backend com PM2 ==="
cd ~/app/backend
pm2 start dist/server.js --name backend

echo "=== Configurando .env do Frontend ==="
cd ~/app/frontend
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8080/
EOF

echo "=== Instalando dependencias do Frontend ==="
npm install --legacy-peer-deps 2>&1 | tail -5

echo "=== Iniciando Build do Frontend (Isso pode demorar) ==="
npm run build 2>&1 | tail -10

echo "=== Build concluida! Criando servidor estatico para o Frontend ==="
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.listen(3333);
EOF

npm install express
pm2 start server.js --name frontend

echo "=== Tudo pronto na simulacao! ==="
pm2 list
