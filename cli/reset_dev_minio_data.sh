#!/usr/bin/env bash

# set -ex


source ./cli/load_and_gen_env.sh

docker ps --all --filter  volume=${CSD_PROJECT_NAME}_minio-s3-data --format "{{.ID}}"
CONTAINER_ID=$(docker ps --all --filter  volume=${CSD_PROJECT_NAME}_minio-s3-data --format "{{.ID}}")
docker rm $CONTAINER_ID
docker volume rm ${CSD_PROJECT_NAME}_minio-s3-data

#