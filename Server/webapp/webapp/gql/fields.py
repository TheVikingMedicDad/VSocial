import logging
from abc import abstractmethod
from collections import OrderedDict
from functools import partial
from typing import Dict

from django.conf import settings

import graphene
from graphene import List, String, Connection, Int, ConnectionField, Dynamic
from graphene.types.argument import to_arguments
from graphene.types.objecttype import ObjectTypeOptions
from graphene.types.utils import get_type
from graphene.utils.orderedtype import OrderedType
from graphene_django import DjangoConnectionField
from parler.models import TranslationDoesNotExist

from promise import Promise

from webapp.core.utils.common import build_absolute_uri
from webapp.gql.filter_registry import FilterRegistry
from .utils import camel_to_underscore, get_filtered_queryset, convert_dict_camel_to_underscore

log = logging.getLogger(__name__)

_all_node_connection_types = {}

_filter_type_registry = {}


class TranslatedField(graphene.Field):
    def __init__(self, field_name):
        self.field_name = field_name
        super().__init__(graphene.String, resolver=self.resolve_translated_field)

    def resolve_translated_field(self, root, info):
        try:
            return getattr(root, self.field_name)
        except TranslationDoesNotExist:
            return ''


class TranslationFields(graphene.Field):
    def __init__(self, model_cls, translated_fields=None):
        type_name = f'{model_cls.__name__}TranslationFieldsType'
        if not translated_fields:
            translated_fields = tuple(model_cls._parler_meta.get_translated_fields())
        super().__init__(
            TranslationFields.translation_fields_type_factory(model_cls, translated_fields),
            resolver=lambda root, info: root,
        )

    @staticmethod
    def translation_fields_type_factory(model_cls, field_names: tuple):
        lang_fields = {}
        for lang_key, lang_name in settings.LANGUAGES:
            fields = {}
            for field_name in field_names:

                class _resolver_cls:
                    def __init__(self, field_name, lang_key):
                        self.field_name = field_name
                        self.lang_key = lang_key

                    def __call__(self, root, info):
                        translated = root.safe_translation_getter(
                            self.field_name, language_code=self.lang_key
                        )
                        return '' if translated is None else translated

                fields[field_name] = graphene.String(resolver=_resolver_cls(field_name, lang_key))
            type_cls = type(
                f'{model_cls.__name__}{lang_key.upper()}TranslationFieldsType',
                (graphene.ObjectType,),
                fields,
            )
            lang_fields[lang_key] = graphene.Field(type_cls, resolver=lambda root, info: root)
        return type(
            f'{model_cls.__name__}TranslationFieldsType', (graphene.ObjectType,), lang_fields
        )


def filter_argument_factory(type_name: str, filtering_args: Dict):
    if type_name in _filter_type_registry:
        return _filter_type_registry[type_name]

    fields = {}
    fields.update(filtering_args)
    fields['__or'] = Dynamic(lambda: List(of_type=FilterType).Argument())
    fields['__and'] = Dynamic(lambda: List(of_type=FilterType).Argument())

    FilterType = type(type_name, (graphene.InputObjectType,), fields)
    filter_type_argument = FilterType().Argument()
    _filter_type_registry[type_name] = filter_type_argument
    return filter_type_argument


class OrderedDjangoFilterConnectionField(DjangoConnectionField):
    """
    It has an interface for ordering use in graphql variables like

    "orderBy":["-created", "updated"]

    the filter should support all django filter queries and can be combined with "and" and "or"
    clauses. This is a simple filter:

    .. code-block:: json

        "filter": {"userId": 1}

    this is a very simple "and"-filter

    .. code-block:: json

        "filter": {
            "userId": 1,
            "event_Contains":"PING"
            }

    the following filter is equal

    .. code-block:: json

        "filter": {
            "_And": [
                    { "userId": 1 },
                    { "event_Contains":"PING" }
                ]
            }

    a more complex and nested filter might look like this:

    .. code-block:: json

        "filter":{
            "_Or": [
                {
                  "_And": [
                    { "event": "PING_EVENT" },
                    { "userId_In": [2,3] }
                  ]
                },
                {
                  "_And": [
                    { "event": "LOGIN_EVENT" },
                    { "userId": 3 }
                  ]
                }
            ]
        }

    """

    def __init__(self, _type, fields=None, *args, **kwargs):
        # add orderBy functionality
        kwargs['orderBy'] = List(of_type=String)
        super().__init__(_type, fields, *args, **kwargs)

    @property
    def args(self):
        args = to_arguments(self._base_args or OrderedDict())
        type_name = f'{self.type}Filter'
        args['filter'] = filter_argument_factory(type_name, self.filtering_args)
        return args

    @args.setter
    def args(self, args):
        self._base_args = args

    @classmethod
    def validate_first_last_limit(cls, args, enforce_first_or_last, max_limit, info):
        # this is basically copied from the Graphene Django DjangoConnectionField
        first = args.get("first")
        last = args.get("last")

        if enforce_first_or_last:
            assert first or last, (
                "You must provide a `first` or `last` value to properly paginate the `{}` connection."
            ).format(info.field_name)

        if max_limit:
            if first:
                assert first <= max_limit, (
                    "Requesting {} records on the `{}` connection exceeds the `first` limit of {} records."
                ).format(first, info.field_name, max_limit)
                args["first"] = min(first, max_limit)

            if last:
                assert last <= max_limit, (
                    "Requesting {} records on the `{}` connection exceeds the `last` limit of {} records."
                ).format(last, info.field_name, max_limit)
                args["last"] = min(last, max_limit)

    @property
    def filtering_args(self):
        _filtering_args = {}
        filter_fields = self.node_type._meta.csd_filter_fields
        if not filter_fields:
            return _filtering_args

        model = self.node_type._meta.model
        for field_name, field_filter_lookup_types in filter_fields.items():
            # check custom filters
            if callable(field_filter_lookup_types):
                custom_filter_func = field_filter_lookup_types
                _filtering_args[field_name] = custom_filter_func.argument_type.Argument()
                continue

            field = model._meta.get_field(field_name)
            # check the filter type registry
            for filter_lookup_type in field_filter_lookup_types:
                argument_name = FilterRegistry.resolve_argument_name(field_name, filter_lookup_type)
                argument_field = FilterRegistry.resolve_filter_argument_by_model_field(
                    type(field), filter_lookup_type
                )
                _filtering_args[argument_name] = argument_field
        return _filtering_args

    @classmethod
    def merge_querysets(cls, default_queryset, queryset):
        # Inspired by the DjangoFilterConnectionField
        # See related PR: https://github.com/graphql-python/graphene-django/pull/126
        if queryset == default_queryset:
            return queryset

        assert not (
            default_queryset.query.low_mark and queryset.query.low_mark
        ), "Received two sliced querysets (low mark) in the connection, please slice only in one."
        assert not (
            default_queryset.query.high_mark and queryset.query.high_mark
        ), "Received two sliced querysets (high mark) in the connection, please slice only in one."
        low = default_queryset.query.low_mark or queryset.query.low_mark
        high = default_queryset.query.high_mark or queryset.query.high_mark
        default_queryset.query.clear_limits()

        if default_queryset.query.distinct and not queryset.query.distinct:
            queryset = queryset.distinct()
        elif queryset.query.distinct and not default_queryset.query.distinct:
            default_queryset = default_queryset.distinct()

        # queryset has the connection, default_queryset the order_by info
        # we have to pass order_by to the intersected query
        default_queryset_order_by = default_queryset.query.order_by
        if (
            len(default_queryset_order_by) <= 0
            and len(default_queryset.query.get_meta().ordering) >= 1
        ):
            # user passed no ordering, but we have to passthrough default ordering
            default_queryset_order_by = default_queryset.query.get_meta().ordering

        queryset = queryset.intersection(default_queryset)

        queryset.query.set_limits(low, high)
        if len(default_queryset_order_by) >= 1:
            return queryset.order_by(*default_queryset_order_by)
        return queryset

    @classmethod
    def connection_resolver(
        cls,
        resolver,
        connection,
        default_manager,
        queryset_resolver,
        max_limit,
        enforce_first_or_last,
        csd_filter_fields,
        root,
        info,
        **args,
    ):
        cls.validate_first_last_limit(args, enforce_first_or_last, max_limit, info)

        # eventually leads to DjangoObjectType's get_queryset (accepts queryset)
        # or a resolve_foo (does not accept queryset)
        iterable = resolver(root, info, **args)
        if iterable is None:
            iterable = default_manager
        # thus the iterable gets refiltered by resolve_queryset
        # but iterable might be promise
        iterable = queryset_resolver(connection, iterable, info, args)

        filter_dict = args.get('filter', {})
        if filter_dict:
            normalized_filter_dict = convert_dict_camel_to_underscore(filter_dict)
            iterable = get_filtered_queryset(normalized_filter_dict, iterable, csd_filter_fields)

        # apply ordering
        order_list = args.get('orderBy', [])
        if order_list:
            order_list = [camel_to_underscore(order) for order in order_list]
            iterable = iterable.order_by(*order_list)

        on_resolve = partial(cls.resolve_connection, connection, args)

        if Promise.is_thenable(iterable):
            return Promise.resolve(iterable).then(on_resolve)

        return on_resolve(iterable)

    @property
    def type(self):
        _type = get_type(self._type)
        type_name = str(_type)
        stored_type = _all_node_connection_types.get(type_name, None)
        if stored_type:
            return stored_type
        else:

            class NodeConnection(Connection):
                total_count = Int()

                class Meta:
                    node = _type
                    name = '{}FilterConnection'.format(_type._meta.name)

                def resolve_total_count(self, info, **kwargs):
                    return self.iterable.count()

        _all_node_connection_types[type_name] = NodeConnection
        return NodeConnection

    def get_resolver(self, parent_resolver):
        return partial(
            self.connection_resolver,
            parent_resolver,
            self.connection_type,
            self.get_manager(),
            self.get_queryset_resolver(),
            self.max_limit,
            self.enforce_first_or_last,
            self.node_type._meta.csd_filter_fields,
        )


class FileType(graphene.ObjectType):
    url = graphene.String()
    absoluteUrl = graphene.String()
    name = graphene.String()
    size = graphene.Int()

    def resolve_name(self, info):
        return self.name.split('/')[-1]

    def resolve_absoluteUrl(self, info):
        return build_absolute_uri(request=info.context, location=self.url)


class ImageFileType(FileType):
    height = graphene.Int()
    width = graphene.Int()


class DecoupledDjangoFilterConnectionField(ConnectionField):
    def __init__(self, type, fields=None, *args, **kwargs):
        # add orderBy functionality
        kwargs['orderBy'] = List(of_type=String)

        # add additional arguments
        arguments_class = getattr(self.__class__, "Arguments", None)
        if arguments_class:
            for key, field_value in arguments_class.__dict__.items():
                if isinstance(field_value, OrderedType):
                    kwargs[key] = field_value

        # TODO: need to implement possible filter interface which behaves similar to django
        self._filterset_class = None
        self.enforce_first_or_last = False

        super().__init__(type, fields, *args, **kwargs)

    @classmethod
    @abstractmethod
    def resolve_result(cls, connection: Connection, order_by, first, after, last, before):
        # TODO: use this abstract method to make the implementation of special result query
        #  cases like AllBiEventRecordsGroupedConnection even more easier than overriding the
        #  connection_resolver which is not very easy understandable
        pass

    @property
    def type(self):
        # add totalCount functionality
        class NodeConnection(Connection):
            total_count = Int()

            class Meta:
                node = self._type
                name = '{}DecoupledFilterConnection'.format(self._type._meta.name)

            def resolve_total_count(self, info, **kwargs):
                if hasattr(self, 'total_count'):
                    return self.total_count
                else:
                    return None

        return NodeConnection


class DecoupledObjectTypeOptions(ObjectTypeOptions):
    connection = None  # type: Type[Connection]


class DecoupledObjectType(graphene.ObjectType):
    @classmethod
    def __init_subclass_with_meta__(
        cls,
        interfaces=(),
        possible_types=(),
        default_resolver=None,
        _meta=None,
        connection=None,
        **options,
    ):
        if connection is not None:
            assert issubclass(connection, Connection), (
                "The connection must be a Connection. Received {}"
            ).format(connection.__name__)

        if not _meta:
            _meta = DecoupledObjectTypeOptions(cls)

        _meta.connection = connection

        super().__init_subclass_with_meta__(_meta=_meta, interfaces=interfaces, **options)
