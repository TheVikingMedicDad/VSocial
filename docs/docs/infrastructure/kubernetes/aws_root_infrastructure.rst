************************
AWS Root Infrastructure Setup
************************

|PLAN_ADVANCED|

.. contents:: :local:


Setup Root AWS Account
======================

A little bit of manual work still has to be done. The root account for AWS needs to be created manually.
Therefore go to https://portal.aws.amazon.com/gp/aws/developer/registration/index.html. After signing in
to the console at aws.amazon.com.

#. Go to the Services -> (Identity and Access Management) IAM and create a new user called ``admin_api``
#. Select ``programmatic access``
#. In the set permissions step choose 'attach existing policies directly' and choose ``AdministratorAcceess``
#. Save the Access Key ID and the Secret Access Key in a secure password vault eg. LastPass or similar for later usage.

Note: It's a best practice to use the root user only to create IAM users, groups, and roles.
Use multi-factor authentication for your root user.


AWS Root API User
---------------------

Create an IAM user ``admin_api`` which can only use the AWS API on the master account.

Create a new user in the IAM Service, set the option "Programmatic access". In the "Set permissions" step
click on "Attach existing policies directly" and add "AdministratorAccess" Policy.

Save the Access Key ID and the Secret Access Key in a secure password vault eg. LastPass or similar for later usage.

AWS Root Console User
---------------------

Create an IAM user ``admin_console`` which can login to the master account and
switch to child accounts.

Create a new user in the IAM Service, set the option "AWS Management Console access". In the "Set permissions" step
click on "Attach existing policies directly" and add "AdministratorAccess" Policy.

To allow this user to switch accounts we need to give him the permission to do so.
For details see https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_permissions-to-switch.html

Also in the IAM Service we create a new Policy which we then assign to the user/groups who should be able to
switch "accounts" (technically they only switch roles, but it is basically similar to switching the account)

Click on create policy and copy the following in the JSON tab

.. code-block:: json

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Resource": "*"
            }
        ]
    }

Name the policy "CsdSwitchAccountPolicy" or whatever you want to call it.

Now open the "admin_console" user again and add a permission. Again choose "Attach existing policies directly" and
select the "CsdSwitchAccountPolicy"

That's it, user is prepared now to switch to the member accounts we create in the next steps without logging out and in.




Setup Pulumi
============

To Setup Pulumi we need to to the following steps

#. Create AWS S3 State Bucket
#. Create Bucket Policy
#. Create KMS Key
#. Create State User with permission for bucket

We use pulumi for provisioning the very base level of the infrastructure. In this example we use AWS extensively and
provision it with pulumi (https://www.pulumi.com ) We are not using the pulumi paid service, instead we use AWS as
a backend service and secret store as it is cheaper and fullfills the requirements for most smaller teams.
You can migrate at any time to the Pulumi Service.

Create AWS S3 State Bucket
--------------------------

Login to aws console to the root account to create an s3 bucket (Service --> S3) with the name "<project-name>-pulumi-state-bucket-root"
The bucket name must match the env variable ``CSD_PULUMI_STATE_BACKEND_ROOT`` prefixed with ``s3://``. Make sure the
bucket is NOT visible publicly (should be the AWS default settings). Everything else can be left as default.

.. code-block:: bash
    :caption: conf/envs/common_env.sh
    # Pulumi (Infrastructure as Code)
    # ...
    export CSD_PULUMI_STATE_BACKEND_ROOT=s3://$CSD_PROJECT_NAME-pulumi-state-bucket-root


Create Bucket Policy
--------------------

To restrict the pulumi state root user to access only this single bucket to read and save the pulumi root state we need
to create a AWS Policy for that.

Again in the AWS Console in the IAM Service go to "Policies" --> "Create Policy". Go to the JSON Tab and clear
the existing content from the text field. Copy the following json and replace ``<project-name>`` with your
actual project name from ``CSD_PROJECT_NAME``.

.. code-block:: json

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                            "s3:GetBucketLocation",
                            "s3:ListAllMyBuckets"
                          ],
                "Resource": "arn:aws:s3:::*"
            },
            {
                "Effect": "Allow",
                "Action": "s3:*",
                "Resource": [
                    "arn:aws:s3:::<project-name>-pulumi-state-bucket-root",
                    "arn:aws:s3:::<project-name>-pulumi-state-bucket-root/*"
                ]
            }
        ]
    }

We name it ``CsdRootStateS3BucketAccess``.

Create State User
-----------------

We need a new user for pulumi which is only needed for writing and reading the state of the whole infrastructure stack
in a S3 bucket and be able to store secrets with the aws kms service. Besides that it has no permissions.

In the AWS Console as root user or the administrator IAM user do the following:

#. Go to the Services -> (Identity and Access Management) IAM and create a new user called ``pulumi_state_root``
#. Select ``programmatic access``
#. In the set permissions step choose 'attach existing policies directly' and choose ``CsdRootStateS3BucketAccess``
#. Save the Access Key ID and the Secret Access Key in a secure password vault eg. LastPass or similar for later usage.



Create KMS Key
--------------

For secrets we have in our pulumi provision process, or variables we want to store in the state encrypted we need
a secret provider for that. We chose to use AWS Key Management Service (KMS). We create a key which we then set in
our environment system as variable.

Login to the AWS Console in the root account with an administrative user. Go to the Key Management Service (KMS) Service
and click on **create key**.

In **Step 1.** we can leave the default values.

In **Step 2.** We set the ``Alias`` field to
``<project-name>-pulumi-state-key-root`` for easier identification (this is optional)

In **Step 3.** we choose ``admin_console`` user for the **Define key administrative permissions**

In **Step 4** we choose ``pulumi_state_root`` user for the **Define key usage permissions**

In **Step 5** leave defaults and click "Finish"

When the key is created copy the ``Key ID`` (this is a uuid4 string) to the ``CSD_PULUMI_SECRETS_PROVIDER_ROOT``
add a prefix ``awskms://`` and postfix with the region where the key is located (The region which is selected in the
console during creation of the key).

.. code-block:: bash
    :caption: conf/envs/prod_env.sh

    # Pulumi (Infrastructure as Code)
    # ...
    export CSD_PULUMI_SECRETS_PROVIDER_ROOT="awskms://afffff-dddd-43333-addd-fdffeatdeeeee1?region=eu-west-1"




Init Pulumi
-----------

We are using pulumi as Infrastructure as Code approach so that you can manage the whole server infrastruture
as code. We already provide some infrastructure code in ``conf/pulumi``. If you want to get a good overview
how pulumi works read the "Programming Model" from the official docs https://www.pulumi.com/docs/intro/concepts/programming-model

First we need to set all the created user credentials we created in the previous steps.
As we only have one root account and one overall AWS organisation
we define the AWS Root Account as part of the production environment so it can only be modified when we switch
locally to the environment ``prod`` with ``cli/env.sh prod``.

Therefore we need to set all the needed user credentials in the ``prod_env.secrets.sh`` (if not yet created copy it from
the ``prod_env.secrets.example.sh``.

The following environment variables should then be set:


.. code-block:: bash
    :caption: conf/envs/prod_env.secrets.sh

    export CSD_PULUMI_PROVIDER_ROOT_USER_AWS_KEY=<key from admin_api user>
    export CSD_PULUMI_PROVIDER_ROOT_USER_AWS_SECRET=<secret from admin_api user>

    export CSD_PULUMI_STATE_ROOT_USER_AWS_KEY=<key from pulumi_state_root user>
    export CSD_PULUMI_STATE_ROOT_USER_AWS_SECRET=<secret from pulumi_state_root user>



Then let's install pulumi locally

.. code-block:: bash

    # on Mac OS X install pulumi with brew, on other plattforms see https://www.pulumi.com/docs/get-started/install/#installing-pulumi
    $ brew install pulumi

    # install the pulumi dev environment (python virtualenv) with
    $ cli/install_dev_pulumi.sh

Init the infrastucture stack for the root account

.. code-block:: bash

    # change to prod env
    cli/env.sh prod

    # init the stack and the kms key
    cli/pulumi_root_init.sh


After initialization pulumi has created a new file ``conf/pulumi/root/Pulumi.<project-name>.root.prod.yaml``.
This file has some configurations in it. Don't forget to add it to git.


Create Child Accounts
---------------------

After we setup pulumi, it does the heavy lifting from now on. It does

* Create Organisation
* Create Member Accounts (shared, dev, staging, prod)

    * Create State User for Member Account (no permissions)
    * Create State User Access Key
    * Create S3 State Account
    * Create S3 Policy
    * Attach S3 Policy to User
    * Create KMS Key for State User

    * In Member Account do

        * Create Admin User
        * Create Admin User Access Key
        * Create Admin User Policy


.. code-block:: bash

    # create the child accounts
    $ cli/pulumi_root.sh up

You can then see a summary what will be done, and then you say yes, then these changes will be made on aws.

The output from ``cli/pulumi_root.sh up`` contains all the variables of the newly created aws
member accounts (eg. shared). Add these credentials to your environment files.

*  ``shared`` and ``prod`` related variables should go in the prod environment scripts in ``conf/envs/prod_env*``
*   ``dev`` related variables should go in the staging environment scripts in ``conf/envs/dev_env*``
*   ``staging`` related variables should go in the staging environment scripts in ``conf/envs/staging_env*``


Now that you have initialized all member accounts you can continue with setting up the "Shared Infrastructure".
See :doc:`aws_shared_infrastructure`.

AWS Common Tasks
================

Common things you want to do with your AWS Infrastructure

Login to child root account
---------------------------

See https://aws.amazon.com/premiumsupport/knowledge-center/organizations-member-account-access/


Switch Accounts
---------------

When we login to the root account to  the ``admin_console`` user, we can click in the user menu on *Switch Roles*.
We need to enter the ID of the root account, a numeric number you can find in the *AWS Organisations*-Service.
Role is should be set to ``OrganizationAccountAccessRole`` unless you have created your own one in the account
we want to switch to.


Delete aws member account
-------------------------

Details see: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_accounts_remove.html

#. | because even if an account it is deleted you can never create a new account with the same email address. If that's
   | needed, login to the member account and change the email address to a new random one.
#. | manually remove from organisation, this should fail as the member account needs more infos. But you should get
   | there a link which you should open in an incognito browser tab to login to the member account and add those missing
   | infos.
#. | After you entered all the information, in the last step you can leave the organisation. This fails as they need
   | a couple of days to allow this.
#. after that waiting time you can leave the organisation or remove the member account
#. Now that the account is standalone you can close it.



Pulumi Common Tasks
===================

Common tasks with pulumi.


Import unmanaged existing resources
-----------------------------------

If you manually created resources and want to import them to your pulumi stack so that you can manage it as code
you need to write the code for the existing resource as if it would not exist yet. It should have the same
properties of the already existing resource. If you've done that and will run the ``up`` command it would create
a new resource because pulumi by default ignores existing resources. For full documentation see the pulumi offical docs
at https://www.pulumi.com/docs/guides/adopting/import/

To make pulumi aware that this is an existing resource we just need an additional ``import_`` parameter in the
``ResourceOptions``.

Let's look at an example

.. code-block:: python

    account = aws.organizations.Account(
         'my-existing-account',
         email='my-account-email@example.com',
         name='my-account-15239',
         __opts__=pulumi.ResourceOptions(
             provider=prov, import_='935513528003'
         ),

The parameter ``import_='935513528003'`` makes the difference here, the number is the ID of the existing resource.

If you run ``up`` with the import and pulumi finds the existing resource it will give you similar output:

.. code-block:: bash

    Previewing update (test1-app.root.prod):
         Type                               Name                          Plan
         pulumi:pulumi:Stack                root-test1-app.root.prod
     =   ├─ aws:organizations:Account       my-existing-account           import

After applying the update command ``up`` with yes, the resource is then imported to the pulumi state and can be
managed like any other resource. After importing the resource we can remove the import parameter
``import_='935513528003'``.


Remove resource from pulumi management
---------------------------------------

If you have resources which are in the pulumi stack, therefore managed with pulumi, but you want to exclude them
eg. because you want to manage them manually and don't want to sync it with your infra code, you can do that as well.
This is basically the inverse operation of importing an unmanaged existing resource.


More info on the offical docs site: https://www.pulumi.com/docs/reference/cli/pulumi_state_delete/

It's a simple two step procedure

#. Find the resource urn
#. Remove the resource from pulumi state (resource is not deleted on your cloud provider)

.. code-block:: bash

    # get all resources with their urns to find
    pulumi stack --show-urns

    # delete the resource from the state
    pulumi state delete <resource URN> [flags]


Refresh pulumi based on real infrastructure
-------------------------------------------

For syncing manually changed aws resources which are already managed by pulumi with current state we can use
``pulumi refresh``. For details see offical docs: https://www.pulumi.com/docs/reference/cli/pulumi_refresh/


