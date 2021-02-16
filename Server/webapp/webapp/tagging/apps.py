from django.apps import AppConfig


class TaggingConfig(AppConfig):
    name = 'webapp.tagging'
    verbose_name = 'Tagging'

    def ready(self):
        pass
