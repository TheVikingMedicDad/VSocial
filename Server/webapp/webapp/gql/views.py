# Create GraphQL view

from django.conf import settings
from django.http import HttpResponse

from graphene_django.views import GraphQLView
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView

# 
from webapp.gql.playground import PLAYGROUND_HTML


class GqlView(APIView):
    authentication_classes = (TokenAuthentication,)

    # On GET request serve GraphQL Playground
    def get(self, request, *args, **kwargs):
        if not settings.DEBUG:
            raise PermissionDenied()
        return HttpResponse(PLAYGROUND_HTML)

    def post(self, request, *args, **kwargs):
        middlewares = [
            # 
        ]

        graphene_view = GraphQLView.as_view(middleware=middlewares)
        return graphene_view(request, args, kwargs)
