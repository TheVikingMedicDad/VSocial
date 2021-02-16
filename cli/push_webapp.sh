#!/usr/bin/env bash

set -e
set -o pipefail

RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

source ./cli/load_and_gen_env.sh


if [ ! -z "$1" ]; then
    echo -e "${BLUE}Override Tag: ${1}${NC}"
    export CSD_DOCKER_LOCAL_TAG=$1
fi

if [ "$CSD_AWS_ECR" = "true" ]; then
  export AWS_ACCESS_KEY_ID=$CSD_AWS_ECR_KEY
  export AWS_SECRET_ACCESS_KEY=$CSD_AWS_ECR_SECRET
  export AWS_DEFAULT_REGION=$CSD_AWS_DEFAULT_REGION
  aws ecr get-login-password \
    | docker login \
        --password-stdin \
        --username AWS \
        "$CSD_DOCKER_REGISTRY"

fi

echo "Push Images with Tag: ${CSD_DOCKER_LOCAL_TAG} to ${CSD_DOCKER_REGISTRY}"
$CSD_DOCKER_COMPOSE_WEBAPP_CMD push || exit 1  # makes sure this script exits when push fails
echo "EXIT CODE $?"