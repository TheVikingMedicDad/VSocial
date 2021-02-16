#!/usr/bin/env bash

# webapp
# ------------------------------------------------------------------------------

# set these port variables if you want the local server to be accessible not
# on the default ports (80, 443)
# export CSD_WEBAPP_PUBLIC_HTTP_PORT=8000
# export CSD_WEBAPP_PUBLIC_HTTPS_PORT=4430
# if you changed the ports above you need to uncomment the following line as well
# export CSD_API_TESTING_URL="https://${CSD_WEBAPP_DOMAIN_NAME}:${CSD_WEBAPP_PUBLIC_HTTPS_PORT}"


# If you need access to the image registry for debugging purposes
# set these variables, otherwise you can only use the local images
#export CSD_AWS_ECR=true
#export CSD_AWS_ECR_KEY="<your aws account key>"
#export CSD_AWS_ECR_SECRET="<your aws account secret>"
