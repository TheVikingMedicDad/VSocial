#!/usr/bin/env bash

set -e

source ./cli/load_and_gen_env.sh

cd Server/tests/api
source env/bin/activate
# we pass all given arguments to pytest:
pytest "$@"
