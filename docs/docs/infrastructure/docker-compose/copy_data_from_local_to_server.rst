******************************
Copy Data from Local to Server
******************************

|PLAN_BASIC|

.. contents:: :local:

This chapter cover how to copy the data of the webapp system from the local development maschine to the
server.

We assume that we have some data locally (eg. we prepared the webiste) in the local_dev environment
and want to bring that data (database and media assets) to the server which is running
in prod environment with docker-compose.

We move the data we use a django backup tool called
`django-dbbackup <https://django-dbbackup.readthedocs.io/en/master/installation.html>`_.


Backup the local data
=====================

Locally we switch to the docker container webbap-server-webapp and do the backup of db and media

.. code-block:: bash

    # make sure the webapp is running or start it otherwise
    cli/start_webapp.sh

    # in another shell switch in the running webapp-server-webapp container
    cli/docker_compose.sh exec webapp-server-webapp /bin/sh

    # in the container we do
    pip install django-dbbackup #
    vi config/settings/base.py #add 'dbbackup' to THIRD_PARTY_APPS list
    to webapp-server-webapp/Dockerfile.base add 'apk add postgresql' to get pg_dump
    python manage.py dbbackup -O ./django_db_bak.sql
    python manage.py mediabackup -O ./django_media_bak.tar


Copy to server
==============

.. code-block:: bash

    rsync -aP ./django_db_bak.sql ./django_media_bak.tar root@app.example.com:/backups


Restore Data on the server
==========================

.. note::

    Because we start from a complete blank DB remove the lines in ``django_db_bak.sql`` ALTER TABLE and DROP Statements
    from the beginning (until SET default_tablespace ='')

.. code-block:: bash

    cli/stop_webapp.sh
    cli/reset_dev_data.sh # !! deletes the current db data and the media data

    # start the needed services for restoring
    cli/docker_compose.sh up -d webapp-server-postgres webapp-server-minio webapp-server-minio-init-job

    cli/copy_to_volume.sh $(PWD)/backups webapp-server-webapp-data-backups
    # restore the db
    cli/docker_compose.sh run --rm -v webapp-server-webapp-data-backups:/backups --no-deps webapp-server-webapp python manage.py dbrestore -I /backups/django_db_bak.sql

    # restore the media backup to the minio
    cli/docker_compose.sh run --rm -v webapp-server-webapp-data-backups:/backups --no-deps webapp-server-webapp python manage.py mediarestore -I /backups/django_media_bak.tar

    # stop the temporary services we needed for restoring
    cli/stop_webapp.sh

    # then you can start the normal webapp again with the data from the backup
    cli/start_webapp_detached.sh


