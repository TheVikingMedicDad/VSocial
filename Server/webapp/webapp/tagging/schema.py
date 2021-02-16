from graphene_django.converter import convert_django_field

from webapp import gql
from webapp.gql.fields import OrderedDjangoFilterConnectionField
from webapp.gql.types import CsdDjangoObjectType
from webapp.tagging.manager.tagger_taggable_manager import TaggerTaggableManager
from webapp.tagging.models.tag import Tag
from webapp.tagging.models.tagged_item import TaggedItem


class TagType(CsdDjangoObjectType):
    class Meta:
        model = Tag
        fields = '__all__'
        interfaces = (gql.Node,)
        csd_filter_fields = {'name': ['exact', 'icontains', 'istartswith']}


class TaggedItemType(CsdDjangoObjectType):
    class Meta:
        model = TaggedItem
        fields = '__all__'
        interfaces = (gql.Node,)
        csd_filter_fields = {}


# we have to register TaggableManager before using it in any graphene_django Type definition
# see: https://stackoverflow.com/questions/47166385/dont-know-how-to-convert-the-django-field-skills-class-taggit-managers-tagga
@convert_django_field.register(TaggerTaggableManager)
def convert_tagable_manager_to_filter_connection(field, registry=None):
    return OrderedDjangoFilterConnectionField(
        TagType, description=field.help_text, required=not field.null
    )


class Query(object):
    pass
