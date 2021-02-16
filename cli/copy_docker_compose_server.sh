#!/usr/bin/env bash

set -ex

source ./cli/load_and_gen_env.sh

rsync -aR  --include-from=./cli/utils/docker_compose_copy_server_files.txt ./ $CSD_DOCKER_COMPOSE_NODE_SERVER_SSH_USER@$CSD_DOCKER_COMPOSE_NODE_SERVER:/srv/$CSD_PROJECT_NAME/