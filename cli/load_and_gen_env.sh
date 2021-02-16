#!/usr/bin/env bash

set -e

RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

TMP_CURRENT_ENV=$CSD_CURRENT_ENV

export CSD_PROJECT_PATH=`pwd`

# load the global env
if [ -f ./conf/envs/global_env.sh ]; then
    # if the file exists, load it
    source ./conf/envs/global_env.sh
fi

if [ ! -z "$TMP_CURRENT_ENV" ]; then
    export CSD_CURRENT_ENV=$TMP_CURRENT_ENV
fi

# load .csd_env (this overrides all previous methods)
if [ -f ./.csd_env ]; then
    # if the file exists, load it
    source ./.csd_env
fi

# for scripts there is an $CSD_OVERRIDE_ENV variable which overrides all previous
# (only use this for prod scripts eg deploy_prod_website.sh)
if [ ! -z "$CSD_OVERRIDE_ENV" ]; then
    echo "OVER: $CSD_OVERRIDE_ENV"
    export CSD_CURRENT_ENV=$CSD_OVERRIDE_ENV
fi

# check which is the current_env we should generate
if [ -z "$CSD_CURRENT_ENV" ]; then
    # the file does not exits but the current env has to be defined
    echo -e "${RED}No current environment defined! (use CSD_CURRENT_ENV in order to set the environment)${NC}"
    exit 1
fi;


# check if  environment file exists
if [ ! -f "./conf/envs/${CSD_CURRENT_ENV}_env.sh" ]; then
    # no env file with this env name exists
    echo -e "${RED}No environment found for id $CSD_CURRENT_ENV (use CSD_CURRENT_ENV in order to set the environment)${NC}"
    exit 1
fi;


# if kubernets cluster config exist, set KUBECONFIG
if [ -f "${CSD_PROJECT_PATH}/conf/envs/${CSD_CURRENT_ENV}_env_kubeconfig.yaml" ]; then
    export KUBECONFIG=${CSD_PROJECT_PATH}/conf/envs/${CSD_CURRENT_ENV}_env_kubeconfig.yaml
fi;


# load the environment secrets
if [ -f "./conf/envs/${CSD_CURRENT_ENV}_env.secrets.sh" ]; then
    # environment secret found, load it
    source ./conf/envs/${CSD_CURRENT_ENV}_env.secrets.sh
fi;

# load the environment file
source ./conf/envs/${CSD_CURRENT_ENV}_env.sh


# Write the env for docker

# we have to say which variable are we passing to the docker containers, if we pass all to them the default system
# variables of the docker containers will be overwritten
if [ -z "$CSD_ENV_VAR_WHITELIST" ]; then
    echo -e "${RED}No current environment whitelist defined! (use CSD_ENV_VAR_WHITELIST in order to set the whitelist for the environment variables)${NC}"
    exit 1
fi;

if [ ! -z "$CSD_OVERRIDE_ENV" ]; then
    echo -e "${GREEN}==== OVERRIDE ENV: $CSD_CURRENT_ENV ====${NC}"
else
    echo -e "${GREEN}--- Current ENV: $CSD_CURRENT_ENV ----${NC}"
fi
printenv | grep $CSD_ENV_VAR_WHITELIST > ./conf/envs/.generated_env_${CSD_CURRENT_ENV}

# write the env for helm
cp ./conf/envs/.generated_env_${CSD_CURRENT_ENV} ./conf/envs/.generated_env_${CSD_CURRENT_ENV}.yaml

#replace the first occurence are "=" with ": " so that we create a yaml out of the env file
#sed -i '' 's/=/: /' ./conf/envs/.generated_env_${CSD_CURRENT_ENV}.yaml
# put parantheses around the value
#sed -i '' 's/\(.*\)=\(.*\)/\1: "\2"/' ./conf/envs/.generated_env_${CSD_CURRENT_ENV}.yaml
# make multiline values because then the escaping is easier
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's/\(.*\)=\(.*\)/\1: \|-\'$'\n'' \2/' ./conf/envs/.generated_env_${CSD_CURRENT_ENV}.yaml
else
  sed -i 's/\(.*\)=\(.*\)/\1: \|-\'$'\n'' \2/' ./conf/envs/.generated_env_${CSD_CURRENT_ENV}.yaml
fi

set +e
