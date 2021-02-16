.. _release-1-3-0:

Release 1.3.0
#############

Dependency Changes
******************

.. code-block:: bash

    pur -r Server/webapp/requirements/base.txt
    Updated python-slugify: 4.0.0 -> 4.0.1
    Updated Pillow: 7.1.1 -> 7.2.0
    Updated argon2-cffi: 19.2.0 -> 20.1.0
    Updated redis: 3.4.1 -> 3.5.3
    Updated django: 3.0.3 -> 3.1.2
    Updated django-crispy-forms: 1.9.0 -> 1.9.2
    Updated django-redis: 4.11.0 -> 4.12.1
    Updated django-taggit: 1.2.0 -> 1.3.0
    Updated django-extensions: 2.2.9 -> 3.0.9
    Updated djangorestframework: 3.11.0 -> 3.12.1
    Updated django-parler: 2.0.1 -> 2.2
    Updated djangorestframework-camel-case: 1.1.2 -> 1.2.0
    Updated attrs: 19.3.0 -> 20.2.0
    Updated django-filter: 2.2.0 -> 2.4.0
    Updated graphene-django: 2.9.1 -> 2.13.0
    Updated django-storages: 1.9.1 -> 1.10.1
    Updated boto3: 1.12.36 -> 1.15.16
    Updated wagtail: 2.8.1 -> 2.10.2
    Updated wagtailtrans: 2.1 -> 2.2.1
    Updated wagtailmenus: 3.0.1 -> 3.0.2
    Updated markdown: 3.2.2 -> 3.3



.. code-block:: bash

    pur -r Server/webapp/requirements/local.txt
    Updated Werkzeug: 0.14.1 -> 1.0.1
    Updated ipdb: 0.11 -> 0.13.4
    Updated psycopg2: 2.7.4 -> 2.8.6
    Updated Sphinx: 3.0.4 -> 3.2.1
    Updated sphinx-copybutton: 0.2.11 -> 0.3.0
    Updated livereload: 2.6.1 -> 2.6.3
    Updated watchdog: 0.9.0 -> 0.10.3
    Updated pytest: 5.3.5 -> 6.1.1
    Updated pytest-sugar: 0.9.2 -> 0.9.4
    Updated flake8: 3.7.9 -> 3.8.4
    Updated coverage: 5.0.3 -> 5.3
    Updated factory-boy: 2.12.0 -> 3.1.0
    Updated django-debug-toolbar: 2.2 -> 3.1.1
    Updated pytest-django: 3.8.0 -> 3.10.0
    Updated watchdog: 0.9.0 -> 0.10.3
    Updated pydevd: 1.9.0 -> 2.0.0
    Updated django-extensions: 2.2.9 -> 3.0.9


.. code-block:: bash

    pur -r Server/webapp/requirements/production.txt
    Updated psycopg2: 2.7.4 -> 2.8.6


.. code-block:: bash

    pur -r Server/tests/api/requirements.txt
    Updated requests: 2.19.1 -> 2.24.0
    Updated pytest: 3.7.2 -> 6.1.1
    Updated pydash: 4.7.4 -> 4.8.0
    Updated python-dateutil: 2.8.0 -> 2.8.1
    Updated snapshottest: 0.5.1 -> 0.6.0

.. code-block:: bash

    Server/webapp: npx npm-check-updates
    @babel/plugin-transform-react-jsx    ^7.8.0  →   removed
    baguettebox.js                      ^1.11.0  →   removed
    html-react-parser                   ^0.10.2  →   removed
    react                              ^16.12.0  →   removed
    react-dom                          ^16.12.0  →   removed
    babel-loader                         ^8.0.6  →    ^8.1.0
    css-loader                           ^2.1.1  →    ^4.3.0
    file-loader                          ^3.0.1  →    ^6.1.1
    html-loader                          ^0.5.5  →    ^1.3.2
    html-webpack-plugin                  ^3.2.0  →    ^4.5.0
    http-server                         ^0.11.1  →   ^0.12.3
    mini-css-extract-plugin              ^0.6.0  →    ^1.0.0
    postcss-loader                       ^3.0.0  →    ^4.0.4
    purgecss-webpack-plugin              ^1.5.0  →   removed
    sass-loader                          ^7.1.0  →   ^10.0.3
    smooth-scroll                       ^16.1.0  →   ^16.1.3
    standard                            ^12.0.1  →   ^14.3.4
    style-loader                        ^0.23.1  →    ^2.0.0
    uglifyjs-webpack-plugin              ^2.1.3  →    ^2.2.0
    url-loader                           ^1.1.2  →    ^4.1.1
    webpack                             ^4.44.2  →    ^5.0.0
    webpack-cli                         ^3.3.12  →    ^4.0.0
    postcss                                 new  →     8.1.1



