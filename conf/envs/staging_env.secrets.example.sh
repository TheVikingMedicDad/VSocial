#!/usr/bin/env bash

# Only need to set this if the db host is external (not part of the cluster)
#export CSD_WEBAPP_SERVER_POSTGRES_HOST="DB Host"
#export CSD_WEBAPP_SERVER_POSTGRES_PORT=5432

export CSD_WEBAPP_MAIN_POSTGRES_DB_NAME=$CSD_PROJECT_NAME
export CSD_WEBAPP_MAIN_POSTGRES_DB_USER=postgres
export CSD_WEBAPP_MAIN_POSTGRES_DB_PASSWORD=postgres

export CSD_WEBAPP_SERVER_SECRET_KEY="REPLACE_THIS_WHOLE_STRING_WeUXZ78qevVI7GmM13MX0nO8Px81Nb908yXvsWA1oIujdzvthYNJjrApGCkiB6Gs"

export CSD_SMTP_HOST=""
export CSD_SMTP_PORT="" # <-- TLS Port is required (typically 587)
export CSD_SMTP_USER=""
export CSD_SMTP_PASSWORD=""

# if the docker image registry is an AWS ECR set the following
export CSD_AWS_ECR=true
export CSD_AWS_ECR_KEY=""
export CSD_AWS_ECR_SECRET=""

# If beta cluster is on hetzner Hetzner
export CSD_K8S_ENABLE_HETZNER_STORAGE_CLASS=true
export CSD_K8S_DEFAULT_STORAGE_CLASS="hcloud-volumes"
export CSD_K8S_HETZNER_CLOUD_TOKEN="REPLACE_THIS_WITH_HETZNER_CLOUD_TOKEN"
