import logging
import uuid
from datetime import timedelta

from django.contrib.auth.models import AbstractUser, UserManager as DjangoUserManager
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import CharField
from django.db.models.expressions import RawSQL
from django.urls import reverse
from django.utils.datetime_safe import datetime
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
from rest_framework import serializers

from webapp.core.models.organisation import Organisation
from webapp.tagging.manager.tagger_taggable_manager import TaggerTaggableManager
from webapp.users.constants import AuthCheckActions

log = logging.getLogger(__name__)


def upload_profile_image_path(obj, filename):
    return f'{settings.MEDIA_IMAGE_FOLDER}/{uuid.uuid4()}/{filename}'


class UserManager(DjangoUserManager):
    # Custom UserManager if needed
    # 
    pass
    # 


USER_TAGS_FIELD_NAME = 'users_user.tags'


class User(AbstractUser):

    first_name = CharField(_('First Name of User'), blank=True, max_length=255)
    last_name = CharField(_('Last Name of User'), blank=True, max_length=255)
    registration_completed = models.DateTimeField(blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    email = models.EmailField(_('email address'), blank=False)
    salutation = CharField(_('Salutation'), blank=True, max_length=100)
    interests = ArrayField(models.CharField(max_length=300), default=list)
    language = CharField(_('Language Key of User'), blank=False, max_length=5, default='en')
    country = CharField(_('Country'), blank=True, max_length=100)
    selected_organisation = models.ForeignKey(
        Organisation,
        on_delete=models.SET_NULL,
        related_name='users_selected_organisation',
        blank=True,
        null=True,
    )
    profile_image = models.ImageField(blank=True, upload_to=upload_profile_image_path)

    REQUIRED_FIELDS = ['email']
    tags = TaggerTaggableManager(field_name=USER_TAGS_FIELD_NAME)

    objects = UserManager()

    class Meta:
        ordering = ['id']

    def get_absolute_url(self):
        return reverse('users:detail', kwargs={'username': self.username})

    def save(self, *args, **kwargs):
        from webapp.core.models.organisation import Organisation

        self.username = self.email

        # if creating a new User
        if not self.pk:
            # create the users organisation
            organisation = Organisation()
            organisation.save()
            self.selected_organisation = organisation
            super().save(*args, **kwargs)
            organisation.owner = self
            organisation.save()
        else:
            super().save(*args, **kwargs)


class GqlUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'date_joined',
            'registration_completed',
            'email_verified',
            'salutation',
            'interests',
            'language',
            'country',
            'profile_image',
        )
        read_only_fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'date_joined',
            'registration_completed',
            'email_verified',
            'salutation',
            'interests',
            'country',
            'profile_image',
        )


class PasswordResetRequest(models.Model):
    # TODO: Delete old (eg. 3 days old) password reset requests
    user = models.ForeignKey(
        'User', on_delete=models.CASCADE, related_name='forgotten_password_requests'
    )
    created = models.DateTimeField(auto_now_add=True)
    key = models.CharField(default=uuid.uuid4, max_length=64)


class AuthCheck(models.Model):
    # TODO: Delete old (eg. 3 days old) auth checks
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='auth_checks')
    created = models.DateTimeField(auto_now_add=True)
    action_key = models.CharField(max_length=300)

    @classmethod
    def is_authorized(cls, user, action_key: AuthCheckActions):
        date_now = datetime.now()
        max_age = date_now - timedelta(minutes=3)
        log.debug(f'user: {user}, action_key: {action_key}')
        auth_checks = cls.objects.filter(
            user=user, action_key=action_key.value, created__gte=max_age
        )
        log.debug(f'Auth Checks: {list(auth_checks)}')
        return auth_checks.exists()
