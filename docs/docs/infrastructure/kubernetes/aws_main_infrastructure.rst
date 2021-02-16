*******************************
AWS Main Infrastructure Setup
*******************************

|PLAN_ADVANCED|

.. contents:: :local:


We setup the infrastructure for the actual SaaS System. Previously we already setup the multi account AWS infrastructure
which gave us 4 AWS member accounts

#. shared
#. dev
#. staging
#. prod

Besides staging which is only available in the prod environment, the other accounts (dev, staging, prod)
represents our environments (dev, staging, prod). Therefore you can and have to execute the following steps
for each environment you want to deploy to (excluding environments starting with ``local_*`` like local_prod
and local_dev.

Checking prerequisits
=====================

Make sure you have setup the

* :doc:`aws_root_infrastructure`
* and :doc:`aws_shared_infrastructure`

If you have setup the shared infrastructure yourself without the tools from the :guilabel:`Premium` tools
make sure have a working rancher setup and the rancher tokens setup in the environments see :ref:`shared-create-rancher-api-keys`


Init Pulumi
===========

We assue that you have already installed pulumi on your development machine

.. code-block:: bash

    # init the pulumi environment
    $ cli/pulumi_main_init.sh

    # create the main infrastructure
    $ cli/pulumi_main.sh up


Deploy Webapp
=============

After the cluster is provisioned and available (you see the status in rancher.example.com
login with the admin or another user) you can actually deploy your SaaS Webapp.

We need to do three things. We do this manually here instead of the CI system does this automatically.

#. Build the docker images
#. Push the docker images to the docker registry
#. Deploy the app to the kubernetes cluster

Build the Webapp
----------------

.. code-block:: bash

    # we change to local_prod (we can choose any environment but local_dev) as we want optimized and secure builds
    # because the app is exposed to the public
    cli/env.sh local_prod

    # build the app
    cli/build_webapp.sh

After this is finished we have the docker images ready and all tagged with 'local_prod' the selected environment


Push the Webapp
---------------

We are using AWS ECR here as docker registry, so make sure in your ``prod_env.secrets.sh`` the following
variables are set

.. code-block:: bash
   :caption: conf/envs/prod_env.secrets.sh

    # !!! Make sure these lines are added/moved below the definitions of CSD_PULUMI_PROVIDER_SHARED_USER_AWS_KEY
    # and CSD_PULUMI_PROVIDER_SHARED_USER_AWS_SECRET
    export CSD_AWS_ECR=true
    export CSD_AWS_ECR_KEY=$CSD_PULUMI_PROVIDER_SHARED_USER_AWS_KEY
    export CSD_AWS_ECR_SECRET=$CSD_PULUMI_PROVIDER_SHARED_USER_AWS_SECRET

After the variables are in place, we change to the prod environment, as prod environment is the only one with
access to the AWS shared account where the ECR is located

.. code-block:: bash

    # change to prod environment
    cli/env.sh prod

    # push the images with the tag 'local_prod' which we builded previously
    cli/push_webapp.sh local_prod


This can take some time depending on your internet upstream connection 10 - 30minutes.



Deploy Webapp
--------------

#. Check Cluster
#. Download Cluster Credentials
#. Setup Node DNS Entries
#. Deploy Webapp

Check Cluster
^^^^^^^^^^^^^

First we need to check if the cluster is available. Do this by logging in to rancher.example.com (|REPLACE_DOMAIN|).
Look for the cluster ``main-cluster-XXXXXX`` where ``XXXXXX`` is some random id. If the state is ``active`` everything
is fine.


Download Cluster Credentials
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To work with a kubernetes cluster we need to have the cluster credentials. We can download these from within rancher.

#. Click on the cluster ``main-cluster-XXXXXX``
#. In the upper right corner is a button ``Kubeconfig File`` - click it.
#. | Download the file and rename and move it to ``conf/envs/<env>_env_kubeconfig.yaml``
   | So if your are currently viewing the ``dev`` cluster move the kubeconfig
   | file to ``conf/envs/dev_env_kubeconfig.yaml``



Setup Node DNS Entries
^^^^^^^^^^^^^^^^^^^^^^

We need to connect the cluster nodes to our domain DNS system. Because we want to reach the SaaS system (the webapp)
on the following domains  (|REPLACE_DOMAIN|).

* Production (prod) Environment

   * www.example.com (the Website)
   * app.example.com (the Angular Webapp)
   * cdn.example.com (the Content Delivery Network)

* Development (dev) Environment

   * www.dev.example.com (the Website)
   * app.dev,example.com (the Angular Webapp)
   * cdn.dev.example.com (the Content Delivery Network)

* Staging (staging) Environment

   * www.staging.example.com (the Website)
   * app.staging,example.com (the Angular Webapp)
   * cdn.staging.example.com (the Content Delivery Network)


We show here how to setup the DNS Entries for the ``dev``environment other environments work similar.

We need to connect the subdomains with the IP Addresses of the cluster with an DNS A Record. Because in the default
setup there is (yet) no load balancer included we make the "poor mans loadbalancer" with DNS. It works by having
the same A Record multiple times for each node IP address. By default we have three kubernetes nodes in our cluster.
If someone browses to your website the local DNS resolver on their computer gets three possible IP addresses and
choose one randomly. That's how we distribute the traffic across the nodes.

To get the ip addresses of all the cluster nodes login to ``rancher.example.com`` and go to your cluster
``main-cluster-XXXXXX``. In the top menu you should see a menu entry called ``Nodes``. If you click it you'll get
a list of your nodes with the public and private IP addresses of your cluster. On the left are the public IP addresses -
these are the ones we need.

Assume our cluster has three nodes with the following public IP addresses:

* 192.0.2.123
* 198.51.100.34
* 203.0.113.143


We need to add our DNS entries as following. We assume that we want a 1h TTL for our DNS A records.

.. code-block::

   app.dev.example.com 3600s A 192.0.2.123
   app.dev.example.com 3600s A 198.51.100.34
   app.dev.example.com 3600s A 203.0.113.143
   www.dev.example.com 3600s A 192.0.2.123
   www.dev.example.com 3600s A 198.51.100.34
   www.dev.example.com 3600s A 203.0.113.143
   cdn.dev.example.com 3600s A 192.0.2.123
   cdn.dev.example.com 3600s A 198.51.100.34
   cdn.dev.example.com 3600s A 203.0.113.143


Add these entries via your Domain Provider or if you are using amazon you can import this snippet as zone file
(|REPLACE_DOMAIN|).


Deploy Webapp
^^^^^^^^^^^^^

This step needs all the previous steps to be completed. Otherwise deployment will fail. To deploy the webapp we
need to select our environment we want to deploy the system to (dev, staging, prod). In this example we assume
``dev`` environment as the target cluster.



Because we are deploying to an AWS EC2 Cluster we need to make sure the Cluster is using the correct block storage class

.. code-block:: bash
   :caption: conf/envs/dev_env.sh

   export CSD_K8S_DEFAULT_STORAGE_CLASS="aws-gp2"


.. code-block:: bash

   # we change to the environment we want to deploy
   cli/env.sh dev

   # deploy some cloud specific things (eg. storage classes)
   # we need to call this only once per cluster
   cli/deploy_infra_aws_k8s.sh

   # deploy some infra things for the webapp
   # we need to call this only once per cluster
   cli/deploy_webapp_infra.sh

   # we deploy the webapp
   cli/deploy_webapp.sh local_prod

If you are logged in to Rancher and see your cluster.


Setup E-Mail Sending System
===========================

For E-Mail sending you just need an SMTP Server, if you don't have one you can use AWS SES (Simple Email Sending).
Because
