import os

from django.core.validators import MinLengthValidator
from django.db import models

from django.conf import settings


def get_upload_path(instance, filename):
    pass


class TemporaryUpload(models.Model):
    # The unique ID returned to the client and the name of the temporary
    # directory created to hold file data
    upload_id = models.CharField(
        primary_key=True, max_length=22, validators=[MinLengthValidator(22)]
    )
    # The unique ID used to store the file itself
    file_id = models.CharField(max_length=22, validators=[MinLengthValidator(22)])
    file = models.FileField()

    upload_name = models.CharField(max_length=512)
    uploaded = models.DateTimeField(auto_now_add=True)

    uploaded_by = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.CASCADE)

    def get_file_path(self):
        return self.file.path
