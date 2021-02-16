import logging

from django.apps import AppConfig
from django.db.models.signals import post_migrate

log = logging.getLogger(__name__)


def add_groups(sender, **kwargs):
    from django.contrib.contenttypes.models import ContentType
    from django.contrib.auth.models import Permission

    user_contenttype = ContentType.objects.get(app_label='users', model='user')
    perm_view_user = Permission.objects.get(content_type=user_contenttype, codename='view_user')
    perm_change_user = Permission.objects.get(content_type=user_contenttype, codename='change_user')
    perm_add_user = Permission.objects.get(content_type=user_contenttype, codename='add_user')
    perm_delete_user = Permission.objects.get(content_type=user_contenttype, codename='delete_user')

    # Create an Administrator group, whoever is in this group as the right
    # to administer all users in the system from the frontend admin.
    from django.contrib.auth.models import Group

    try:
        Group.objects.get(name='Administrators')
        log.debug('Admistrator group already exists, skip creation')
    except Group.DoesNotExist:
        log.debug('Creating Admistrator group')
        admin_group = Group(name='Administrators')
        admin_group.save()
        admin_group.permissions.add(
            perm_view_user, perm_change_user, perm_add_user, perm_delete_user
        )


class CoreAppConfig(AppConfig):
    name = "webapp.core"
    verbose_name = "Core"
    action_manager = None

    def ready(self):
        # more info about this hook https://docs.djangoproject.com/en/3.0/ref/signals/#post-migrate
        # usually used to create stuff that needs the db already but is related
        # to data
        post_migrate.connect(add_groups, sender=self)
