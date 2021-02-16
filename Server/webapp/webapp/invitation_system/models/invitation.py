import datetime
import json
import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import ForeignKey
from django.conf import settings
from django.utils import timezone
from model_utils import Choices

from webapp.core.models.base_model import BaseModel

User = get_user_model()

if hasattr(settings, 'INVITATION_SYSTEM_DEFAULT_EXPIRE_IN_DAYS'):
    EXPIRE_IN_DAYS = settings.INVITATION_SYSTEM_DEFAULT_EXPIRE_IN_DAYS
else:
    EXPIRE_IN_DAYS = 7 * 2


def days_from_now(days):
    return timezone.now() + datetime.timedelta(days=days)


def get_default_expiration_date():
    return days_from_now(EXPIRE_IN_DAYS)


class Invitation(BaseModel):
    class Meta:
        pass

    invitation_type = models.CharField(max_length=20, null=False)
    inviter_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='invitations', null=False
    )
    invitee_user = ForeignKey(User, on_delete=models.SET_NULL, null=True)
    invitee_email = models.EmailField(null=False)
    payload = models.TextField(null=True)

    accept_token = models.UUIDField(default=uuid.uuid4, editable=False)
    expires = models.DateTimeField(default=get_default_expiration_date)

    STATE = Choices('PENDING', 'ACCEPTED', 'CANCELED', 'REJECTED', 'EXPIRED')
    state = models.CharField(choices=STATE, default=STATE.PENDING, max_length=10)

    message = models.TextField(blank=True, null=False)

    @property
    def encoded_payload(self):
        if hasattr(self, '_encoded_payload'):
            return self._encoded_payload
        if self.payload is None:
            self._encoded_payload = {}
        else:
            self._encoded_payload = json.loads(self.payload)
        return self._encoded_payload

    def save(self, *args, **kwargs):
        self.payload = json.dumps(self.encoded_payload, separators=(',', ':'))
        super().save(*args, **kwargs)
