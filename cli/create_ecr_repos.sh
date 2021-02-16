#!/usr/bin/env bash

set -e
set -o pipefail

RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

source ./cli/load_and_gen_env.sh

export AWS_ACCESS_KEY_ID=$CSD_AWS_ECR_KEY
export AWS_SECRET_ACCESS_KEY=$CSD_AWS_ECR_SECRET
export AWS_DEFAULT_REGION=$CSD_AWS_DEFAULT_REGION

IMAGE_IDS=`$CSD_DOCKER_COMPOSE_WEBAPP_CMD images -q`

while IFS= read -r line; do
    # 
    IMAGE=`docker image inspect $line --format '{{ index .RepoTags 0 }}'`
    # 
    IMAGE_NAME=`echo "$IMAGE" | sed 's/^.*\/\(.*\)\:.*$/\1/'`
    IMAGE_TAG=`echo "$IMAGE" | sed 's/^.*\:\(.*\)$/\1/'`
    if [ "$IMAGE_TAG" = "$CSD_DOCKER_LOCAL_TAG" ]; then
      echo "$IMAGE_NAME tag: $IMAGE_TAG"
      aws ecr describe-repositories --repository-names ${IMAGE_NAME} || aws ecr create-repository --repository-name ${IMAGE_NAME}
    fi
done <<< "$IMAGE_IDS"