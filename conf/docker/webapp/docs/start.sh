#!/usr/bin/env sh

set -o errexit
set -o pipefail
set -o nounset

typedoc /docs/src/Frontend/apps/web-app  --ignoreCompilerErrors --tsconfig /docs/src/Frontend/apps/web-app/tsconfig.app.json
python /docs/sphinx_live_reload.py /docs/sphinx/ /docs/build/html
