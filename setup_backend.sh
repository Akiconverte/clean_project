#!/bin/bash
set -e

export NVM_DIR="/root/.nvm"
source "/root/.nvm/nvm.sh"

echo "=== Configurando .env do Backend ==="
cd ~/app/backend

cat > .env << 'EOF'
NODE_ENV=production
BACKEND_URL=http://localhost
FRONTEND_URL=http://localhost:3333
PROXY_PORT=8080
PORT=8080

DB_HOST=host.docker.internal
DB_DIALECT=mysql
DB_USER=root
DB_PASS=strongpassword
DB_NAME=whaticket

JWT_SECRET=3123123213123
JWT_REFRESH_SECRET=75756756756

OPENAI_API_KEY=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
EOF

echo "=== .env criado. Instalando dependencias ==="
npm install --legacy-peer-deps 2>&1 | tail -5
echo "=== npm install concluido ==="
echo "=== Compilando TypeScript ==="
npm run build 2>&1 | tail -20
echo "=== Build concluida! ==="
ls dist/
