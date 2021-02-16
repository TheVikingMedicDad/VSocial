from django.apps import AppConfig


class UsersAppConfig(AppConfig):

    name = "webapp.users"
    verbose_name = "Users"

    def ready(self):
        try:
            import users.signals  # noqa F401
        except ImportError:
            pass

        # import the handler to execute the registration
        from webapp.users.user_invitation import UserInvitationHandler
