*******************************
AWS Shared Infrastructure Setup
*******************************

|PLAN_PREMIUM|

.. contents:: :local:

Setup Rancher
=============


We setup Rancher to manage Kubernetes clusters where we then deploy our server infrastructure

#. Setup K3S Cluster
#. Install Rancher on the K3S Cluster


Setup K3S Cluster
-----------------

Init Pulumi
^^^^^^^^^^^

We assue that you have already installed pulumi on your development machine

.. code-block:: bash

    # init the stack and the kms key
    $ cli/pulumi_shared_init.sh


Prepare SSH Keypair for shared account
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


This ssh key is used to login to all virtual servers (ec2 instances) which are created in the pulumi shared
scope. Save it at a secure place (eg. password manager like LastPass) and NEVER add it to git!

If you have already added a key pair in the aws shared account manually then you just need to tell pulumi
the key pair name

.. code-block:: bash
    # If you already have a key created manuall
    cli/pulumi_shared.sh config set keyName <your-key-name>


If you don't have a key pair yet, we create one now:
So we generate the key pair and save it to the pulumi secrets store which is encrypted on your s3 state bucket

.. code-block:: bash

    # generate key pair (move it to a save location)
    ssh-keygen -t rsa -f shared_rsa -m PEM

    # load the public key to pulumi secrets store
    # you might need to change the path to 'shared_rsa.pub' depending on where you moved the key
    cat shared_rsa.pub | cli/pulumi_shared.sh config set publicKey --

    # load the private key to pulumi secrets store
    # you might need to change the path to 'shared_rsa.pub' depending on where you moved the key
    cat shared_rsa | cli/pulumi_shared.sh config set privateKey --secret --

    # in case your key has a passphrase we need to save it as well
    cli/pulumi_shared.sh config set privateKeyPassphrase --secret <your-passphrase-here>






Setup the shared Infrastructure
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

We assue that you have already installed pulumi on your development machine

.. code-block:: bash

    # create the shared infrastructure
    $ cli/pulumi_shared.sh up

After the script has finished the rancher system is being setup. But we need one more thing.

In your DNS Server (usually you find a web console where you bought your domain) add an
A-Record to the Rancher IP Address which is output by the script similar to this:

.. code-block::

    Diagnostics:
      pulumi:pulumi:Stack (shared-test2-app.shared.prod):
        warning: Note: You need to setup the DNS A Record for the IP below,
        after that Rancher should be accessible through
        https://rancher.example.com
        user: admin
        password: <your initial password you set in the environment>

    Outputs:
      + Rancher Public IP (set DNS A Record for rancher.example.com): "123.123.123.123"

Instead of ``rancher.example.com`` and the IP ``123.123.123.123`` the script outputs
your real values with which you should create the DNS A Record. After you've done that
it needs a couple of minutes to hours (depending on your DNS Provider) until Rancher
is reachable.

If it doesn't get up, you can login to the rancher instance via SSH and have a look
at the logs.

.. code-block::bash

    # replace the path to your private key
    # and the IP with Rancher Public IP from the output of "cli/pulumi_shared.sh up"
    ssh -i /path/to/your/private/key/shared_rsa ubuntu@123.123.123.123

    # On the server you find the log of the user_data setup script at
    tail -f /var/log/user-data.log


.. _shared-create-rancher-api-keys:

Create Rancher API Keys
^^^^^^^^^^^^^^^^^^^^^^^

Log in to rancher with each of the environment accounts (dev, staging, prod) and create one
Api Token for each account. Enter the "Access Key" and the "Secret Key" in the respective
environment secret files:

.. code-block::bash

    export CSD_PULUMI_PROVIDER_MAIN_USER_RANCHER_KEY=<access_key>
    export CSD_PULUMI_PROVIDER_MAIN_USER_RANCHER_SECRET=<secret_key>

