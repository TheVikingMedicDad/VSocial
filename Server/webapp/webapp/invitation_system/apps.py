from django.apps import AppConfig


class InvitationSystemAppConfig(AppConfig):
    name = 'webapp.invitation_system'
    verbose_name = 'Invitation System'
    label = 'invitation_system'

    def ready(self):
        pass
