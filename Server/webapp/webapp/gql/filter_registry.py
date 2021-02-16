import graphene
from django.db.models import (
    Field,
    CharField,
    IntegerField,
    DateTimeField,
    TimeField,
    EmailField,
    AutoField,
)
from graphene import Argument


class FilterAlreadyExistingError(Exception):
    pass


class NoRegisteredFilterFieldError(Exception):
    pass


class FilterRegistry:
    _registry = {}

    @classmethod
    def register_filter(cls, *field_types, lookup: str, replace=False):
        def decorator(f):
            for field_type in field_types:
                if field_type not in cls._registry:
                    cls._registry[field_type] = {}
                if not replace and lookup in cls._registry[field_type]:
                    raise FilterAlreadyExistingError(
                        f'There is already a field defined for field "{field_type}" '
                        f'and lookup_type "{lookup}"'
                    )
                cls._registry[field_type][lookup] = f
            return f

        return decorator

    @classmethod
    def resolve_filter_argument_by_model_field(
        cls, field_type: Field, filter_lookup_type: str
    ) -> Argument:
        klasses = [field_type] + list(field_type.__bases__)
        graphene_field_factory = None
        for klass in klasses:
            try:
                graphene_field_factory = cls._registry[klass][filter_lookup_type]
                break
            except KeyError:
                continue

        if not graphene_field_factory:
            raise NoRegisteredFilterFieldError(
                f'No filter field registered for model field "{field_type}" '
                f'and lookup_type "{filter_lookup_type}"'
            )
        else:
            return graphene_field_factory().Argument()

    @classmethod
    def resolve_argument_name(cls, field_name, lookup):
        if lookup == 'exact':
            return field_name
        else:
            return f'{field_name}__{lookup}'


# TODO: This is not a complete list yet, complete as soon as we hit exceptions in some tests
@FilterRegistry.register_filter(CharField, EmailField, AutoField, lookup='exact')
@FilterRegistry.register_filter(CharField, EmailField, lookup='iexact')
@FilterRegistry.register_filter(CharField, EmailField, lookup='contains')
@FilterRegistry.register_filter(CharField, EmailField, lookup='icontains')
@FilterRegistry.register_filter(CharField, EmailField, lookup='startswith')
@FilterRegistry.register_filter(CharField, EmailField, lookup='istartswith')
@FilterRegistry.register_filter(CharField, EmailField, lookup='endswith')
@FilterRegistry.register_filter(CharField, EmailField, lookup='iendswith')
def argument_string():
    return graphene.String()


@FilterRegistry.register_filter(CharField, lookup='in')
def argument_string_list():
    return graphene.List(of_type=graphene.String)


@FilterRegistry.register_filter(IntegerField, lookup='exact')
@FilterRegistry.register_filter(IntegerField, lookup='contains')
@FilterRegistry.register_filter(IntegerField, lookup='icontains')
@FilterRegistry.register_filter(IntegerField, lookup='gt')
@FilterRegistry.register_filter(IntegerField, lookup='gte')
@FilterRegistry.register_filter(IntegerField, lookup='lt')
@FilterRegistry.register_filter(IntegerField, lookup='lte')
@FilterRegistry.register_filter(DateTimeField, lookup='year')
@FilterRegistry.register_filter(DateTimeField, lookup='iso_year')
@FilterRegistry.register_filter(DateTimeField, lookup='month')
@FilterRegistry.register_filter(DateTimeField, lookup='day')
@FilterRegistry.register_filter(DateTimeField, lookup='week')
@FilterRegistry.register_filter(DateTimeField, lookup='week_day')
@FilterRegistry.register_filter(DateTimeField, lookup='quarter')
@FilterRegistry.register_filter(DateTimeField, TimeField, lookup='hour')
@FilterRegistry.register_filter(DateTimeField, TimeField, lookup='minute')
@FilterRegistry.register_filter(DateTimeField, TimeField, lookup='second')
def argument_int():
    return graphene.Int()


@FilterRegistry.register_filter(IntegerField, lookup='in')
def argument_int_list():
    return graphene.List(of_type=graphene.Int)


@FilterRegistry.register_filter(DateTimeField, lookup='gt')
@FilterRegistry.register_filter(DateTimeField, lookup='gte')
@FilterRegistry.register_filter(DateTimeField, lookup='lt')
@FilterRegistry.register_filter(DateTimeField, lookup='lte')
def argument_datetime():
    return graphene.DateTime()


@FilterRegistry.register_filter(DateTimeField, lookup='time')
def argument_time():
    return graphene.Time


class DateRangeInput(graphene.InputObjectType):
    start = graphene.DateTime().Argument()
    end = graphene.DateTime().Argument()


@FilterRegistry.register_filter(DateTimeField, lookup='range')
def argument_datetime_range():
    return DateRangeInput()
