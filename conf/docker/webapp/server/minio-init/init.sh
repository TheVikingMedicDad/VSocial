#!/bin/sh
set -xe;

until wget -q --spider http://$CSD_WEBAPP_SERVER_MINIO_HOST:$CSD_WEBAPP_SERVER_MINIO_PORT/minio/health/ready
do
  echo "Couldn' reach minio server on $CSD_WEBAPP_SERVER_MINIO_HOST, try again after sleeping"
  sleep 3
done
echo "Minio server reached, start initialization of buckets"

/usr/bin/mc config host add myminio http://$CSD_WEBAPP_SERVER_MINIO_HOST:$CSD_WEBAPP_SERVER_MINIO_PORT $CSD_AWS_S3_KEY $CSD_AWS_S3_SECRET;

/usr/bin/mc mb --ignore-existing myminio/$CSD_AWS_S3_STORAGE_BUCKET_NAME;
/usr/bin/mc policy set download myminio/$CSD_AWS_S3_STORAGE_BUCKET_NAME;
exit 0;