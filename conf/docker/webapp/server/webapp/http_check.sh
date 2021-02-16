#!/usr/bin/env sh

# check if minio is present
until wget -q --spider $1
do
  echo "Couldn't reach $1, try again after sleeping"
  sleep 3
done
echo "$1 reached!"