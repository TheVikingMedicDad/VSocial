#!/usr/bin/env bash

set -e

RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

source ./cli/load_and_gen_env.sh

SECRETS_DIR_NAME=export_secrets

rm -rf $SECRETS_DIR_NAME
mkdir $SECRETS_DIR_NAME

# copy if exists based/explained on https://serverfault.com/a/153893
cp -a conf/envs/*.secrets.txt $SECRETS_DIR_NAME/ 2>/dev/null || :
cp -a conf/envs/*.secrets.sh $SECRETS_DIR_NAME/ 2>/dev/null || :
cp -a conf/envs/*_kubeconfig.yaml $SECRETS_DIR_NAME/ 2>/dev/null || :
cp -a conf/envs/global_env.sh $SECRETS_DIR_NAME/ 2>/dev/null || :


# generate password for zip
# if it is a mac computer
if [ "$(uname)" == "Darwin" ]; then
  ZIP_PASSWORD=$(date | md5)
else
  ZIP_PASSWORD=$(date | md5sum)
fi

echo -e "${RED}Random generated password (if you haven't your own): ${ZIP_PASSWORD} ${NC}"
rm -rf $SECRETS_DIR_NAME.zip
zip -er $SECRETS_DIR_NAME.zip $SECRETS_DIR_NAME
rm -rf $SECRETS_DIR_NAME


echo -e "${RED}Your secrets are zipped encrypted in ${SECRETS_DIR_NAME}.zip ${NC}"

set +e