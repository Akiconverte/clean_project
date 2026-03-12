#!/bin/bash

# ==============================================================================
# Script de Atualização e Deploy Profissional - Whaticket
# ==============================================================================

echo "🚀 Iniciando processo de atualização..."

# 1. Puxar alterações do repositório
echo "📥 Buscando novidades no GitHub..."
git pull origin main

# 2. Atualizar dependências do Backend
echo "📦 Atualizando dependências do Backend..."
cd backend
npm install
npm run db:migrate
echo "✅ Migrations concluídas."

# 3. Atualizar dependências e Build do Frontend
echo "📦 Atualizando dependências e gerando Build do Frontend..."
cd ../frontend
npm install
npm run build
echo "✅ Build do Frontend concluído."

# 4. Reiniciar a aplicação com PM2 (Zero Downtime)
echo "🔄 Reiniciando processos com PM2..."
cd ..
pm2 reload all

echo "✨ Sistema atualizado com sucesso para a versão mais recente!"
