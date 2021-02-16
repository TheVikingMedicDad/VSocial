import functools
import logging
from typing import Callable

from django.contrib.auth import get_user_model
from graphql import ResolveInfo

from webapp.core.utils.common import camel_pattern, under_pattern
from webapp.gql.errors import PermissionDeniedError
from webapp.gql.model_serializer_mutation import InterfaceErrorType

log = logging.getLogger(__name__)
User = get_user_model()


def convert_dict_keys(d, convert):

    if isinstance(d, dict):
        new_d = {}
        for k, v in d.items():
            if isinstance(v, dict) or isinstance(v, list):
                new_d[convert(k)] = convert_dict_keys(v, convert)
            else:
                new_d[convert(k)] = v
        return new_d
    if isinstance(d, list):
        new_l = []
        for v in d:
            if isinstance(v, dict) or isinstance(v, list):
                new_l.append(convert_dict_keys(v, convert))
            else:
                new_l.append(v)
        return new_l


def camel_to_underscore(name):
    return camel_pattern.sub(lambda x: '_' + x.group(1).lower(), name)


def underscore_to_camel(name):
    return under_pattern.sub(lambda x: x.group(1).upper(), name)


def convert_dict_camel_to_underscore(camel_dict):
    return convert_dict_keys(camel_dict, camel_to_underscore)


def convert_dict_underscore_to_camel(underscore_dict):
    return convert_dict_keys(underscore_dict, underscore_to_camel)


def auth_required(mutate_and_get_payload_func):
    """
    A decorator function that wraps mutate_and_get_payload and checks if the user is authenticated.
    Note: The class of the decorated function has to have an output parameter `error` of type InterfaceErrorType
    """

    def _inner(*args, **kwargs):
        assert len(args) == 3 and isinstance(args[2], ResolveInfo)
        user = args[2].context.user
        if user.is_anonymous:
            # TODO: check if the subclass has an error attribute
            return args[0](
                error=InterfaceErrorType(
                    'NOT_AUTHENTICATED_ERROR', message='User is not authenticated'
                )
            )
        kwargs['user'] = user
        result = mutate_and_get_payload_func(*args, **kwargs)
        return result

    return _inner


def query_superuser_required(func: Callable):
    """
    A decorator function for Query resolver methods to only return Queryset if user is superuser
    otherwise return empty queryset.
    """

    def wrapper(*args, **kwargs):
        assert isinstance(args[1], ResolveInfo)
        info = args[1]
        if not info.context.user.is_superuser:
            raise PermissionDeniedError('Permission Denied')
        return func(*args, **kwargs)

    return wrapper


def get_filtered_queryset(filter_dict, queryset, filter_fields):
    key_and = '__and'
    key_or = '__or'
    if key_and in filter_dict:
        # AND
        queryset_list = []
        for filter_item in filter_dict[key_and]:
            filtered_queryset = get_filtered_queryset(filter_item, queryset, filter_fields)
            queryset_list.append(filtered_queryset)
        if not queryset_list:
            pass
        else:
            queryset = queryset_list[0].intersection(*queryset_list[1:])
    elif key_or in filter_dict:
        # OR
        queryset_list = []
        for filter_item in filter_dict[key_or]:
            filtered_queryset = get_filtered_queryset(filter_item, queryset, filter_fields)
            queryset_list.append(filtered_queryset)
        if not queryset_list:
            pass
        else:
            queryset = queryset_list[0].union(*queryset_list[1:])
    else:
        # Leaf Node (all filters are "anded" here)
        standard_filter_dict = {}
        custom_filter_querysets = []
        for filter_key, filter_val in filter_dict.items():
            if filter_key in filter_fields and callable(filter_fields[filter_key]):
                # get all custom filter querysets
                filter_func = filter_fields[filter_key]
                custom_filter_querysets.append(filter_func(queryset, filter_val))
            else:
                # get all standard filters
                standard_filter_dict[filter_key] = filter_val

        if len(custom_filter_querysets):
            # only use intersection when we have at least one custom filter queryset
            # otherwise we have malformed SQL query (Error: multiple ORDER BY clauses not allowed)
            queryset = queryset.filter(**standard_filter_dict).intersection(
                *custom_filter_querysets
            )
        else:
            queryset = queryset.filter(**standard_filter_dict)

    return queryset


def custom_filter_function(argument_type):
    """
    Decorator to register a custom filter function which resolves a function
    that receives a queryset and the filter_value

    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(queryset, filter_value):
            return func(queryset, filter_value)

        wrapper.argument_type = argument_type
        return wrapper

    return decorator
