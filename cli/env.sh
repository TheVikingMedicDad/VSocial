#!/usr/bin/env bash

set -e

RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

# if no argument is provided just print the env
if [ -z "$1" ]; then
    source .csd_env
    echo -e "${BLUE}Current ENV: $CSD_CURRENT_ENV${NC}"
    exit 0
fi

if [ ! -f "./conf/envs/${1}_env.sh" ]; then
    # no env file with this env name exists
    echo -e "${RED}No environment file found for: $1${NC}"
    exit 1
fi;

echo -e "${GREEN}Set environment to: $1${NC}"
# set a new env

echo "export CSD_CURRENT_ENV=$1" > .csd_env
set +e