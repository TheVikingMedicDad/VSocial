#!/usr/bin/env bash

set -e

source ./cli/load_and_gen_env.sh

cd Server/webapp

if [ ! -f env ]; then
    # if virtual environment doesnt exist, create one
    virtualenv -p python${PYTHON_VERSION} env
fi

source env/bin/activate

# export Postgres Path because of the python postgres driver:
export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/latest/bin

pip3 install -r requirements/local.txt
deactivate
