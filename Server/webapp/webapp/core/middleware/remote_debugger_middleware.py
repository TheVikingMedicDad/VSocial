import logging
import os

from django.utils.deprecation import MiddlewareMixin

from webapp.core.utils.debugger_utils import DEBUGGER_FLAG_FILE, connect_debugger

log = logging.getLogger(__name__)


class RemoteDebuggerMiddleware(MiddlewareMixin):
    def process_request(self, request):

        if not os.path.isfile(DEBUGGER_FLAG_FILE):
            return
        try:
            log.debug('=== debugger enabled ===')
            connect_debugger(reconnect=True)
        except:
            pass
