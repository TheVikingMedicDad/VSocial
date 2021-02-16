from django.urls import path

# from webapp.gql.views import GraphQLView
from graphene_django.views import GraphQLView

import webapp
from webapp.gql.views import GqlView

app_name = 'gql'
urlpatterns = [path("graphql/", view=GqlView.as_view(), name="graphiql")]
