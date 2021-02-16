#!/usr/bin/env bash

set -ex


source ./cli/load_and_gen_env.sh

./cli/reset_dev_webapp_data.sh
./cli/reset_dev_minio_data.sh