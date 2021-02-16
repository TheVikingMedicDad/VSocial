Changelog
#########


Version 1.3.2
*************

Changes
-------

* [CSD-378] - Added Pulumi for AWS Infrastructure Setup
* [CSD-383] - Upgrade awscli v2+ syntax in cli scripts
* [CSD-384] - Change beta-->staging & dev.www.example.com --> www.dev.example.com
* [CSD-388] - Add docker-compose deployment approach
* [CSD-389] - Copy local data to docker-compose deployment
* [CSD-390] - Disable Minio-Admin in docker-compose prod according to google policies

Further release details see :doc:`changes/release_1_3_2`

Fixed Bugs
----------
* [CSD-391] - deploy_webapp fails due to broken minio init job



Breaking
--------

* :ref:`csd-384`
* :ref:`csd-383`
* :ref:`csd-390`

Known Issues
------------

See :ref:`v1.3.2-known-issues`

Version 1.3.1
*************

Changes
-------

 * [CSD-360] - Website: css_classes and flat_button no longer required fields


Fixed Bugs
----------

 * [CSD-359] - Website: removed hardcoded links to demo-todo-app.cnc.io on "get app" buttons in example website data



Version 1.3.0
*************

Changes
-------

* [CSD-299] - Refined Demo Todo App
* [CSD-325] - System upgrade to recent versions (Angular, Django, Docker Images)
* [CSD-337] - Improve namespacing of kubernetes configmaps
* [CSD-338] - Improve testing records architecture
* [CSD-339] - Add reverse proxy middleware to get real IP in django
* [CSD-340] - Make nginx proxy and ingress aware of container IP changes
* [CSD-341] - Make kubernetes image pull policy configurable in each environment
* [CSD-356] - Add quick delete in demo todo app when ctrl/meta key is pressed
* [CSD-357] - Cleaned logo images names
* [CSD-358] - Rename old Prefixes CWA/CBP to CSD

Fixed Bugs
----------

* [CSD-351] - Deployment migration issues

Breaking
--------

* Angular upgrade from 7 to 10 have introduced some breaking changes: see https://update.angular.io/
* Support for IE10 dropped as several dependencies dropped it and also Microsoft is fading it out
* Frontend dir structure migrated to xplat https://github.com/nstudio/xplat
* Due to the quite big version upgrades it's best to remove virtual envs and node_modules and recreate/reinstall them.
* switched to python version 3.8.6, with pyenv you can also easily switch on a project level (recreate virtual envs afterwards)

Further release details see :doc:`changes/release_1_3_0`


Version 1.2.7
*************

Changes
-------

* [CSD-295] - Refine Todo Website
* [CSD-308] - Add mat-grey palette
* [CSD-310] - Add python snapshot testing to api tests
* [CSD-317] - Add markdown model field and support for django admin
* [CSD-322] - Improve design account confirm reminder
* [CSD-323] - Reset scroll position on route change


Version 1.2.6
*************

Changes
-------
* [CSD-287] - Add cwa-page as css class mixin for basic page style
* [CSD-293] - Improved test db init/reset handling
* [CSD-294] - Restore of testing snapshot should keep django admin login session for better debugging
* [CSD-300] - Added more variables to scss
* [CSD-301] - Make CMS admin accessible from app.example.com/cms

Fixed Bugs
----------
* [CSD-288] - Remove hardcoded mat-button classes in scss
* [CSD-302] - Missing template types for CwaDataService.query


Version 1.2.5
*************

Changes
-------
* [CSD-235] - Adapt demo project (color scheme & demo logo)
* [CSD-280] - Add image slider in Todo app login and signup

Version 1.2.4
*************

Fixed Bugs
----------

* [CSD-270] - "Invalid token" bug

Version 1.2.3
*************

Changes
-------

* Added changelog

Breaking
--------
* Use CwaDjangoObjectType instead of DjangoObjectType
* In all previous DjangoObjectTypes rename all filter_fields to cwa_filter_fields
