#!/usr/bin/env bash

set -xe

source ./cli/load_and_gen_env.sh

cd Frontend/

nx test web-app
