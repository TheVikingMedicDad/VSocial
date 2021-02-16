#!/usr/bin/env bash

set -e

source ./cli/load_and_gen_env.sh

BASE_CERTS_DIR=conf/dev-certs
TARGET_DIR=$BASE_CERTS_DIR/$CSD_DOMAIN_NAME


ROOT_DNS=$CSD_DOMAIN_NAME
APP_DNS=$CSD_WEBAPP_DOMAIN_NAME
WWW_DNS=$CSD_WEBSITE_DOMAIN_NAME
DOCS_DNS=docs.$CSD_DOMAIN_NAME
CDN_DNS=$CSD_WEBAPP_CDN_DOMAIN_NAME

KEY_TARGET=privkey.pem
CRT_TARGET=fullchain.pem

if [ ! -d "$TARGET_DIR" ]; then
    mkdir -p $TARGET_DIR
fi


# build certs if they don't exist
if [ ! -f "$TARGET_DIR/$KEY_TARGET" ] || [ ! -f "$TARGET_DIR/$CRT_TARGET" ]; then
    echo -e "creates a self signed ssl certificate for:\n\n$ROOT_DNS\n$WWW_DNS\n$APP_DNS\n$DOCS_DNS\n$CDN_DNS\n"
    openssl req -x509 -out $TARGET_DIR/$CRT_TARGET -keyout $TARGET_DIR/$KEY_TARGET  \
        -newkey rsa:2048 -nodes -sha256  \
        -subj "/CN=$ROOT_DNS" \
        -days 3650 -extensions EXT -config <( \
        printf "[dn]\nCN=$ROOT_DNS\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:$ROOT_DNS,DNS:$WWW_DNS,DNS:$DOCS_DNS,DNS:$APP_DNS,DNS:$CDN_DNS\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

fi

# build dhparams if it doesn't exist
if [ ! -f "$BASE_CERTS_DIR/ssl-dhparams.pem" ]; then
    openssl dhparam -dsaparam -out $BASE_CERTS_DIR/ssl-dhparams.pem 4096
fi

