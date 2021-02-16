#!/usr/bin/env bash

set -xe

CSD_CURRENT_ENV=local_dev

source ./cli/load_and_gen_env.sh

# start building and watch the webapp-e2e project in background:
cd Frontend

nx e2e web-app-e2e --watch