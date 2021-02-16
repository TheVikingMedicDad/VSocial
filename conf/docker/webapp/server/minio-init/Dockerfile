FROM  minio/mc:RELEASE.2020-12-10T01-26-17Z

COPY ./conf/docker/webapp/server/minio-init/init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

# we need wget for the check if minio servers are available
RUN  \
     microdnf update --nodocs && \
     microdnf install wget --nodocs && \
     microdnf clean all

ENTRYPOINT ["/bin/sh"]
CMD ["/usr/local/bin/init.sh"]