#!/usr/bin/env bash

set -e

source ./cli/load_and_gen_env.sh

cd Server/webapp
source env/bin/activate
python manage.py makemessages --no-wrap -e txt,html --ignore "env/*"
deactivate