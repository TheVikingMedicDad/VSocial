#!/usr/bin/env sh

# check if minio is present
until wget -q --spider http://$CSD_WEBAPP_SERVER_MINIO_HOST:$CSD_WEBAPP_SERVER_MINIO_PORT/minio/health/ready
do
  echo "Couldn't reach minio server on $CSD_WEBAPP_SERVER_MINIO_HOST, try again after sleeping"
  sleep 3
done
echo "Minio server reached, start initialization of buckets"