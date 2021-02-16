#!/bin/bash

set -e

source ./cli/load_and_gen_env.sh

echo "NOTE: Needs to run on a fresh system, otherwise data might conflict with automatied tests."
echo "Start creating some testing records and save it as db snapshots"
curl -skSf "https://${CSD_WEBAPP_PUBLIC_HOST}:${CSD_WEBAPP_PUBLIC_HTTPS_PORT}/api/testing/create-testing-db-template/"
echo "Testing record snapshots created"
