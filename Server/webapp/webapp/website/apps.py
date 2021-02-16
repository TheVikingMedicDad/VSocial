from django.apps import AppConfig


class WebsiteConfig(AppConfig):
    name = 'webapp.website'
    verbose_name = 'Website'

    def ready(self):
        pass
