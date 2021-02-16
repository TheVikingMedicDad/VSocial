import logging
import warnings

from django.utils.functional import SimpleLazyObject
from graphene import Field, Node, Connection, ObjectType
from graphene.types.objecttype import ObjectTypeOptions
from graphene.types.utils import yank_fields_from_attrs
from graphene_django.registry import get_global_registry, Registry
from graphene_django.types import DjangoObjectType, ALL_FIELDS, construct_fields
from graphene_django.utils import is_valid_django_model, DJANGO_FILTER_INSTALLED

log = logging.getLogger(__name__)


class CsdDjangoObjectTypeOptions(ObjectTypeOptions):
    model = None  # type: Model
    registry = None  # type: Registry
    connection = None  # type: Type[Connection]

    csd_filter_fields = {}


class CsdDjangoObjectType(DjangoObjectType):
    class Meta:
        abstract = True

    @classmethod
    def __init_subclass_with_meta__(
        cls,
        model=None,
        registry=None,
        skip_registry=False,
        only_fields=(),  # deprecated in favour of `fields`
        fields=(),
        exclude_fields=(),  # deprecated in favour of `exclude`
        exclude=(),
        filter_fields=None,
        filterset_class=None,
        csd_filter_fields=None,
        connection=None,
        connection_class=None,
        use_connection=None,
        interfaces=(),
        convert_choices_to_enum=True,
        _meta=None,
        **options,
    ):
        # if not model:
        #     print(f'#### Model is null {cls}')
        #     return

        assert is_valid_django_model(model), (
            'You need to pass a valid Django Model in {}.Meta, received "{}".'
        ).format(cls.__name__, model)

        if not registry:
            registry = get_global_registry()

        assert isinstance(registry, Registry), (
            "The attribute registry in {} needs to be an instance of " 'Registry, received "{}".'
        ).format(cls.__name__, registry)

        if filter_fields and filterset_class:
            raise Exception("Can't set both filter_fields and filterset_class")

        if not DJANGO_FILTER_INSTALLED and (filter_fields or filterset_class):
            raise Exception(
                ("Can only set filter_fields or filterset_class if " "Django-Filter is installed")
            )

        assert not (fields and exclude), (
            "Cannot set both 'fields' and 'exclude' options on "
            "DjangoObjectType {class_name}.".format(class_name=cls.__name__)
        )

        # Alias only_fields -> fields
        if only_fields and fields:
            raise Exception("Can't set both only_fields and fields")
        if only_fields:
            warnings.warn(
                "Defining `only_fields` is deprecated in favour of `fields`.",
                PendingDeprecationWarning,
                stacklevel=2,
            )
            fields = only_fields
        if fields and fields != ALL_FIELDS and not isinstance(fields, (list, tuple)):
            raise TypeError(
                'The `fields` option must be a list or tuple or "__all__". '
                "Got %s." % type(fields).__name__
            )

        if fields == ALL_FIELDS:
            fields = None

        # Alias exclude_fields -> exclude
        if exclude_fields and exclude:
            raise Exception("Can't set both exclude_fields and exclude")
        if exclude_fields:
            warnings.warn(
                "Defining `exclude_fields` is deprecated in favour of `exclude`.",
                PendingDeprecationWarning,
                stacklevel=2,
            )
            exclude = exclude_fields
        if exclude and not isinstance(exclude, (list, tuple)):
            raise TypeError(
                "The `exclude` option must be a list or tuple. Got %s." % type(exclude).__name__
            )

        django_fields = yank_fields_from_attrs(
            construct_fields(model, registry, fields, exclude, convert_choices_to_enum), _as=Field
        )

        if use_connection is None and interfaces:
            use_connection = any((issubclass(interface, Node) for interface in interfaces))

        if use_connection and not connection:
            # We create the connection automatically
            if not connection_class:
                connection_class = Connection

            connection = connection_class.create_type("{}Connection".format(cls.__name__), node=cls)

        if connection is not None:
            assert issubclass(connection, Connection), (
                "The connection must be a Connection. Received {}"
            ).format(connection.__name__)

        if not _meta:
            _meta = CsdDjangoObjectTypeOptions(cls)

        _meta.model = model
        _meta.registry = registry
        _meta.filter_fields = filter_fields
        _meta.filterset_class = filterset_class
        _meta.fields = django_fields
        _meta.connection = connection
        _meta.csd_filter_fields = csd_filter_fields

        # this is intentionally the super class of DjangObjectType and not CsdDjangoObjectType
        # because we do almost the same as DjangoObjectType here, so doing it twice would result
        # in an error. And we need to inherit from DjangoObjectType because it is hard coded
        # in the registry of django_graphene
        super(DjangoObjectType, cls).__init_subclass_with_meta__(
            _meta=_meta, interfaces=interfaces, **options
        )

        if not skip_registry:
            registry.register(cls)

    def resolve_id(self, info):
        return self.pk

    @classmethod
    def is_type_of(cls, root, info):
        if isinstance(root, SimpleLazyObject):
            root._setup()
            root = root._wrapped
        if isinstance(root, cls):
            return True
        if not is_valid_django_model(type(root)):
            raise Exception(('Received incompatible instance "{}".').format(root))

        if cls._meta.model._meta.proxy:
            model = root._meta.model
        else:
            model = root._meta.model._meta.concrete_model

        return model == cls._meta.model

    @classmethod
    def get_queryset(cls, queryset, info):
        return queryset

    @classmethod
    def get_node(cls, info, id):
        queryset = cls.get_queryset(cls._meta.model.objects, info)
        try:
            return queryset.get(pk=id)
        except cls._meta.model.DoesNotExist:
            return None
