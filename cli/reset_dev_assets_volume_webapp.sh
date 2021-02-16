#!/usr/bin/env bash

# set -ex


source ./cli/load_and_gen_env.sh

docker ps --all --filter  volume=${CSD_PROJECT_NAME}_webapp-server-webapp-assets-builder --format "{{.ID}}"
CONTAINER_ID=$(docker ps --all --filter  volume=${CSD_PROJECT_NAME}_webapp-server-assets-node-modules --format "{{.ID}}")
docker rm $CONTAINER_ID
docker volume rm ${CSD_PROJECT_NAME}_webapp-server-assets-node-modules

#