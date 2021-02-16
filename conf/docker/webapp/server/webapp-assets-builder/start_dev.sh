#!/bin/sh

set -o errexit
set -o nounset

npx webpack --config webpack.dev.js --watch
echo "webapp-assets-builder start_dev Done"
