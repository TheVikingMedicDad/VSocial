import shortuuid
from django.contrib.auth.models import AnonymousUser
from rest_framework import status, renderers
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from webapp.file_upload.models import TemporaryUpload


def _get_user(request):
    upload_user = getattr(request, 'user', None)
    if isinstance(upload_user, AnonymousUser):
        upload_user = None
    return upload_user


class PlainTextRenderer(renderers.BaseRenderer):
    """
        see https://www.django-rest-framework.org/api-guide/renderers/#custom-renderers
    """

    media_type = 'text/plain'
    format = 'txt'

    def render(self, data, media_type=None, renderer_context=None):
        return data.encode(self.charset)


class UploadView(APIView):
    parser_classes = (MultiPartParser,)
    renderer_classes = (PlainTextRenderer,)

    def post(self, request):
        # to be compatible with the filepond ui
        if 'filepond' in request.FILES:
            file = request.FILES.pop('filepond')[0]
        elif 'file' in request.FILES:
            file = request.FILES.pop('file')[0]
        else:
            raise ValueError('No file given')

        file_id = shortuuid.uuid()
        upload_id = shortuuid.uuid()
        tu = TemporaryUpload(
            upload_id=upload_id,
            file_id=file_id,
            file=file,
            upload_name=file.name,
            uploaded_by=_get_user(request),
        )
        tu.save()
        return Response(upload_id, status=status.HTTP_200_OK, content_type='text/plain')
