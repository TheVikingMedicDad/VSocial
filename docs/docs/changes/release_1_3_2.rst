.. _release-1-3-2:

Release 1.3.2
#############

Changes
=======

[CSD-378] - Added Pulumi for AWS Infrastructure Setup
-----------------------------------------------------

We added `Pulumi <https://www.pulumi.com>`_ as additional helper to have the deployment infrastructure as code
(Infrastructure-as-Code, IaS).


.. _csd-383:

[CSD-383] - Upgrade awscli v2+ syntax in cli scripts
----------------------------------------------------

We upgraded some AWS related helper scripts to use the new awscli v2+ syntax for docker login.

* ``cli/push_webapp.sh``
* ``cli/pull_webapp.sh``

.. note::

    Make sure you upgrade `AWS cli v2+ <https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html>`_
    locally on your dev computer if you are using these scripts.


.. _csd-384:

[CSD-384] - Change beta-->staging & dev.www.example.com --> www.dev.example.com
-------------------------------------------------------------------------------

We changed the "beta" environment to "staging" because it is a more appropriate name.

Further more we changed the default domain schema for environments. Reason for this was that
with the new schema we easily can have individual DNS Servers per environment to separate the
environments even more.

We moved the environment identifier from prefix to a subdomain postfix. See the examples below

* dev.www.example.com (old) -->  www.dev.example.com (new)
* dev.app.example.com (old) -->  app.dev.example.com (new)
* dev.cdn.example.com (old) -->  cdn.dev.example.com (new)

.. note:: Make sure to change your DNS Settings if you upgrade.

[CSD-388] - Add docker-compose deployment approach
--------------------------------------------------

Added documentation and helper tools for a docker-compose based deployment to a single server.
See :doc:`/docs/infrastructure/docker-compose/index`.


[CSD-389] - Copy local data to docker-compose deployment
--------------------------------------------------------

If you want to copy local data to your deployed server infrastructure we added documentation and helper tools for it.
See :doc:`/docs/infrastructure/docker-compose/copy_data_from_local_to_server`.

.. _csd-390:

[CSD-390] - Disable Minio-Admin in docker-compose prod according to google policies
-----------------------------------------------------------------------------------

As google accidentally detects a phisihing attack at the minio admin interface we disabled it in production.

.. note::

    Because we added the environment variable to a stateful set in kubernetes, we need
    to manually set these changes as stateful sets are immutable on most properties.

    .. code-block:: bash

        # change to the environments you want to update (eg. prod)
        cli/env.sh prod

        # update the stateful sets environment variables
        cli/kubectl.sh set env sts/webapp-server-minio MINIO_BROWSER=off

        # delete the pods, so that they recreate and use the new environment variables
        cli/kubectl.sh delete pods webapp-server-minio-0

Fixed Bugs
==========

[CSD-391] - deploy_webapp fails due to broken minio init job
------------------------------------------------------------

Deployment recently fails in CD system as minio/mc (the minio command image) used in the minio init job image was
not pinned to a fixed version and they removed the previously installed wget. We pinned the version to the latest
and installed wget manually as we rely on it for minio ready checks before initializing the minio buckets from the
init job container.


Breaking
========

* :ref:`csd-384`
* :ref:`csd-383`
* :ref:`csd-390`


.. _v1.3.2-known-issues:

Known Issues
============

* | Angular SSR is currently broken, container webapp-frontend-ssr image doesn't build in prod target
  | (local_prod, dev, staging, prod).
  | As a workaround change the settings of your project in the `Carrot Console <https://app.cnc.io>`_ and disable the
  | 'Angular SSR' option.