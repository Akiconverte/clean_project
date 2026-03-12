#!/bin/bash

# Cores para o output
GREEN='\033[0;32m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

echo -e "${BLUE}=== Configuração Interativa Whaticket (Docker) ===${NC}"
echo "Este script irá configurar o seu arquivo .env e iniciar o projeto."

echo ""
read -p "Deseja realizar uma limpeza profunda antes de começar? (ISSO APAGARÁ O BANCO DE DADOS ATUAL!) [s/N]: " CLEAN_START
if [[ "$CLEAN_START" =~ ^[Ss]$ ]]; then
    echo -e "${BLUE}--- Realizando Limpeza Profunda ---${NC}"
    if docker compose version > /dev/null 2>&1; then
        docker compose down -v
    else
        docker-compose down -v
    fi
    # Opcional: remover imagens antigas
    # docker system prune -f
    echo -e "${GREEN}✓ Limpeza concluída.${NC}"
fi

# Função para perguntar com valor padrão
ask_with_default() {
    local prompt=$1
    local default_value=$2
    local var_ref=$3
    read -p "$prompt [$default_value]: " input
    if [ -z "$input" ]; then
        eval $var_ref=\$default_value
    else
        eval $var_ref=\$input
    fi
}

# Coleta de informações
echo ""
echo -e "${BLUE}--- Configurações de URL ---${NC}"
ask_with_default "URL do Backend (ex: https://api.seudominio.com)" "http://localhost" BACKEND_URL
ask_with_default "URL do Frontend (ex: https://painel.seudominio.com)" "http://localhost:3000" FRONTEND_URL
ask_with_default "Porta do Proxy (Geralmente 443 para HTTPS ou 8080/80)" "8080" PROXY_PORT

echo ""
echo -e "${BLUE}--- Nomes de Domínio (Nginx) ---${NC}"
ask_with_default "Domínio do Backend (ex: api.seudominio.com)" "localhost" BACKEND_SERVER_NAME
ask_with_default "Domínio do Frontend (ex: painel.seudominio.com)" "localhost" FRONTEND_SERVER_NAME

echo ""
echo -e "${BLUE}--- Banco de Dados (MySQL/MariaDB) ---${NC}"
ask_with_default "Senha Root do MySQL" "strongpassword" MYSQL_ROOT_PASSWORD
ask_with_default "Nome do Banco de Dados" "whaticket" MYSQL_DATABASE

echo ""
echo -e "${BLUE}--- Segurança (JWT) ---${NC}"
# Gerar segredos aleatórios se o usuário não quiser digitar
RANDOM_JWT=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
RANDOM_REFRESH=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

ask_with_default "JWT Secret (Deixe em branco para aleatório)" "$RANDOM_JWT" JWT_SECRET
ask_with_default "JWT Refresh Secret (Deixe em branco para aleatório)" "$RANDOM_REFRESH" JWT_REFRESH_SECRET

echo ""
echo -e "${BLUE}--- OpenAI ---${NC}"
ask_with_default "Sua OpenAI API Key (Opcional - deixe em branco se não tiver)" "" OPENAI_API_KEY

# Criar o arquivo .env
cat > .env << EOF
# Configurações do Banco de Dados
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_DATABASE=$MYSQL_DATABASE
MYSQL_USER=root
MYSQL_PORT=3306
MYSQL_ENGINE=mariadb
MYSQL_VERSION=10.6
TZ=America/Fortaleza

# Configurações do Backend
BACKEND_URL=$BACKEND_URL
BACKEND_PORT=8080
BACKEND_SERVER_NAME=$BACKEND_SERVER_NAME
PROXY_PORT=$PROXY_PORT
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
OPENAI_API_KEY=$OPENAI_API_KEY

# Configurações do Frontend
FRONTEND_URL=$FRONTEND_URL
FRONTEND_PORT=3000
FRONTEND_SSL_PORT=3001
FRONTEND_SERVER_NAME=$FRONTEND_SERVER_NAME
EOF

echo -e "${GREEN}✓ Arquivo .env criado com sucesso!${NC}"

echo ""
echo -e "${BLUE}=== Iniciando o Docker Compose ===${NC}"
if docker compose version > /dev/null 2>&1; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

echo ""
echo -e "${GREEN}=== Instalação Concluída! ===${NC}"
echo "Backend está acessível externamente na porta: 8080"
echo "Frontend está acessível externamente na porta: 3000"
echo ""
echo "--- PRÓXIMOS PASSOS ---"
echo "1. Popule o banco de dados (SÓ NA PRIMEIRA VEZ):"
echo -e "${BLUE}   docker compose exec backend npx sequelize db:seed:all${NC}"
echo "2. Acesse o frontend em: $FRONTEND_URL (ou no IP/Porta configurado)"
echo "3. Caso precise de SSL (HTTPS), configure o Nginx ou use o Certbot como no manual."
echo ""
echo "Usuário padrão: admin@whaticket.com | Senha: admin"
