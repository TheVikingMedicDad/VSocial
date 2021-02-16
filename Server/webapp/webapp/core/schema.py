import graphene
from graphene import ObjectType

from django.conf import settings

import webapp.tagging.schema
import webapp.users.schema
import webapp.invitation_system.schema

# 
import webapp.todo.schema

# 
# 
from webapp import gql
from webapp.core.models.organisation import Organisation
from webapp.gql.types import CsdDjangoObjectType

from webapp.gql.fields import OrderedDjangoFilterConnectionField


class OrganisationType(CsdDjangoObjectType):
    class Meta:
        model = Organisation
        fields = '__all__'
        interfaces = (gql.Node,)
        csd_filter_fields = {'name': ['exact', 'icontains', 'istartswith']}

    # 
    todos = OrderedDjangoFilterConnectionField('webapp.todo.schema.TodoType')
    # 
    users_selected_organisation = gql.fields.OrderedDjangoFilterConnectionField(
        webapp.users.schema.UserType
    )


class ServerInfoType(ObjectType):
    main_version = graphene.String()
    project_version = graphene.String()
    build_time = graphene.DateTime()


class Query(
    webapp.users.schema.Query,
    webapp.invitation_system.schema.Query,
    # 
    webapp.tagging.schema.Query,
    graphene.ObjectType,
    # 
    webapp.todo.schema.Query,
    # 
):
    # This class will inherit from multiple Queries
    # as we begin to add more apps to our project

    organisation = gql.Node.Field(OrganisationType)
    all_organisations = OrderedDjangoFilterConnectionField(OrganisationType)
    server_info = graphene.Field(ServerInfoType)

    def resolve_server_info(self, info):
        return ServerInfoType(
            main_version=settings.CSD_MAIN_VERSION,
            project_version=settings.CSD_PROJECT_VERSION,
            build_time=settings.BUILD_TIME,
        )


class Mutations(
    webapp.users.schema.Mutations,
    webapp.invitation_system.schema.Mutations,
    # 
    # 
    webapp.todo.schema.Mutations,
    # 
    graphene.ObjectType,
):
    pass


schema = graphene.Schema(query=Query, mutation=Mutations)
