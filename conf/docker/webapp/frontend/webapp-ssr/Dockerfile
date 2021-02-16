#########################
# base stage
#########################

# docker based on a node docker (https://hub.docker.com/_/node/)
FROM node:12.18 AS base

# install tools
#RUN apt-get update; \
#    apt-get install -y vim net-tools

# set working directory
WORKDIR /app

# NOTE: the following execution order of copy and installing is importent in order to cache the node_modules
# see: https://christianfei.com/posts/Cache-speed-up-docker-node-modules/
# install and cache app dependencies
COPY ./Frontend/package.json /app
COPY ./Frontend/package-lock.json /app

# install the node_modules
RUN npm set unsafe-perm true
RUN npm ci --no-audit

COPY ./Frontend/angular.json ./Frontend/tsconfig.json /app/

# copy the pre-build script
COPY ./Frontend/tools/generate_environment.sh /app/tools/generate_environment.sh

#########################
# dev stage
#########################
# no dev stage

#########################
# prod stage
#########################
FROM base AS build

# add app
COPY ./Frontend/apps/web-app /app/apps/web-app

# build the angular app in prod mode
RUN npm run build:ssr


#########################
# prod stage: prod-ssr  -> container for running ssr
#########################
# prod container is also a node container
FROM node:12.18-alpine AS prod-ssr

# copy the compiled angular app
COPY --from=build /app/dist/apps/web-app /app/dist/apps/web-app
COPY ./Frontend/package.json /app/package.json

WORKDIR /app

# start the node server with server-side-rendering
CMD npm run serve:ssr
