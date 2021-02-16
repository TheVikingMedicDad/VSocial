#########################
# base stage
#########################
FROM nginx:1.16-alpine AS base

RUN apk update \
  && apk add bash

# conveniance symlinks for the docker log under /var/log/docker/stdout|stderr
RUN mkdir /var/log/docker && \
    ln -sf /proc/1/fd/1 /var/log/docker/stdout && \
    ln -sf /proc/1/fd/2 /var/log/docker/stderr


#########################
# dev stage
#########################
FROM base AS dev

COPY ./conf/docker/infra/ingress-nginx/start_dev.sh /start.sh
RUN sed -i 's/\r//' /start.sh
RUN chmod +x /start.sh

# copy the nginx conf file
COPY ./conf/docker/infra/ingress-nginx/nginx_dev.conf /etc/nginx/conf.d/nginx.tmpl
CMD /bin/bash -c "/start.sh >/var/log/docker/stdout 2>/var/log/docker/stderr"


#########################
# prod stage
#########################
FROM base AS prod

COPY ./conf/docker/infra/ingress-nginx/start_prod.sh /start.sh
RUN sed -i 's/\r//' /start.sh
RUN chmod +x /start.sh

# copy the nginx conf file
COPY ./conf/docker/infra/ingress-nginx/nginx_prod.conf /etc/nginx/conf.d/nginx.tmpl
CMD /bin/bash -c "/start.sh >/var/log/docker/stdout 2>/var/log/docker/stderr"