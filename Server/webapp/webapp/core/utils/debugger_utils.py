import logging
import os
import socket

import pydevd

log = logging.getLogger(__name__)


DEBUGGER_FLAG_FILE = '___debugger_flag___'


def connect_debugger(reconnect=False):
    # hostname host.docker.internal is  only available on MacOs and Windows (not Linux atm)
    docker_host_ip = socket.gethostbyname('host.docker.internal')
    log.debug(f'Docker Host IP: {docker_host_ip} ')
    pydevd_port = int(os.environ.get('CSD_WEBAPP_PYDEVD_PORT', 4444))

    try:
        if reconnect:
            pydevd.stoptrace()
        pydevd.settrace(
            docker_host_ip,
            port=pydevd_port,
            stdoutToServer=True,
            stderrToServer=True,
            suspend=False,
        )
    except ConnectionRefusedError as e:
        # log.exception(f'pydev connection refused for {docker_host_ip}:{pydevd_port}')
        raise


def disconnect_debugger():
    pydevd.stoptrace()
