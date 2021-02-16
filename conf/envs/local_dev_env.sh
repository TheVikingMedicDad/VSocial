#!/usr/bin/env bash

#################
# local_dev
#################

export CSD_CURRENT_TARGET=${CSD_CURRENT_TARGET:-dev}

source ./conf/envs/common_env.sh
source ./conf/envs/testing_test_records.sh

export CSD_DOMAIN_NAME=$CSD_DOMAIN_NAME.local
export CSD_DOCKER_LOCAL_TAG=${CSD_CURRENT_ENV}

# website
# ------------------------------------------------------------------------------
export CSD_WEBSITE_DOMAIN_NAME=www.$CSD_DOMAIN_NAME
export CSD_WEBSITE_PUBLIC_HOST=$CSD_WEBSITE_DOMAIN_NAME

# webapp
# ------------------------------------------------------------------------------
export CSD_WEBAPP_DOMAIN_NAME=app.$CSD_DOMAIN_NAME
export CSD_WEBAPP_PUBLIC_HOST=$CSD_WEBAPP_DOMAIN_NAME
export CSD_WEBAPP_SERVER_WEBAPP_TEST_RECORDS_ACCESS=true


# webapp-server-webapp
export CSD_WEBAPP_SERVER_WEBAPP_DJANGO_SETTINGS_MODULE=config.settings.local
export CSD_WEBAPP_SERVER_WEBAPP_MAKEMIGRATIONS="true"
# redundantly needed because we override the domain name for this env also here in this file
export CSD_WEBAPP_SERVER_ALLOWED_HOSTS=".$CSD_DOMAIN_NAME,.$CSD_WEBAPP_PUBLIC_HOST,$CSD_WEBAPP_SERVER_WEBAPP_HOST"
export CSD_WEBAPP_SERVER_WEBAPP_DJANGO_DEBUG=true

# webapp-server-postgres
export CSD_WEBAPP_SERVER_POSTGRES_REPLICAS=1 # enables the service

# Cypress Testing System
export CYPRESS_BASE_URL=https://$CSD_WEBAPP_PUBLIC_HOST:$CSD_WEBAPP_PUBLIC_HTTPS_PORT

# webapp-docs
export CSD_WEBAPP_DOCS_DOMAIN_NAME=docs.$CSD_DOMAIN_NAME

# cdn
export CSD_WEBAPP_CDN_DOMAIN_NAME=cdn.$CSD_DOMAIN_NAME

# Server API Tests
export CSD_API_TESTING_URL="https://${CSD_WEBAPP_DOMAIN_NAME}:${CSD_WEBAPP_PUBLIC_HTTPS_PORT}"