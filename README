Quickstart
##########

Get it running
**************

Because of docker it is pretty easy to get everything up and running.
To really develop conveniently locally you need to install some
additional dependencies which are explained in :ref:`start_devel_section`.

For windows 10 machines
=======================

-  Install Windows Subsystem for Linux >
   https://docs.microsoft.com/en-us/windows/wsl/install-win10
-  copy project files in the linux subsystem

Requirements
============

In order to run your project accordingly some requirements must be met.
On your machine you need to install:

- Docker (https://www.docker.com/)
- bash or compatible shell

Install docker and docker compose
---------------------------------

To run docker you need to download docker for your platform. You can get
the installation files at the following link: >
https://docs.docker.com/install/

You also need to install Docker Compose. For Windows and Mac, docker
compose is installed together with docker. For all other platforms you
need to install it manually. You can find the instructions at the
following link > https://docs.docker.com/compose/install/.

If you want to make sure, that docker is running open a console and type
the following command:

::

   docker info

You should get an output like:

.. code:: client:

    Debug Mode: false

   Server:
    Containers: 7
     Running: 3
     Paused: 0
     Stopped: 4
    Images: 278
    Server Version: 19.03.8
    Storage Driver: overlay2
   ...

Configuring docker for windows
------------------------------

When you are using windows you need to configure docker. The following
link will guide you through this process: >
https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly





Configure environment
=====================
For local development set the current environment to ``local_dev``

.. code:: bash

   cli/env.sh local_dev

Generate local SSL Certs for development
========================================

TBD: why do we need this certificates? Explain this section a little bit
more in detail

Generates local self signed ssl certificates which are located in
conf/dev-certs, can be checked in.

.. code:: bash

   cli/generate_local_dev_certs.sh

Add the hostnames for development
=================================

Add the local domains eg. (|REPLACE_DOMAIN|)

- app.example.com.local
- www.example.com.local
- docs.example.com.local
- cdn.example.com.local

to ``/etc/hosts`` like this.


::

   127.0.0.1       localhost app.example.com.local www.example.com.local docs.example.com.local cdn.example.com.local
   255.255.255.255 broadcasthost
   ::1             localhost

In Windows you need to set your hosts file in the Windows machine (this
is copied in the Linux subsystem). Open power shell as administrator and
edit following file: ``c:\windows\system32\drivers\etc\hosts``.


Build System
============

In order to start your webapp you need to run the following commands:

.. code:: bash

    cli/build_webapp.sh

The command build_webapp.sh installs everything needed within the docker
container. It’ll download everything automatically so make sure that you
have internet access. This command takes around 10 minutes (TBD: measure
time).
~

Start System
============

.. code:: bash

   cli/start_webapp.sh

TBD: explain containers

The command start_webapp.sh starts all docker containers. The following
containers will be started:

- webapp-server-postgres-container
- webapp-server-bid-container
- webapp-server-proxy-container
- webapp-server-redis-container
- infra-server-ingress-nginx-container
- webapp-frontend-webapp-container
- webapp-docs-container
- webapp-server-minio-container

For starting up some helper containers are also started but they are
stopped immediately after everything is up and running:

- example-project_webapp-server-minio-init-job_1
- webapp-server-webapp-base-container
- webapp-server-proxy-base-container
- webapp-server-webapp-assets-builder-container
- webapp-server-webapp-assets-builder-base-container

When all the containers are started everything can be reached (|REPLACE_DOMAIN|):
- app.example.com.local -> the angular webapplication
- www.example.com.local -> the wagtail website
- docs.example.com.local -> the documentation

Don't forget to trust the certificates, otherwise it won't work.

.. _start_devel_section:
Install Requirements for Development
************************************

In order to run your project accordingly some requirements must be met.
On your machine you need to install:

- Docker (https://www.docker.com/)
- bash or compatible shell
- Python 3.8 (eg. use https://github.com/pyenv/pyenv to have multiple versions in parallel)
- PostgreSQL (https://www.postgresql.org/)
- virtualenv
- node (version v12) and npm (version 6) (https://nodejs.org)
- angular cli
- nrwl cli (`npm install -g @nrwl/cli`)

If you are using an IDE like PyCharm, Webstorm, etc you have to install
all dependencies locally as well in order to get the full IDE support and autocompletion.

Server installation
===================

The following command will install all needed dependencies for server
development.

.. code-block:: bash

   ./cli/install_dev_server_locally.sh



Frontend installation
=====================

To install the frontend dependencies you need to run the following
commands. This will download all used packages so that you can use them
within your IDE.

.. code-block:: bash

   ./cli/install_dev.sh
   ./cli/install_dev_frontend_webapp.sh

Install angular cli with the following command

.. code-block:: bash

    npm install -g @angular/cli

Setup IDE (Pycharm)
==================

-  Right click on ``Server/webapp`` > ``Mark Directory as ...`` >
   ``Source Root``
-  Settings (``Cmd + ;``) > ``Project: cnc-base`` >
   ``Project Interpreter``
-  Click on ``Project Interpreter`` dropdown > ``Show all`` > click
   ``+`` (bottom left)
-  On the left side menu click ``Virtualenv Environment`` >
   ``Existing environment`` > click ``...``
-  Browse to
   ``... /vsocial/Server/webapp/ENV/bin/python3.8``
-  Click ``OK`` on all dialogs
-  Check if it is working
-  Done


Install dependencies for test system
************************************


Initialize database and create users
====================================

The following command
will add testing data to the database. Make sure that all containers are started
when you execute this command, because the data is stored in the docker
containers.

.. code:: bash

   cli/create_dev_db_testing_snapshots.sh


whenever you need to recreate the existing db snapshots eg. because you change testing data or
change some models, do the following commands to recreate it from a fresh syste:

.. code:: bash

   cli/stop_webapp.sh                           # stops all docker containers
   cli/reset_dev_data.sh                 # delete all relevant volumes (eg. db volumes)
   cli/start_webapp.sh                          # starts the containers who do some bootstrapping
   cli/create_dev_db_testing_snapshots.sh       # creates the snapshot from the fresh running system





Setup test environment for webserver
====================================

The following command will install all libraries needed for testing the
webserver

.. code-block:: bash

   ./cli/install_dev_server_tests_api.sh

