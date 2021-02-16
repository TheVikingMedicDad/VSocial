import logging

from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

log = logging.getLogger(__name__)


class ReverseProxyMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if "HTTP_X_FORWARDED_FOR" in request.META:
            client_ip = request.META["HTTP_X_FORWARDED_FOR"].split(',')[0]
            request.META['REMOTE_ADDR'] = client_ip
        else:
            if not settings.DEBUG:
                log.warning(
                    f'Could not found HTTP_X_FORWARDED_FOR in request.META,'
                    + f' maybe you should remove this middleware: {request.META}'
                )
            else:
                pass
