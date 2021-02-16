#!/bin/bash

set -o errexit
set -o nounset

# find the nameserver ip for nginx
export NAMESERVER=$(awk '/^nameserver/{print $2}' /etc/resolv.conf)

if [ -n "${KUBERNETES_SERVICE_HOST:-}" ]; then
  # if we are inside a kubernetes cluster
  export FQDN_SUFFIX=".${CSD_K8S_NAMESPACE}.svc.cluster.local"
else
  # if we are in docker compose
  export FQDN_SUFFIX=""
fi

# replace the env variables and start the server
# NOTE: envsubst will replace every variable starting with '$', so we are just replacing the
# variable that are in the current environment (https://github.com/docker-library/docs/issues/496)
/bin/bash -c "envsubst \"`printf '${%s} ' $(bash -c \"compgen -A variable\")`\" < \
    /etc/nginx/conf.d/nginx.tmpl > \
    /etc/nginx/conf.d/default.conf"

nginx -c /etc/nginx/nginx.conf  -g 'daemon off;'