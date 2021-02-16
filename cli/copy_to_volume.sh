#!/usr/bin/env bash
# copies all contents of source dir/source volume to the target dir/volume
# COMMAND <source_dir_abs_path/volume_name> <target_dir/volume_name>
# example: cli/copy_to_volume.sh $(PWD)/backups webapp-server-webapp-data-backups
docker run -it --rm -v $1:/source -v $2:/dest alpine sh -c "cp -a /source/* /dest/ && ls -la /dest/"