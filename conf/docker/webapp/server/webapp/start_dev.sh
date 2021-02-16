#!/bin/sh

set -o errexit
set -o nounset

/postgres_check.sh

python manage.py check


# to avoid compiling venv site-package's .po files every time
# we only want to compile our own messages
cd locale
echo "---> Compile only messages in our locale folder:"
python ../manage.py compilemessages
cd ..

echo "--> Initial Migrating"
python manage.py migrate

if [ "$CSD_WEBAPP_SERVER_WEBAPP_MAKEMIGRATIONS" = "true" ]; then
    echo "--> Creating Migrations"
    python manage.py makemigrations --name gen
fi

echo "--> Migrating"
python manage.py migrate
python manage.py collectstatic --noinput

if [ "$CSD_DEPLOY_WITH_DEMO_DATA" = "true" ]; then
  echo "--> Add website demo data"
  python manage.py setup_example_website_data
fi


python manage.py runserver 0.0.0.0:$CSD_WEBAPP_SERVER_WEBAPP_HTTP_PORT
