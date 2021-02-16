**************************
Setup and Deploy to Server
**************************

|PLAN_BASIC|



.. contents:: :local:

Deploying the Carrot Seed Webapp to a single server with docker-compose.

Prepare Server
==============

* create ssh keys
* create hetzner server
* login with ssh keys

First we start with creating ssh keys we need to login to the server without password

.. code-block:: bash

    # creating SSH keys
    ssh-keygen -t rsa -f server_rsa -m PEM

    # this will get you 2 files
    ls -l *_rsa*
    -rw-------  1 christian  staff  2455 Dec  8 09:27 server_rsa         # <-- your private key
    -rw-r--r--  1 christian  staff   576 Dec  8 09:28 server_rsa.pub     # <-- your public key, needed to put on server


In this example we are using a virtual cloud server from Hetzner (https://www.hetzner.com) a Germany based cloud provider.
But it should work with any other server.

Add the ssh keys you created to your ``~/.ssh/config`` so that we can seamlessly login to the server.

.. note:: Always replace 198.51.100.34 with your actual server IP

.. code-block::
    Host 198.51.100.34
        User root
        IdentityFile /absolute/path/to/your/server_rsa


Now you could login to the server already.

.. code-block:: bash

    ssh root@198.51.100.34    # replace 198.51.100.34 with your actual server IP
    exit                      # logout of server again


Now we can copy the needed files to run docker-compose on the server

.. code-block:: bash

    cli/copy_docker_compose_server.sh


Now let's connect the server ip address with your domain. We need to connect in total 4 domains to that IP.
Replace 198.51.100.34 with your server IP address (|REPLACE_DOMAIN|).

.. code-block:: bash
    :caption: Domain DNS Entries

    example.com 3600s A 192.0.2.123
    app.example.com 3600s A 192.0.2.123
    www.example.com 3600s A 192.0.2.123
    cdn.example.com 3600s A 192.0.2.123


Build Docker Images
===================

Make sure you have the url to your docker registry in the environment variable
BEFORE building the images as the registry is always part of the image name


.. code-block:: bash
    :caption: conf/envs/common_env.sh

    # Replace the url with your url of your registry.
    # If you are using the AWS ECR you find it in the AWS Console when trying to create a repo in the ECR.
    export CSD_DOCKER_REGISTRY="4393001929.dkr.ecr.eu-west-1.amazonaws.com"


Select your environment ``local_prod`` and build the images

.. code-block:: bash

    # choose your environment in this example we use the 'prod' env
    cli/env.sh local_prod

    # build the app
    cli/build_webapp.sh




Push Docker Images
==================

First we need to create the docker repositories in our docker registry. In this example we are using the AWS ECR docker
registry but any other private registry should work. Make sure you choose a private registry otherwise your app and
all your source code will be accessible by the public.

Also make sure you set the AWS IAM Account (with programmatic access and the proper permissions) in the *.secrets.sh's

.. code-block:: bash
    :caption: conf/envs/prod_env.secrets.sh

    # if the docker image registry is an AWS ECR set the following
    export CSD_AWS_ECR=true
    export CSD_AWS_ECR_KEY="<your iam user key with access to the ecr>"
    export CSD_AWS_ECR_SECRET="<your iam user secret>"


create the following repositories

* <project-name>-webapp-server-redis
* <project-name>-webapp-server-proxy
* <project-name>-webapp-server-webapp-assets-builder
* <project-name>-webapp-server-webapp
* <project-name>-webapp-frontend-webapp
* <project-name>-webapp-server-postgres
* <project-name>-webapp-server-minio-init-job
* <project-name>-webapp-server-webapp-assets-builder
* <project-name>-webapp-server-bid


.. code-block:: bash

    # now push the images with the tag 'local_prod' which your previously build
    cli/push_webapp.sh local_prod


On the Server
=============

* Login to the server
* Install prerequisites
* pull docker images from registry
* start webapp

Login to the Server
-------------------

Login to your server terminal first


.. code-block:: bash

    ssh root@198.51.100.34    # replace 198.51.100.34 with your actual server


Install prerequisites
---------------------

We install the needed software on the server.

* git
* docker-compose
* aws cli (only needed if we have ECR as registry)


The following are the shell commands for installing this software on Ubunut 20.04 server

.. code-block:: bash

    # install git
    apt-get update
    apt-get install git


    # install docker
    # based on https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
    apt update
    apt install docker-ce -y

    # check if docker is availbale
    systemctl status docker


    # install docker compose
    # based on https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04
    sudo curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # check if docker-compose works
    docker-compose --version

    # install aws cli (only needed if you are using AWS ECR as docker registry)
    apt install awscli -y

Pull docker images from our registry
------------------------------------

Now that we have all prerequisits installed we can pull our docker images

.. code-block:: bash

    cli/env.sh prod
    cli/pull_webapp.sh local_prod


Secure the HTTP Transfer SSL (HTTPS)
------------------------------------

By default you can easily create self signed certificates. We also used that locally during
development. The problem with this approach is, that you need to manually trust them and that
the browser by default marks them as dangerous for the visitor of the website because the
identity is not trusted.

Anyway, we can generate them easily with

.. code-block:: bash

    cli/generate_local_dev_certs.sh

The better approach is to have trusted-by-default certificates which the browser also accepts
as secure. There are a lot of providers which offer paid SSL Certificates. If you buy one of those
certificates either buy the wildcard version of it, means that you can have as many
secure subdomains as you want or you make sure that you have all the subdomains you want
on that certificate. Beside the main domain 'example.com' you should also include
the subdomains (|REPLACE_DOMAIN|):

* app.example.com
* www.example.com
* cdn.example.com

If you got the certificate files you just need to replace the self signed certificates with the
new trusted.

Replace the following two files with the trusted certificate files

.. code-block::

    conf/dev-certs/example.com/privkey.pem     # the private key in PEM format
    conf/dev-certs/example.com/fullchain.pem   # the complete certificate chain


The third option which is more manual work but costs less in terms of certificate issuing is
`Let's encrypt <https://letsencrypt.org/>`_. If you want to install let's encrypt you just need to
install it in the ``infra-serveringress-nginx`` container as it handles all incomming traffic.

Some tutorials which should give a good overview on how to implement let's encrypt:

* https://medium.com/@pentacent/nginx-and-lets-encrypt-with-docker-in-less-than-5-minutes-b4b8a60d3a71
* https://www.cloudbooklet.com/how-to-install-nginx-and-lets-encrypt-with-docker-ubuntu-20-04/

Start webapp
------------

.. code-block:: bash

    # to test if everything is running
    cli/start_webapp.sh local_prod

    # in detach mode for continous serving
    cli/start_webapp_detached.sh local_prod


Copy Data from local to Server
------------------------------

See :doc:`copy_data_from_local_to_server`





