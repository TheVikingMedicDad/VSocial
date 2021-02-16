#!/usr/bin/env bash

set -e

RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

source ./cli/load_and_gen_env.sh

if [ ! -z "$1" ]; then
    echo -e "${BLUE}Override Tag: ${1}${NC}"
    export CSD_DOCKER_LOCAL_TAG=$1
fi

echo "Run docker-compose up detached with Tag: ${CSD_DOCKER_LOCAL_TAG}"
$CSD_DOCKER_COMPOSE_WEBAPP_CMD up -d

set +e