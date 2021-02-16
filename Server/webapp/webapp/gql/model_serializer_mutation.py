import logging
from copy import deepcopy

import graphene
from django.shortcuts import get_object_or_404
from graphene import ClientIDMutation, Field, InputField
from graphene.types.utils import yank_fields_from_attrs
from graphene_django.rest_framework.mutation import fields_for_serializer, SerializerMutationOptions

from webapp.gql import from_global_id
from webapp.gql.errors import GqlError

log = logging.getLogger(__name__)


class InterfaceErrorType(graphene.ObjectType):
    id = graphene.String(required=True)
    message = graphene.String()
    data = graphene.String()

    @classmethod
    def from_exception(cls, exception):
        error = GqlError(from_error=exception)
        return cls(id=error.id, message=error.message, data=error.data)


class GqlModelSerializerMutationOptions(SerializerMutationOptions):
    output_field_name = None
    output_field_type = None


class GqlModelSerializerMutation(ClientIDMutation):
    class Meta:
        abstract = True

    error = graphene.Field(InterfaceErrorType)

    @classmethod
    def __init_subclass_with_meta__(
        cls,
        lookup_field=None,
        serializer_class=None,
        model_class=None,
        model_operations=["create", "update"],
        only_fields=(),
        exclude_fields=(),
        output_field_name=None,
        output_field_type=None,
        **options,
    ):

        if not serializer_class:
            raise Exception("serializer_class is required for the SerializerMutation")

        if (
            "update" not in model_operations
            and "create" not in model_operations
            and "delete" not in model_operations
        ):
            raise Exception('model_operations must contain "create" and/or "update" or "delete"')

        if "delete" in model_operations and len(model_operations) > 1:
            raise Exception(
                'model_operations must not contain "create" and/or "update" if "delete" is set'
            )

        serializer = serializer_class()
        if model_class is None:
            serializer_meta = getattr(serializer_class, "Meta", None)
            if serializer_meta:
                model_class = getattr(serializer_meta, "model", None)

        if lookup_field is None and model_class:
            lookup_field = model_class._meta.pk.name

        input_fields = fields_for_serializer(serializer, only_fields, exclude_fields, is_input=True)

        if 'update' in model_operations or 'delete' in model_operations:
            input_fields[lookup_field] = graphene.types.scalars.ID()

        if not output_field_name:
            output_field_name = model_class.__name__.lower()

        output_fields = {output_field_name: graphene.Field(output_field_type)}

        _meta = GqlModelSerializerMutationOptions(cls)
        _meta.lookup_field = lookup_field
        _meta.model_operations = model_operations
        _meta.serializer_class = serializer_class
        _meta.model_class = model_class
        _meta.output_field_name = output_field_name
        _meta.output_field_type = output_field_type
        _meta.fields = yank_fields_from_attrs(output_fields, _as=Field)

        input_fields = yank_fields_from_attrs(input_fields, _as=InputField)
        super().__init_subclass_with_meta__(_meta=_meta, input_fields=input_fields, **options)

    @classmethod
    def _get_lookup_id(cls, global_id):
        _, lookup_id = from_global_id(global_id)
        return lookup_id

    @classmethod
    def get_serializer_kwargs(cls, root, info, **input):
        lookup_field = cls._meta.lookup_field
        model_class = cls._meta.model_class

        if model_class:
            if "update" in cls._meta.model_operations and lookup_field in input:
                instance = get_object_or_404(
                    model_class, **{lookup_field: cls._get_lookup_id(input[lookup_field])}
                )
            elif "create" in cls._meta.model_operations:
                instance = None
            elif "delete" in cls._meta.model_operations and lookup_field in input:
                instance = get_object_or_404(
                    model_class, **{lookup_field: cls._get_lookup_id(input[lookup_field])}
                )
            else:
                raise Exception(
                    'Invalid update operation. Input parameter "{}" required.'.format(lookup_field)
                )

            return {"instance": instance, "data": input, "context": {"request": info.context}}

        return {"data": input, "context": {"request": info.context}}

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        kwargs = cls.get_serializer_kwargs(root, info, **input)
        serializer = cls._meta.serializer_class(**kwargs)

        try:
            serializer.is_valid(raise_exception=True)
            return cls.perform_mutate(serializer, info)
        except Exception as e:
            if type(e) == GqlError:
                gql_error = e
            else:
                log.exception('', exc_info=e)
                gql_error = GqlError(from_error=e)
            error = InterfaceErrorType(
                id=gql_error.id, message=gql_error.message, data=gql_error.data
            )
            return cls(error=error)

    @classmethod
    def perform_mutate(cls, serializer, info):
        if 'delete' in cls._meta.model_operations:
            obj = serializer.instance
            obj_bak = deepcopy(obj)
            obj.delete()
            obj = obj_bak
        else:
            obj = serializer.save()
        kwargs = {cls._meta.output_field_name: obj}
        return cls(error=None, **kwargs)
