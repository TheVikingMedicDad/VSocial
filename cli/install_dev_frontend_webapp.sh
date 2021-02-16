#!/usr/bin/env bash

set -xe

source ./cli/load_and_gen_env.sh

cd Frontend
npm install

# install cypress only on host machine
# the execution time of "npm install" in docker improves from 5min to 1min
# Do not save them to the package.json file, because this file would be copied into the docker
# image and we do not want to have cypress in the docker image, because we can not use it in a node docker!
# npm install --no-save cypress@3.1.1 @bahmutov/add-typescript-to-cypress@2.0.0
npm install --no-save cypress