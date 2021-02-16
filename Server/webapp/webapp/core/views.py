import logging

from rest_framework.response import Response
from rest_framework.views import APIView

log = logging.getLogger(__name__)

# some import statements to register models to django's data migration mechanism:
#   we need this because we're first using them when initilizing gql schema
#   (and that's gonna be on the first request)
from webapp.core.models import generated_file


class TestView(APIView):
    def get(self, request, format=None):
        return Response({'msg': 'My rest call response'})
