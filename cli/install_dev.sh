#!/usr/bin/env bash

set -e

source ./cli/load_and_gen_env.sh

pre-commit install
npm install --no-save cypress
