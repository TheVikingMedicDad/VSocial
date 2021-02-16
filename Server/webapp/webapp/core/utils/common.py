from __future__ import annotations

import logging
import re
from django.apps import apps
from typing import Callable

log = logging.getLogger(__name__)
# based on https://stackoverflow.com/a/17156414
camel_pattern = re.compile(r'([A-Z])')
under_pattern = re.compile(r'_([a-z])')


def clean_url_from_host_port(host, port, secure=True):
    protocol = 'https' if secure else 'http'
    port_suffix = '' if port == 443 else f':{port}'
    return f'{protocol}://{host}{port_suffix}'


def clean_url(url):
    clean_url = url.replace(':443', '') if url.endswith(':443') else url
    clean_url = clean_url.replace(':80', '') if url.endswith(':80') else clean_url
    return clean_url


def build_absolute_uri(request, location=None, secure=True):
    uri = request.build_absolute_uri(location=location)
    if secure:
        uri = uri.replace('http://', 'https://')
    return uri


def exception_log(func: Callable):
    def wrapper(*args, **kwargs):
        try:
            log.debug('Wrapper executed')
            return func(*args, **kwargs)
        except Exception as e:
            log.exception('Exception:', exc_info=e)
            # log.exception(traceback.format_exc())
            raise e

    return wrapper
