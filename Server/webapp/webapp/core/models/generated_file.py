import uuid

from django.conf import settings
from django.db import models

from webapp.core.models.base_model import BaseModel


def upload_path(instance, filename):
    return f'{settings.MEDIA_GENERATED_FILES_FOLDER}/{uuid.uuid4()}/{filename}'


class GeneratedFile(BaseModel):
    file = models.FileField(upload_to=upload_path)
    valid_until = models.DateTimeField(null=False)
