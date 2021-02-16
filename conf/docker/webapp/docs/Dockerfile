FROM python:3.8.6-alpine AS dev


ENV PYTHONUNBUFFERED 1



RUN apk update \
  #### Webapp Server Requirements
  # psycopg2 dependencies
  && apk add --virtual build-deps gcc python3-dev musl-dev \
  && apk add postgresql-dev \
  # Pillow dependencies
  && apk add jpeg-dev zlib-dev freetype-dev lcms2-dev openjpeg-dev tiff-dev tk-dev tcl-dev \
  # CFFI dependencies
  && apk add libffi-dev py-cffi \
  # Translation dependencies
  && apk add gettext \
  # https://docs.djangoproject.com/en/dev/ref/django-admin/#dbshell
  && apk add postgresql-client \
  #### Sphinx Requirements
  # NodePackageManager
  && apk add npm \
  # Typedoc
  # official last known working version is 0.15.0
  && npm install -g typedoc@0.15.0 \
  # Git
  && apk add git \
  # Add make for sphinx
  && apk add make

# Requirements are installed here to ensure they will be cached.
COPY ./Server/webapp/requirements /requirements
# because of a pip bug with --no-cache-dir we need this workaround
# (https://github.com/pypa/pip/issues/6158#issuecomment-456619072)
RUN pip install --cache-dir=/pipcache -r /requirements/local.txt \
    && rm -rf /pipcache \
    && rm -rf /requirements

# set working directory
WORKDIR /docs/src/Frontend
# NOTE: the following execution order of copy and installing is importent in order to cache the node_modules
# see: https://christianfei.com/posts/Cache-speed-up-docker-node-modules/
# install and cache app dependencies
COPY ./Frontend/package.json /docs/src/Frontend/
COPY ./Frontend/package-lock.json /docs/src/Frontend/

# install the node_modules here
RUN npm set unsafe-perm true
RUN mkdir -p /docs/src/Frontend/libs/scss
COPY ./Frontend/libs/scss/package.json /docs/src/Frontend/libs/scss/package.json
RUN npm ci --no-audit


## To start the Docs-Application itself:
COPY ./conf/docker/webapp/docs/start.sh /start.sh
COPY ./conf/docker/webapp/docs/sphinx_live_reload.py /docs/sphinx_live_reload.py
RUN sed -i 's/\r//' /start.sh
RUN chmod +x /start.sh

WORKDIR /docs/sphinx
CMD ["/start.sh"]
