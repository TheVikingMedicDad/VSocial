import logging

from django.apps import AppConfig

log = logging.getLogger(__name__)


class GqlAppConfig(AppConfig):
    name = 'webapp.gql'

    def ready(self):
        pass
