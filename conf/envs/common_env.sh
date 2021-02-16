#!/usr/bin/env bash

#################
# common
#################

export CSD_PROJECT_NAME="vsocial"
export CSD_EMAIL_OFFICE="arqdevteam@gmail.com"
export CSD_PROJECT_KEY="vsp"
export CSD_DISPLAY_NAME="VSocial"
export CSD_PROJECT_KEY_UPPER=`printf '%s\n' "$CSD_PROJECT_KEY" | awk '{ print toupper($0) }'`
export CSD_EMAIL_TECH_ADMIN=${CSD_EMAIL_OFFICE}
export CSD_DOMAIN_NAME=example.com
export CSD_COMPANY_ADDRESS="2910 Kerry Forest Pkwy, #D4-217, 32309 Tallahassee, United States"
export CSD_MAIN_VERSION="0.0.1"
export CSD_PROJECT_VERSION="0.0.1"
export CSD_DIST_DIR="./dist"
export CSD_EMAIL_TRANSACTIONAL=${CSD_EMAIL_TRANSACTIONAL:-team@$CSD_DOMAIN_NAME}
# 
export CSD_COLOR_PRIMARY="${CSD_COLOR_PRIMARY:-#5440d1}"
export CSD_COLOR_ACCENT="${CSD_COLOR_ACCENT:-#5440d1}"
export CSD_COLOR_WARN="${CSD_COLOR_WARN:-#da0d0d}"
# 
export CSD_PYTHON_VERSION="3.7"
export CSD_DEVELOP_BRANCH="develop"
export CSD_PRODUCTION_BRANCH="master"
export CSD_DEPLOY_WITH_DEMO_DATA=false
export CSD_UNDEPLOY_LOCK=${CSD_UNDEPLOY_LOCK:-false}


export CSD_CURRENT_ENV=${CSD_CURRENT_ENV:-local_dev}
export CSD_DOCKER_REGISTRY=${CSD_DOCKER_REGISTRY:-"example.com"}

export CPB_PROJECT_PATH=`pwd`

export CSD_DOCKER_COMPOSE_WEBAPP_CMD="docker-compose -p $CSD_PROJECT_NAME -f ./conf/docker-compose/webapp.base.yml -f ./conf/docker-compose/webapp.${CSD_CURRENT_TARGET}.yml"

# 
# used for local docker image creation tag
DEFAULT_TAG=${CSD_CURRENT_ENV}.$(date '+%Y-%m-%d').git-$(git rev-parse --short HEAD)
export CSD_DOCKER_LOCAL_TAG=${CSD_DOCKER_LOCAL_TAG:-$DEFAULT_TAG}
# 


# environment variables that are matching this pattern will be injected into the docker containers
export CSD_ENV_VAR_WHITELIST="^${CSD_PROJECT_KEY_UPPER}_\|^CSD_\|^DJANGO_\|^CYPRESS_\|^REDIS_\|^POSTGRES_\|WEB_CONCURRENCY\|KUBECONFIG\|^MINIO_"

export CSD_AWS_ECR=${CSD_AWS_ECR:-false}
export CSD_AWS_ECR_KEY=${CSD_AWS_ECR_KEY:-'overwrite your aws key in the secret files'}
export CSD_AWS_ECR_SECRET=${CSD_AWS_ECR_SECRET:-'overwrite your aws key in the secret files'}
export CSD_AWS_DEFAULT_REGION=${CSD_AWS_DEFAULT_REGION:-'eu-west-1'}

# 

# website
# ------------------------------------------------------------------------------
export CSD_WEBSITE_DOMAIN_NAME=www.$CSD_DOMAIN_NAME
export CSD_WEBSITE_PUBLIC_HOST=$CSD_WEBSITE_DOMAIN_NAME
export CSD_WEBSITE_TERMS_PATH="tos"
export CSD_WEBSITE_PRIVACY_PATH="privacy-policy"
export CSD_WEBSITE_CONTACT_PATH="contact"


# webapp
# ------------------------------------------------------------------------------
export CSD_WEBAPP_PROJECT_NAME=$CSD_PROJECT_NAME-webapp

export CSD_WEBAPP_DOCKER_DEPLOY_HOST_URL=${CSD_WEBAPP_DOCKER_DEPLOY_HOST_URL:-unix:///var/run/docker.sock}
export CSD_WEBAPP_DOMAIN_NAME=app.$CSD_DOMAIN_NAME
export CSD_WEBAPP_PUBLIC_HOST=$CSD_WEBAPP_DOMAIN_NAME
export CSD_WEBAPP_PUBLIC_HTTP_PORT=${CSD_WEBAPP_PUBLIC_HTTP_PORT:-80}
export CSD_WEBAPP_PUBLIC_HTTPS_PORT=${CSD_WEBAPP_PUBLIC_HTTPS_PORT:-443}
export CSD_WEBAPP_MAIN_POSTGRES_DB_NAME=${CSD_WEBAPP_MAIN_POSTGRES_DB_NAME:-$CSD_PROJECT_NAME}
export CSD_WEBAPP_MAIN_POSTGRES_DB_USER=${CSD_WEBAPP_MAIN_POSTGRES_DB_USER:-${CSD_PROJECT_NAME//-/}}
export CSD_WEBAPP_MAIN_POSTGRES_DB_PASSWORD=${CSD_WEBAPP_MAIN_POSTGRES_DB_PASSWORD:-qevVI7GmM13MX0nO8Px8}
export CSD_WEBAPP_SERVER_SECRET_KEY=${CSD_WEBAPP_SERVER_SECRET_KEY:-WeUXZ78qevVI7GmM13MX0nO8Px81Nb908yXvsWA1oIujdzvthYNJjrApGCkiB6Gs}
export CSD_WEBAPP_PUBLIC_PYDEVD_PORT=5678
export CSD_WEBAPP_PYDEVD_PORT=5678
export CSD_WEBAPP_ONLINE_DB_RESET=false



# webapp-server-proxy
export CSD_WEBAPP_SERVER_PROXY_HOST=webapp-server-proxy
export CSD_WEBAPP_SERVER_PROXY_HTTP_PORT=80
export CSD_WEBAPP_SERVER_PROXY_MAX_UPLOAD_SIZE="10M"


# webapp-server-postgres
export CSD_WEBAPP_SERVER_POSTGRES_HOST=${CSD_WEBAPP_SERVER_POSTGRES_HOST:-webapp-server-postgres}
export CSD_WEBAPP_SERVER_POSTGRES_PORT=5432
export CSD_WEBAPP_SERVER_POSTGRES_DEV_PORT=${CSD_WEBAPP_SERVER_POSTGRES_DEV_PORT:-5433}
export CSD_WEBAPP_SERVER_POSTGRES_REPLICAS=0 # disables the service (we don't need it in prod only locally)

# webapp-frontend-webapp
export CSD_WEBAPP_FRONTEND_WEBAPP_HOST=webapp-frontend-webapp
export CSD_WEBAPP_FRONTEND_WEBAPP_HTTP_PORT=4200

# webapp-frontend-webapp-ssr
export CSD_WEBAPP_FRONTEND_WEBAPP_SSR_HOST=webapp-frontend-webapp-ssr
export CSD_WEBAPP_FRONTEND_WEBAPP_SSR_HTTP_PORT=4200


# webapp-server-webapp
export CSD_WEBAPP_SERVER_WEBAPP_HOST=webapp-server-webapp
export CSD_WEBAPP_SERVER_WEBAPP_HTTP_PORT=8080
export CSD_WEBAPP_SERVER_WEBAPP_WORKERS=2
export CSD_WEBAPP_SERVER_DATABASE_URL=postgres://${CSD_WEBAPP_MAIN_POSTGRES_DB_USER}:${CSD_WEBAPP_MAIN_POSTGRES_DB_PASSWORD}@$CSD_WEBAPP_SERVER_POSTGRES_HOST:$CSD_WEBAPP_SERVER_POSTGRES_PORT/${CSD_WEBAPP_MAIN_POSTGRES_DB_NAME}
export CSD_WEBAPP_SERVER_ADMIN_URL=coreadmin
export CSD_WEBAPP_SERVER_CMS_URL=cms
export CSD_WEBAPP_SERVER_ALLOWED_HOSTS=".$CSD_DOMAIN_NAME,.$CSD_WEBAPP_PUBLIC_HOST,$CSD_WEBAPP_SERVER_WEBAPP_HOST"
export CSD_WEBAPP_SERVER_WEBAPP_MAKEMIGRATIONS=${CSD_WEBAPP_SERVER_WEBAPP_MAKEMIGRATIONS:-false}
export CSD_WEBAPP_SERVER_WEBAPP_RESET_DB=${CSD_WEBAPP_SERVER_WEBAPP_RESET_DB:-false}
export CSD_WEBAPP_SERVER_WEBAPP_TEST_RECORDS_ACCESS=${CSD_WEBAPP_SERVER_WEBAPP_TEST_RECORDS_ACCESS:-false}

# webapp-server-redis
export CSD_WEBAPP_SERVER_REDIS_HOST=webapp-server-redis
export CSD_WEBAPP_SERVER_REDIS_PORT=6379
export CSD_WEBAPP_SERVER_REDIS_URL=redis://$CSD_WEBAPP_SERVER_REDIS_HOST:$CSD_WEBAPP_SERVER_REDIS_PORT/0

# webapp-server-minio
export CSD_WEBAPP_SERVER_MINIO_HOST=webapp-server-minio
export CSD_WEBAPP_SERVER_MINIO_PORT=9000
export CSD_WEBAPP_SERVER_MINIO_REPLICAS=1
export CSD_WEBAPP_SERVER_MINIO_STORAGE_SIZE=3Gi

# needed for django media/static storage
# TODO: change the keys here to some random seed based from the eg. CSD_WEBAPP_SERVER_SECRET_KEY
export CSD_AWS_S3_KEY=${CSD_AWS_S3_KEY:-'AKIAIOSFODNN7EXAMPLE'}
export CSD_AWS_S3_SECRET=${CSD_AWS_S3_SECRET:-'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'}
export CSD_AWS_S3_STORAGE_BUCKET_NAME=${CSD_AWS_S3_STORAGE_BUCKET_NAME:-'django-public-data'}
# url where collect_static will upload the assets
export CSD_AWS_S3_ENDPOINT_URL="http://"$CSD_WEBAPP_SERVER_MINIO_HOST:$CSD_WEBAPP_SERVER_MINIO_PORT

# Cypress Testing System
export CYPRESS_BASE_URL=https://$CSD_WEBAPP_PUBLIC_HOST:$CSD_WEBAPP_PUBLIC_HTTPS_PORT

# Project Documentation Server
# webapp-docs
export CSD_WEBAPP_DOCS_HOST=webapp-docs
export CSD_WEBAPP_DOCS_HTTP_PORT=8080

# TODO: is the minio really only dev infra? Or should we have it as basic system
# also in prod, especially staging env but also evtl in low cost prod
# Dev Infra

export CSD_WEBAPP_CDN_USE_LOCAL=true
export CSD_WEBAPP_CDN_DOMAIN_NAME=cdn.$CSD_DOMAIN_NAME

# ingress-nginx
export CSD_INFRA_SERVER_INGRESS_NGINX_HOST=infra-server-ingress-nginx
export CSD_INFRA_SERVER_INGRESS_NGINX_HTTP_PORT=80
export CSD_INFRA_SERVER_INGRESS_NGINX_HTTPS_PORT=443

# 

#############################
# Docker Compose Deployment #
#############################

export CSD_DOCKER_COMPOSE_NODE_SERVER=${CSD_DOCKER_COMPOSE_NODE_SERVER:-''}
export CSD_DOCKER_COMPOSE_NODE_SERVER_SSH_USER=${CSD_DOCKER_COMPOSE_NODE_SERVER_SSH_USER:-'root'}