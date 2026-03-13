#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${PROJECT_DIR}"

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "Docker Compose nao encontrado."
  exit 1
fi

usage() {
  cat <<EOF
Uso: ./deploy.sh <comando>

Comandos:
  install  -> primeiro deploy (build + up + migrate)
  update   -> atualizacao (build + up + migrate)
  migrate  -> roda migrations
  seed     -> roda seeds (use somente na primeira instalacao)
  logs     -> acompanha logs dos containers
  status   -> mostra status dos services
EOF
}

require_env() {
  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      cp .env.example .env
      echo "Arquivo .env criado a partir de .env.example."
      echo "Edite o .env com os dados reais e rode o comando novamente."
      exit 1
    fi
    echo "Arquivo .env nao encontrado."
    exit 1
  fi
}

run_install_or_update() {
  require_env
  ${COMPOSE} build
  ${COMPOSE} up -d
  ${COMPOSE} exec backend npx sequelize db:migrate
}

COMMAND="${1:-}"

case "${COMMAND}" in
  install)
    run_install_or_update
    echo "Deploy inicial concluido."
    echo "Se for primeira instalacao, rode: ./deploy.sh seed"
    ;;
  update)
    run_install_or_update
    echo "Atualizacao concluida."
    ;;
  migrate)
    require_env
    ${COMPOSE} exec backend npx sequelize db:migrate
    ;;
  seed)
    require_env
    ${COMPOSE} exec backend npx sequelize db:seed:all
    ;;
  logs)
    require_env
    ${COMPOSE} logs -f --tail=150
    ;;
  status)
    require_env
    ${COMPOSE} ps
    ;;
  *)
    usage
    exit 1
    ;;
esac
