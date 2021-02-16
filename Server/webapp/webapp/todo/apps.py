from django.apps import AppConfig


class TodoConfig(AppConfig):
    name = 'webapp.todo'
    verbose_name = 'Todo'

    def ready(self):
        pass
