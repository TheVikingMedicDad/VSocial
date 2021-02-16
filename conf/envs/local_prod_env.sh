#!/usr/bin/env bash

#################
# local_prod
#################

export CSD_CURRENT_TARGET=prod

source ./conf/envs/local_dev_env.sh
source ./conf/envs/testing_test_records.sh

export CSD_DOCKER_LOCAL_TAG=${CSD_CURRENT_ENV}

# webapp
# ------------------------------------------------------------------------------

# webapp-server
export CSD_WEBAPP_SERVER_WEBAPP_DJANGO_SETTINGS_MODULE=config.settings.production
# redundantly needed because we override the domain name for this env also here in this file
export CSD_WEBAPP_SERVER_ALLOWED_HOSTS=".$CSD_DOMAIN_NAME,.$CSD_WEBAPP_PUBLIC_HOST,$CSD_WEBAPP_SERVER_WEBAPP_HOST"

export CSD_WEBAPP_CDN_DOMAIN_NAME=cdn.$CSD_DOMAIN_NAME

export CSD_K8S_DEFAULT_PULL_POLICY="Never"