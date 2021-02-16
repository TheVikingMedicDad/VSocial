#!/bin/sh

# uncomment next line for debug purposes in case the container won't start
# while true; do foo; sleep 2; done

set -o errexit
set -o nounset

/postgres_check.sh
/minio_check.sh

#TODO: the migrate should be moved to a separate container which exists onle once in the cluster (also the collectstatic?)
python manage.py check
python manage.py compilemessages


echo "--> Initial Migrating"
python manage.py migrate

if [ "$CSD_WEBAPP_SERVER_WEBAPP_MAKEMIGRATIONS" = "true" ]; then
    echo "--> Creating Migrations"
    python manage.py makemigrations --name gen
fi

echo "--> Migrating"
python manage.py migrate
python manage.py collectstatic --noinput

# we have to chown /app/media directory and all sub-directory since manage.py migrate
#   is beeing called as root user (and currently would fail if we exec it as django user
#   because [it creates some auto-migration files in site-packages]
#   and migrate is creating stored_uploads and filepond directory
#   TODO: exec manage.py makemigrations and migrate as django user
mkdir -p /app/media/
chown django:django /app/media


if [ "$CSD_DEPLOY_WITH_DEMO_DATA" = "true" ]; then
  echo "--> Add website demo data"
  python manage.py setup_example_website_data
fi

#chown django:django /app/media /app/media/*  # we dont need this any more since our migration files arent createing any directories any more

# note: we need at least two workers for testing environment
# should also be ok in prod mode since it is suggested also here:
# see https://medium.com/building-the-system/gunicorn-3-means-of-concurrency-efbb547674b7
/usr/local/bin/gunicorn config.wsgi:application --workers $CSD_WEBAPP_SERVER_WEBAPP_WORKERS --bind 0.0.0.0:$CSD_WEBAPP_SERVER_WEBAPP_HTTP_PORT --chdir=/app  --user=django --group=django
