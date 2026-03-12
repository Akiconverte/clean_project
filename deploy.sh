#!/bin/bash

# Cores para o output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'
YELLOW='\033[0;33m'

# Função para exibir o logo
show_logo() {
    clear
    echo -e "${GREEN}"
    echo "  ____      _       _   _               _      _                 "
    echo " / ___| ___(_) __ _| |_(_)_   _____    | |    (_) ___  _ __  ___ "
    echo "| |    / _ \ |/ _\` | __| \ \ / / _ \   | |    | |/ _ \| '_ \/ __|"
    echo "| |___|  __/ | (_| | |_| |\ V /  __/   | |___ | | (_) | | | \__ \\"
    echo " \____|\___|_|\__,_|\__|_| \_/ \___|   |_____||_|\___/|_| |_|___/"
    echo -e "${NC}"
    echo -e "${BLUE}=== Gestor de Implantação Automática v2.0 ===${NC}\n"
}

# Mostrar logo inicial
show_logo

echo "Selecione a operação desejada:"
echo -e "${GREEN}1) Nova Instalação (Instalar do Zero)${NC}"
echo -e "${YELLOW}2) Atualizar Sistema (Fazer Upgrade do Git e Docker)${NC}"
echo -e "${RED}3) Sair${NC}"
echo ""
read -p "Digite o número da opção [1-3]: " MENU_OPTION

if [ "$MENU_OPTION" == "3" ]; then
    echo "Saindo..."
    exit 0
fi

if [ "$MENU_OPTION" == "2" ]; then
    echo -e "\n${BLUE}=== Iniciando Processo de Atualização ===${NC}"
    echo "Baixando atualizações do Git..."
    git pull origin main || git pull
    
    echo "Reconstruindo imagens e subindo contêineres..."
    docker builder prune -a -f
    if docker compose version > /dev/null 2>&1; then
        docker compose build --no-cache
        docker compose up -d
    else
        docker-compose build --no-cache
        docker-compose up -d
    fi
    echo -e "${GREEN}✓ Atualização concluída com sucesso!${NC}"
    exit 0
fi

if [ "$MENU_OPTION" == "1" ]; then
    echo -e "\n${BLUE}=== Nova Instalação LionsTicket ===${NC}"
    
    read -p "Deseja realizar uma limpeza profunda antes de começar? (ISSO APAGARÁ O BANCO DE DADOS ATUAL!) [s/N]: " CLEAN_START
    if [[ "$CLEAN_START" =~ ^[Ss]$ ]]; then
        echo -e "${BLUE}--- Realizando Limpeza Profunda ---${NC}"
        if docker compose version > /dev/null 2>&1; then
            docker compose down -v
        else
            docker-compose down -v
        fi
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
    ask_with_default "URL do Backend (ex: https://api.seudominio.com)" "https://api.creativelions.com.br" BACKEND_URL
    ask_with_default "URL do Frontend (ex: https://painel.seudominio.com)" "https://atendimento.creativelions.com.br" FRONTEND_URL
    ask_with_default "Porta do Proxy (Geralmente 443 para HTTPS ou 8080/80)" "443" PROXY_PORT

    echo ""
    echo -e "${BLUE}--- Nomes de Domínio (Nginx) ---${NC}"
    ask_with_default "Domínio do Backend (ex: api.seudominio.com)" "api.creativelions.com.br" BACKEND_SERVER_NAME
    ask_with_default "Domínio do Frontend (ex: painel.seudominio.com)" "atendimento.creativelions.com.br" FRONTEND_SERVER_NAME

    echo ""
    echo -e "${BLUE}--- Banco de Dados (MySQL/MariaDB) ---${NC}"
    ask_with_default "Senha Root do MySQL" "strongpassword" MYSQL_ROOT_PASSWORD
    ask_with_default "Nome do Banco de Dados" "whaticket" MYSQL_DATABASE

    echo ""
    echo -e "${BLUE}--- Segurança (JWT) ---${NC}"
    # Gerar segredos aleatórios
    RANDOM_JWT=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    RANDOM_REFRESH=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

    ask_with_default "JWT Secret (Deixe em branco para gerado auto)" "$RANDOM_JWT" JWT_SECRET
    ask_with_default "JWT Refresh Secret (Deixe em branco para gerado auto)" "$RANDOM_REFRESH" JWT_REFRESH_SECRET

    echo ""
    echo -e "${BLUE}--- OpenAI ---${NC}"
    ask_with_default "Sua OpenAI API Key (Opcional - deixe em branco se não tiver)" "" OPENAI_API_KEY

    # Criar o arquivo .env com o padrão do Whaticket V1
    cat > .env << EOF
# Configurações do Banco de Dados
MYSQL_ENGINE=mariadb
MYSQL_VERSION=10.6
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_DATABASE=$MYSQL_DATABASE
MYSQL_USER=whaticket
MYSQL_PORT=3306
TZ=America/Fortaleza

# Configurações do Backend
BACKEND_PORT=8080
BACKEND_SERVER_NAME=$BACKEND_SERVER_NAME
BACKEND_URL=$BACKEND_URL
PROXY_PORT=$PROXY_PORT
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Configurações do Frontend
FRONTEND_PORT=80
FRONTEND_SSL_PORT=443
FRONTEND_SERVER_NAME=$FRONTEND_SERVER_NAME
FRONTEND_URL=$FRONTEND_URL

# REDIS & OTHERS (LionsTicket Custom)
REDIS_URL=redis://redis:6379
REDIS_DB=0
OPENAI_API_KEY=$OPENAI_API_KEY
NODE_ENV=production
EOF

    echo -e "${GREEN}✓ Arquivo .env criado com sucesso!${NC}"

    echo ""
    echo -e "${BLUE}--- SSL Automático (Certbot) ---${NC}"
    read -p "Deseja gerar o certificado SSL (HTTPS) agora? (Use APENAS se os DNS já estiverem propagados) [S/n]: " DO_SSL
    if [[ "$DO_SSL" != "n" ]]; then
        echo -e "${BLUE}Temporariamente subindo Frontend para validação do Let's Encrypt...${NC}"
        docker compose up -d frontend
        
        sudo apt update && sudo apt install certbot -y
        
        sudo certbot certonly --cert-name backend --webroot --webroot-path ./ssl/www/ -d $BACKEND_SERVER_NAME --non-interactive --agree-tos --register-unsafely-without-email
        sudo certbot certonly --cert-name frontend --webroot --webroot-path ./ssl/www/ -d $FRONTEND_SERVER_NAME --non-interactive --agree-tos --register-unsafely-without-email
        
        mkdir -p ssl/certs/backend ssl/certs/frontend
        sudo cp /etc/letsencrypt/live/backend/fullchain.pem ./ssl/certs/backend/fullchain.pem 2>/dev/null
        sudo cp /etc/letsencrypt/live/backend/privkey.pem ./ssl/certs/backend/privkey.pem 2>/dev/null
        sudo cp /etc/letsencrypt/live/frontend/fullchain.pem ./ssl/certs/frontend/fullchain.pem 2>/dev/null
        sudo cp /etc/letsencrypt/live/frontend/privkey.pem ./ssl/certs/frontend/privkey.pem 2>/dev/null
        
        docker compose down
    fi

    echo ""
    echo -e "${BLUE}=== Construindo Contêineres Limpos ===${NC}"
    docker builder prune -a -f
    if docker compose version > /dev/null 2>&1; then
        docker compose build --no-cache
        docker compose up -d
    else
        docker-compose build --no-cache
        docker-compose up -d
    fi

    echo ""
    echo -e "${BLUE}Aguardando Inicialização do Banco (20s)...${NC}"
    sleep 20

    echo -e "${BLUE}--- Executando Migrações Oficiais ---${NC}"
    if docker compose version > /dev/null 2>&1; then
        docker compose exec backend npx sequelize db:migrate
        docker compose exec backend npx sequelize db:seed:all
    else
        docker-compose exec backend npx sequelize db:migrate
        docker-compose exec backend npx sequelize db:seed:all
    fi

    echo ""
    echo -e "${GREEN}=== LionsTicket Instalado e Configurado! ===${NC}"
    echo "Painel: $FRONTEND_URL"
    echo "Usuário: admin@whaticket.com | Senha: admin"
fi
