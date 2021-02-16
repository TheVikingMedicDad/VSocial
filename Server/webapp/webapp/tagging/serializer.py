from rest_framework import serializers

from webapp.core.errors import InvalidArgumentsError
from webapp.gql.serializer import GraphQLIdField
from webapp.tagging.models.tag import Tag


class NestedTagSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        self.field_name = kwargs.pop('field_name', None)
        super().__init__(*args, **kwargs)

    class Meta:
        model = Tag
        fields = ('id', 'name', 'to_delete')

    id = GraphQLIdField(model_type='TagType', required=False)
    name = serializers.CharField(required=False)
    to_delete = serializers.CharField(required=False)

    def validate(self, attrs):
        validated = super().validate(attrs)
        if attrs.get('id', None) and 'name' in attrs:
            raise InvalidArgumentsError(message='Either a name or id can be given. Not both.')
        if 'to_delete' in attrs and not attrs.get('id', None):
            raise InvalidArgumentsError(message='Need id to delete tag out of list')
        return validated

    @classmethod
    def apply_tags_to_tag_manager(cls, tag_manager, tagger_organisation, validated_data) -> None:
        for tag_item in validated_data:
            tag_id = tag_item.get('id', None)
            name = tag_item.get('name', None)
            if tag_id:
                tag = Tag.objects.get(id=tag_id)
                if tag_item.get('to_delete', False):
                    tag_manager.remove(tag)
                    continue
            elif name:
                # we have to check if tag exists
                try:
                    tag = Tag.objects.get(name=name, field_name=tag_manager.get_field_name())
                except Tag.DoesNotExist:
                    tag = None
                if not tag:
                    tag = Tag.objects.create(name=name, field_name=tag_manager.get_field_name())
                # add this tag to current field
            else:
                'not possible'
            tag_manager.add_tags(tag, tagger_organisation=tagger_organisation)
