import os

from .api_csrf_middleware import ApiCsrfMiddleware

if os.environ['DJANGO_SETTINGS_MODULE'] == 'config.settings.local':
    from .remote_debugger_middleware import RemoteDebuggerMiddleware
