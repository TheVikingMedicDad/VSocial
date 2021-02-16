#!/usr/bin/env bash
# copies all contents of source dir to the target volume
# COMMAND <source_volume_name> <target_dir>
docker run --rm -v $1:/source -v $2:/dest alpine sh -c "cp -a /source/* /dest/"