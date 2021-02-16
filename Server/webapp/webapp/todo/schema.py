import graphene

from webapp import gql
from webapp.gql.model_serializer_mutation import GqlModelSerializerMutation
from webapp.gql.types import CsdDjangoObjectType
from webapp.gql.utils import custom_filter_function, auth_required
from webapp.todo.models import Todo
from webapp.todo.serializer import CreateTodoSerializer, DeleteTodoSerializer, UpdateTodoSerializer


@custom_filter_function(argument_type=graphene.ID())
def filter_todo_by_user_id(queryset, filter_value):
    return queryset.filter(created_by__id=filter_value)


@custom_filter_function(argument_type=graphene.ID())
def filter_todo_by_is_done(queryset, filter_value):
    return queryset.filter(is_done=filter_value)


class TodoType(CsdDjangoObjectType):
    class Meta:
        model = Todo
        fields = '__all__'
        interfaces = (gql.Node,)
        csd_filter_fields = {
            'text': [
                'exact',
                'iexact',
                'icontains',
                'contains',
                'istartswith',
                'startswith',
                'iendswith',
                'endswith',
            ],
            'is_done': filter_todo_by_is_done,
            'created_by__id': filter_todo_by_user_id,
        }


class CreateTodoMutation(GqlModelSerializerMutation):
    class Meta:
        serializer_class = CreateTodoSerializer
        model_operations = ['create']
        lookup_field = 'id'
        exclude = ('id',)
        output_field_type = TodoType

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, **input):
        return super().mutate_and_get_payload(root, info, **input)


class DeleteTodoMutation(GqlModelSerializerMutation):
    class Meta:
        serializer_class = DeleteTodoSerializer
        model_operations = ['delete']
        output_field_type = TodoType

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, **input):
        return super().mutate_and_get_payload(root, info, **input)


class UpdateTodoMutation(GqlModelSerializerMutation):
    class Meta:
        serializer_class = UpdateTodoSerializer
        model_operations = ['update']
        output_field_type = TodoType

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, **input):
        return super().mutate_and_get_payload(root, info, **input)


class Query(object):
    todo = gql.Node.Field(TodoType)


class Mutations(object):
    createTodo = CreateTodoMutation.Field()
    deleteTodo = DeleteTodoMutation.Field()
    updateTodo = UpdateTodoMutation.Field()
