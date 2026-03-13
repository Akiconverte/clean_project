#!/bin/bash

# Cores para o output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para exibir o logo
show_logo() {
    clear
    echo -e "${CYAN}"
    echo "  ____      _       _   _               _      _                 "
    echo " / ___| ___(_) __ _| |_(_)_   _____    | |    (_) ___  _ __  ___ "
    echo "| |    / _ \ |/ _\` | __| \ \ / / _ \   | |    | |/ _ \| '_ \/ __|"
    echo "| |___|  __/ | (_| | |_| |\ V /  __/   | |___ | | (_) | | | \__ \\"
    echo " \____|\___|_|\__,_|\__|_| \_/ \___|   |_____||_|\___/|_| |_|___/"
    echo -e "${NC}"
    echo -e "${CYAN}=== LionsTicket Deploy v3.0 - Super Edition ===${NC}\n"
}

# Função para verificar portas
check_ports() {
    local ports=("$@")
    local conflicts=()
    
    for port in "${ports[@]}"; do
        if lsof -i :$port >/dev/null 2>&1; then
            conflicts+=("$port")
        fi
    done
    
    if [ ${#conflicts[@]} -gt 0 ]; then
        echo -e "${RED}❌ Portas ocupadas: ${conflicts[*]}${NC}"
        echo -e "${YELLOW}⚠️  Serviços usando essas portas:${NC}"
        for port in "${conflicts[@]}"; do
            lsof -i :$port | head -2
        done
        return 1
    else
        echo -e "${GREEN}✅ Todas as portas livres!${NC}"
        return 0
    fi
}

# Função para limpeza COMPLETA
clean_all() {
    echo -e "${RED}=== 🔥 LIMPEZA NUCLEAR COMPLETA 🔥 ===${NC}"
    echo -e "${YELLOW}Isso vai APAGAR:${NC}"
    echo -e "  • TODOS containers Docker"
    echo -e "  • TODAS imagens Docker"
    echo -e "  • TODAS networks"
    echo -e "  • TODOS volumes (exceto dados importantes)"
    echo -e "  • Cache Docker"
    echo ""
    
    read -p "Tem CERTEZA ABSOLUTA? Digite 'APAGAR TUDO' para confirmar: " confirm
    if [ "$confirm" != "APAGAR TUDO" ]; then
        echo -e "${RED}❌ Cancelado!${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🧹 Iniciando limpeza nuclear...${NC}"
    
    # Para containers
    echo -e "${YELLOW}• Parando containers...${NC}"
    docker stop $(docker ps -aq) 2>/dev/null || true
    
    # Remove containers
    echo -e "${YELLOW}• Removendo containers...${NC}"
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # Remove imagens
    echo -e "${YELLOW}• Removendo imagens Docker...${NC}"
    docker rmi $(docker images -q) 2>/dev/null || true
    
    # Remove networks
    echo -e "${YELLOW}• Limpando networks...${NC}"
    docker network prune -f 2>/dev/null || true
    
    # Remove volumes (cuidado!)
    echo -e "${YELLOW}• Limpando volumes não utilizados...${NC}"
    docker volume prune -f 2>/dev/null || true
    
    # Limpa cache
    echo -e "${YELLOW}• Limpando cache Docker...${NC}"
    docker builder prune -a -f 2>/dev/null || true
    
    # Mata processos nas portas
    echo -e "${YELLOW}• Matando processos nas portas...${NC}"
    sudo kill -9 $(sudo lsof -t -i:3306) 2>/dev/null || true
    sudo kill -9 $(sudo lsof -t -i:8080) 2>/dev/null || true
    sudo kill -9 $(sudo lsof -t -i:80) 2>/dev/null || true
    sudo kill -9 $(sudo lsof -t -i:443) 2>/dev/null || true
    sudo kill -9 $(sudo lsof -t -i:5432) 2>/dev/null || true
    
    # Para serviços do sistema
    echo -e "${YELLOW}• Parando serviços do sistema...${NC}"
    sudo systemctl stop mysql 2>/dev/null || true
    sudo systemctl stop mariadb 2>/dev/null || true
    sudo systemctl stop postgresql 2>/dev/null || true
    sudo systemctl stop nginx 2>/dev/null || true
    sudo systemctl stop apache2 2>/dev/null || true
    
    echo -e "${GREEN}✅ 🎉 LIMPEZA COMPLETA REALIZADA! 🎉${NC}"
    echo -e "${CYAN}Sistema 100% limpo para nova instalação!${NC}"
    
    return 0
}

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

# Função para validar domínio
validate_domain() {
    local domain=$1
    if [[ $domain =~ ^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$ ]]; then
        return 0
    else
        return 1
    fi
}

# Função para backup
create_backup() {
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    echo -e "${BLUE}📦 Criando backup...${NC}"
    
    # Backup do .env
    if [ -f .env ]; then
        cp .env "$backup_dir/.env.backup"
        echo -e "${GREEN}✓ .env backup${NC}"
    fi
    
    # Backup do banco (se existir)
    if docker ps | grep -q mysql; then
        docker exec $(docker ps -q mysql) mysqldump -u root -p$MYSQL_ROOT_PASSWORD --all-databases > "$backup_dir/database.sql" 2>/dev/null || true
        echo -e "${GREEN}✓ Database backup${NC}"
    fi
    
    echo -e "${CYAN}Backup salvo em: $backup_dir${NC}"
}

# Função para health check
health_check() {
    echo -e "${BLUE}🏥 Verificando saúde dos serviços...${NC}"
    
    local services=("$@")
    local healthy=0
    
    for service in "${services[@]}"; do
        echo -e "${YELLOW}• Verificando $service...${NC}"
        sleep 5
        
        case $service in
            "backend")
                if curl -f http://localhost:8080/health >/dev/null 2>&1; then
                    echo -e "${GREEN}✅ Backend saudável${NC}"
                    ((healthy++))
                else
                    echo -e "${RED}❌ Backend com problemas${NC}"
                fi
                ;;
            "frontend")
                if curl -f http://localhost >/dev/null 2>&1; then
                    echo -e "${GREEN}✅ Frontend saudável${NC}"
                    ((healthy++))
                else
                    echo -e "${RED}❌ Frontend com problemas${NC}"
                fi
                ;;
            "database")
                if docker ps | grep -q mysql && docker exec $(docker ps -q mysql) mysqladmin ping -h localhost >/dev/null 2>&1; then
                    echo -e "${GREEN}✅ Database saudável${NC}"
                    ((healthy++))
                else
                    echo -e "${RED}❌ Database com problemas${NC}"
                fi
                ;;
        esac
    done
    
    if [ $healthy -eq ${#services[@]} ]; then
        echo -e "${GREEN}🎉 Todos os serviços saudáveis!${NC}"
        return 0
    else
        echo -e "${RED}⚠️  Alguns serviços com problemas${NC}"
        return 1
    fi
}

# Mostrar logo inicial
show_logo

echo -e "${CYAN}=== MENU PRINCIPAL ===${NC}\n"
echo "Selecione a operação desejada:"
echo -e "${GREEN}1) 🚀 Nova Instalação (Modo Avançado)${NC}"
echo -e "${YELLOW}2) 🔄 Atualizar Sistema${NC}"
echo -e "${RED}3) 🔥 LIMPEZA NUCLEAR COMPLETA${NC}"
echo -e "${BLUE}4) 📊 Status dos Serviços${NC}"
echo -e "${PURPLE}5) 📦 Criar Backup${NC}"
echo -e "${GRAY}6) Sair${NC}"
echo ""
read -p "Digite o número da opção [1-6]: " MENU_OPTION

case "$MENU_OPTION" in
    "6")
        echo -e "${BLUE}👋 Saindo...${NC}"
        exit 0
        ;;
    "3")
        clean_all
        exit 0
        ;;
    "5")
        create_backup
        exit 0
        ;;
    "4")
        echo -e "${BLUE}📊 Status dos Serviços${NC}"
        echo ""
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        health_check backend frontend database
        exit 0
        ;;
    "2")
        echo -e "\n${BLUE}=== 🔄 Atualizando Sistema ===${NC}"
        create_backup
        
        echo "Baixando atualizações do Git..."
        git pull origin main || git pull
        
        echo "Reconstruindo imagens..."
        docker builder prune -a -f
        
        if docker compose version > /dev/null 2>&1; then
            docker compose build --no-cache
            docker compose up -d
        else
            docker-compose build --no-cache
            docker-compose up -d
        fi
        
        sleep 15
        health_check backend frontend database
        echo -e "${GREEN}✅ Atualização concluída!${NC}"
        exit 0
        ;;
    "1")
        echo -e "\n${BLUE}=== 🚀 Nova Instalação LionsTicket v3.0 ===${NC}"
        
        # Verificar portas primeiro
        echo -e "${CYAN}🔍 Verificando portas disponíveis...${NC}"
        if ! check_ports 80 443 8080 3306; then
            echo -e "${RED}❌ Portas ocupadas! Use opção 3 para limpar tudo.${NC}"
            exit 1
        fi
        
        # Criar backup
        create_backup
        
        # Coleta de informações
        echo ""
        echo -e "${BLUE}--- 🌐 Configurações de URL ---${NC}"
        ask_with_default "URL do Backend (ex: https://api.seudominio.com)" "https://api.creativelions.com.br" BACKEND_URL
        ask_with_default "URL do Frontend (ex: https://painel.seudominio.com)" "https://atendimento.creativelions.com.br" FRONTEND_URL
        
        echo ""
        echo -e "${BLUE}--- 🔧 Configurações de Portas ---${NC}"
        ask_with_default "Porta do Backend (ex: 8080)" "8080" BACKEND_PORT
        ask_with_default "Porta Frontend HTTP (ex: 80)" "80" FRONTEND_PORT
        ask_with_default "Porta Frontend HTTPS (ex: 443)" "443" FRONTEND_SSL_PORT
        
        echo ""
        echo -e "${BLUE}--- 🌍 Nomes de Domínio ---${NC}"
        while true; do
            ask_with_default "Domínio do Backend (ex: api.seudominio.com)" "api.creativelions.com.br" BACKEND_SERVER_NAME
            if validate_domain "$BACKEND_SERVER_NAME"; then
                break
            else
                echo -e "${RED}❌ Domínio inválido! Tente novamente.${NC}"
            fi
        done
        
        while true; do
            ask_with_default "Domínio do Frontend (ex: painel.seudominio.com)" "atendimento.creativelions.com.br" FRONTEND_SERVER_NAME
            if validate_domain "$FRONTEND_SERVER_NAME"; then
                break
            else
                echo -e "${RED}❌ Domínio inválido! Tente novamente.${NC}"
            fi
        done
        
        echo ""
        echo -e "${BLUE}--- 🗄️ Banco de Dados ---${NC}"
        ask_with_default "Senha Root do MySQL" "stronglions" MYSQL_ROOT_PASSWORD
        ask_with_default "Nome do Banco de Dados" "waticket" MYSQL_DATABASE
        
        echo ""
        echo -e "${BLUE}--- 🔐 Segurança (JWT) ---${NC}"
        RANDOM_JWT=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        RANDOM_REFRESH=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        
        ask_with_default "JWT Secret (Deixe em branco para gerado auto)" "$RANDOM_JWT" JWT_SECRET
        ask_with_default "JWT Refresh Secret (Deixe em branco para gerado auto)" "$RANDOM_REFRESH" JWT_REFRESH_SECRET
        
        echo ""
        echo -e "${BLUE}--- 🤖 OpenAI ---${NC}"
        ask_with_default "Sua OpenAI API Key (Opcional)" "" OPENAI_API_KEY
        
        # Criar o arquivo .env
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
BACKEND_PORT=$BACKEND_PORT
BACKEND_SERVER_NAME=$BACKEND_SERVER_NAME
BACKEND_URL=$BACKEND_URL
PROXY_PORT=$FRONTEND_SSL_PORT
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Configurações do Frontend
FRONTEND_PORT=$FRONTEND_PORT
FRONTEND_SSL_PORT=$FRONTEND_SSL_PORT
FRONTEND_SERVER_NAME=$FRONTEND_SERVER_NAME
FRONTEND_URL=$FRONTEND_URL

# REDIS & OTHERS
REDIS_URL=redis://redis:6379
REDIS_DB=0
OPENAI_API_KEY=$OPENAI_API_KEY
NODE_ENV=production
EOF
        
        echo -e "${GREEN}✅ Arquivo .env criado!${NC}"
        
        echo ""
        echo -e "${BLUE}--- 🔒 SSL Automático ---${NC}"
        read -p "Deseja gerar certificado SSL agora? (Use APENAS se os DNS já estiverem propagados) [S/n]: " DO_SSL
        
        if [[ "$DO_SSL" != "n" ]]; then
            echo -e "${YELLOW}⚠️  ATENÇÃO: Se os DNS não estiverem propagados, isso vai falhar!${NC}"
            read -p "Continuar mesmo assim? [s/N]: " continue_ssl
            
            if [[ "$continue_ssl" =~ ^[Ss]$ ]]; then
                echo -e "${BLUE}🔧 Configurando SSL...${NC}"
                mkdir -p ssl/www ssl/certs/backend ssl/certs/frontend
                
                echo -e "${YELLOW}• Subindo frontend temporário...${NC}"
                docker compose up -d frontend
                
                echo -e "${YELLOW}• Instalando certbot...${NC}"
                sudo apt update >/dev/null 2>&1 && sudo apt install -y certbot >/dev/null 2>&1
                
                echo -e "${YELLOW}• Gerando certificados...${NC}"
                if sudo certbot certonly --cert-name backend --webroot --webroot-path ./ssl/www/ -d $BACKEND_SERVER_NAME --non-interactive --agree-tos --register-unsafely-without-email >/dev/null 2>&1; then
                    echo -e "${GREEN}✅ Certificado backend gerado!${NC}"
                fi
                
                if sudo certbot certonly --cert-name frontend --webroot --webroot-path ./ssl/www/ -d $FRONTEND_SERVER_NAME --non-interactive --agree-tos --register-unsafely-without-email >/dev/null 2>&1; then
                    echo -e "${GREEN}✅ Certificado frontend gerado!${NC}"
                fi
                
                echo -e "${YELLOW}• Copiando certificados...${NC}"
                sudo cp /etc/letsencrypt/live/backend/fullchain.pem ./ssl/certs/backend/fullchain.pem 2>/dev/null || true
                sudo cp /etc/letsencrypt/live/backend/privkey.pem ./ssl/certs/backend/privkey.pem 2>/dev/null || true
                sudo cp /etc/letsencrypt/live/frontend/fullchain.pem ./ssl/certs/frontend/fullchain.pem 2>/dev/null || true
                sudo cp /etc/letsencrypt/live/frontend/privkey.pem ./ssl/certs/frontend/privkey.pem 2>/dev/null || true
                
                docker compose down
                echo -e "${GREEN}✅ Configuração SSL concluída!${NC}"
            else
                echo -e "${YELLOW}⚠️  Pulando configuração SSL${NC}"
            fi
        fi
        
        echo ""
        echo -e "${BLUE}--- 🏗️ Construindo Serviços ---${NC}"
        
        # Limpar cache primeiro
        echo -e "${YELLOW}• Limpando cache Docker...${NC}"
        docker builder prune -a -f
        
        # Build backend
        echo -e "${YELLOW}• Build backend (sem cache)...${NC}"
        if docker compose version > /dev/null 2>&1; then
            if ! docker compose build --no-cache backend; then
                echo -e "${RED}❌ Falha no build do backend!${NC}"
                exit 1
            fi
        else
            if ! docker-compose build --no-cache backend; then
                echo -e "${RED}❌ Falha no build do backend!${NC}"
                exit 1
            fi
        fi
        echo -e "${GREEN}✅ Backend buildado!${NC}"
        
        # Build frontend
        echo -e "${YELLOW}• Build frontend (sem cache)...${NC}"
        if docker compose version > /dev/null 2>&1; then
            if ! docker compose build --no-cache frontend; then
                echo -e "${RED}❌ Falha no build do frontend!${NC}"
                exit 1
            fi
        else
            if ! docker-compose build --no-cache frontend; then
                echo -e "${RED}❌ Falha no build do frontend!${NC}"
                exit 1
            fi
        fi
        echo -e "${GREEN}✅ Frontend buildado!${NC}"
        
        echo ""
        echo -e "${BLUE}--- 🚀 Subindo Serviços ---${NC}"
        if docker compose version > /dev/null 2>&1; then
            docker compose up -d
        else
            docker-compose up -d
        fi
        
        echo -e "${GREEN}✅ Todos containers no ar!${NC}"
        
        echo ""
        echo -e "${BLUE}⏳ Aguardando inicialização do banco (30s)...${NC}"
        sleep 30
        
        echo -e "${BLUE}--- 🗄️ Executando Migrações ---${NC}"
        if docker compose version > /dev/null 2>&1; then
            docker compose exec backend npx sequelize db:migrate
            docker compose exec backend npx sequelize db:seed:all
        else
            docker-compose exec backend npx sequelize db:migrate
            docker-compose exec backend npx sequelize db:seed:all
        fi
        
        echo ""
        echo -e "${BLUE}🏥 Verificação final de saúde...${NC}"
        sleep 10
        health_check backend frontend database
        
        echo ""
        echo -e "${GREEN}=== 🎉 LionsTicket v3.0 Instalado com Sucesso! ===${NC}"
        echo -e "${CYAN}🌐 Painel: $FRONTEND_URL${NC}"
        echo -e "${CYAN}👤 Usuário: admin@whaticket.com${NC}"
        echo -e "${CYAN}🔑 Senha: admin${NC}"
        echo ""
        echo -e "${BLUE}📊 Use opção 4 para verificar status anytime!${NC}"
        ;;
    *)
        echo -e "${RED}❌ Opção inválida!${NC}"
        exit 1
        ;;
esac
