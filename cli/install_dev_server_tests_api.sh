#!/usr/bin/env bash

set -xe

source ./cli/load_and_gen_env.sh

cd Server/tests/api

if [ ! -f env ]; then
    # if virtual environment doesnt exist, create one
    virtualenv -p python${PYTHON_VERSION} env
fi

source env/bin/activate
pip3 install -r requirements.txt
deactivate
