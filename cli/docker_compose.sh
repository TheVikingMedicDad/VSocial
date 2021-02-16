#!/usr/bin/env bash

set -e

RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

source ./cli/load_and_gen_env.sh

if [ "$CSD_AWS_ECR" = "true" ]; then
  export AWS_ACCESS_KEY_ID=$CSD_AWS_ECR_KEY
  export AWS_SECRET_ACCESS_KEY=$CSD_AWS_ECR_SECRET
  aws ecr get-login-password \
    | docker login \
        --password-stdin \
        --username AWS \
        "$CSD_DOCKER_REGISTRY"
fi

echo "Run docker-compose with Tag: ${CSD_DOCKER_LOCAL_TAG}"
$CSD_DOCKER_COMPOSE_WEBAPP_CMD $@

set +e