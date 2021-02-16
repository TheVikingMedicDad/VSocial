from rest_framework import serializers
from webapp.todo.controller import create_todo
from webapp.todo.models import Todo


class CreateTodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ('text', 'is_done')

    def create(self, validated_data):
        organisation = self.context['request'].user.owned_organisation
        is_done = validated_data['is_done'] if 'is_done' in validated_data else False
        return create_todo(organisation, validated_data['text'], is_done)


class DeleteTodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ('id',)


class UpdateTodoSerializer(serializers.ModelSerializer):
    text = serializers.CharField(required=False)

    class Meta:
        model = Todo
        fields = ('id', 'text', 'is_done')


