from rest_framework import serializers
from rest_framework.fields import empty

from webapp.file_upload.models import TemporaryUpload
from webapp.gql.errors import TemporaryUploadIdNotFoundError


class TemporaryUploadIdField(serializers.CharField):
    def run_validation(self, data=empty):
        if (data in (empty, None)) and not self.required:
            return None
        try:
            temporary_upload = TemporaryUpload.objects.get(upload_id=data)
        except TemporaryUpload.DoesNotExist:
            raise TemporaryUploadIdNotFoundError
        return temporary_upload
