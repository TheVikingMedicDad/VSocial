import socket

from .base import *  # noqa
from .base import env

# GENERAL
# ------------------------------------------------------------------------------

# https://docs.djangoproject.com/en/dev/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['localhost', '0.0.0.0', '127.0.0.1'] + env.list('CSD_WEBAPP_SERVER_ALLOWED_HOSTS')


# TEMPLATES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#templates
TEMPLATES[0]['OPTIONS']['debug'] = DEBUG  # noqa F405

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
# INHERITED


# django-debug-toolbar
# ------------------------------------------------------------------------------
# https://django-debug-toolbar.readthedocs.io/en/latest/installation.html#prerequisites
# NOTE: activating debug toolbar will make calls 10 - 50 times slower
# INSTALLED_APPS += ['debug_toolbar']  # noqa F405

# https://django-debug-toolbar.readthedocs.io/en/latest/installation.html#middleware
MIDDLEWARE = ['webapp.core.middleware.RemoteDebuggerMiddleware'] + MIDDLEWARE  # noqa F405

# https://django-debug-toolbar.readthedocs.io/en/latest/configuration.html#debug-toolbar-config
# DEBUG_TOOLBAR_CONFIG = {
#     'DISABLE_PANELS': ['debug_toolbar.panels.redirects.RedirectsPanel'],
#     'SHOW_TOOLBAR_CALLBACK': lambda request: True,  # this should be avoided (force show toolbar without checks)
#     'SHOW_TEMPLATE_CONTEXT': True,
# }

# https://django-debug-toolbar.readthedocs.io/en/latest/installation.html#internal-ips
INTERNAL_IPS = ['127.0.0.1']
# needed to get and add the ip of docker host
try:
    hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
    INTERNAL_IPS += [ip[:-1] + '1' for ip in ips]
except:
    pass

# Your stuff...
# ------------------------------------------------------------------------------

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'root': {
        'level': 'DEBUG',
        # 'handlers': ['sentry'],
        'handlers': ['console'],
    },
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s | %(process)d %(thread)d | %(filename)s:%(lineno)d |'
            ' %(message)s'
        }
    },
    'handlers': {
        'console': {'level': 'DEBUG', 'class': 'logging.StreamHandler', 'formatter': 'verbose'}
    },
    'loggers': {
        'django.db.backends': {'level': 'ERROR', 'propagate': False},
        'django.security.DisallowedHost': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': False,
        },
        'requests': {'level': 'WARNING', 'handlers': [], 'propagate': False},
        'urllib3': {'level': 'WARNING', 'handlers': [], 'propagate': False},
        'urllib3.connectionpool': {'level': 'WARNING', 'handlers': [], 'propagate': False},
        'django_drf_filepond': {'level': 'INFO', 'handlers': [], 'propagate': False},
        'webapp.invitation_system': {'level': 'INFO', 'propagate': False},
    },
}
