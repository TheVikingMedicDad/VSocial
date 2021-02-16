import base64
import copy
import io
import logging
from functools import lru_cache

import requests
import os

from django import db
from django.contrib.auth import get_user_model
from django.db import connection
from django.db.transaction import get_connection
from django.conf import settings


log = logging.getLogger(__name__)

User = get_user_model()

from webapp.core.utils.testing_views_utils_graphql import (
    REGISTER_USER_MUTATION,
    LOGIN_USER_MUTATION,
)

ENV_TESTING_PREFIX = 'CSD_TESTING'


def db_exists(db_name):
    with get_connection().cursor() as cursor:
        cursor.execute('SELECT count(*) FROM pg_database WHERE datname = %s', [db_name])
        return cursor.fetchone()[0] == 1


def _get_api_endpoint_url():
    host = os.environ['CSD_WEBAPP_SERVER_WEBAPP_HOST']
    port = os.environ['CSD_WEBAPP_SERVER_WEBAPP_HTTP_PORT']
    return f'http://{host}:{port}/api/graphql/'


def upload_image_file(file):
    """
    Uploads an image file object to the Server's Image upload interface and return the responding key
    """
    host = os.environ['CSD_WEBAPP_SERVER_WEBAPP_HOST']
    port = os.environ['CSD_WEBAPP_SERVER_WEBAPP_HTTP_PORT']
    url = f'http://{host}:{port}/api/file-upload/process/'
    files = {'filepond': file}
    response = requests.post(url, files=files, verify=False)
    assert response.status_code == 200
    assert len(response.text) == 22
    return response.text


def upload_base64_decoded_image_file(base64_string):
    return upload_image_file(io.BytesIO(base64.b64decode(base64_string)))


def execute_gql(query, headers=None, variables=None):
    """
    Executes a GraphQL Query against the testing server
    :param query: the GraphQL Query
    :param headers: optional HTTP Headers dictionary
    :return: GraphQL payload as dictionary
    """
    headers = headers if headers else {}
    variables = variables if variables else {}
    response = requests.post(
        _get_api_endpoint_url(),
        json={'query': query, 'variables': variables},
        headers=headers,
        verify=False,
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception("Query failed {}. {}".format(response.status_code, response.json()))


def execute_gql_with_input(query, **kwargs):
    """
    A little convenience function that calls execute_gql but creates an input dict before
    Takes all arguments in **kwargs to build this input dict
    Note that you now have to pass the header by _headers={..}
    """
    headers = kwargs.pop('_headers', None)
    input = {'input': kwargs}
    return execute_gql(query, headers=headers, variables=input)


def execute_gql_mutation(
    mutation, _check_errors=True, _mutation_name=None, _return_data=True, **kwargs
):
    """
    Executes a graph QL Mutation using all kwargs as `input`

    If `_check_errors` is True it will also assert that the error dict of the result is None
    Therefore, the mutation name has to be detected. If you dont like the automatic detection you can pass the `_mutation_name` as a string

    If `_return_data` is set to True (default=True) this function returns the data inside the mutation

    e.g. mutation myMutation()... will assert that data.myMutation is not Null but has no data.myMutation.error and will
        afterwards return data.myMutation
    """
    if not _check_errors and _return_data:
        raise Exception('If you set _check_errors to False you must also set _return_data to False')
    if _check_errors and not _mutation_name:
        # detect the name:
        mutation_name = mutation.strip()[len('mutation ') :].split('(')[0].strip()
    else:
        mutation_name = _mutation_name

    result = execute_gql_with_input(mutation, **kwargs)

    if _check_errors:
        if 'data' not in result or mutation_name not in result['data']:
            raise Exception(f'data.{mutation_name} is None')
        if (
            'error' in result['data'][mutation_name]
            and result['data'][mutation_name]['error'] is not None
        ):
            raise Exception(
                f'data.{mutation_name}.error is not None', result['data'][mutation_name]['error']
            )

    if _return_data:
        assert _check_errors
        return result['data'][mutation_name]
    else:
        return result


def register_user(email, password, language='en') -> str:
    """
    Registers the user and returns the globalId of the user
    """
    return execute_gql_mutation(
        REGISTER_USER_MUTATION, email=email, password=password, language=language
    )


def login_user(email, password) -> dict:
    token = execute_gql_mutation(LOGIN_USER_MUTATION, email=email, password=password)['token']
    return {'Authorization': f'Token {token}'}


def close_active_connections(nodb_cursor, db_name):
    """
    closes all connections to active db
    based on https://dba.stackexchange.com/a/11895
    """
    nodb_cursor.execute(
        """
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = %s
        """,
        [db_name],
    )


def drop_database_if_exists(nodb_cursor, db_name):
    nodb_cursor.execute(f'DROP DATABASE IF EXISTS "{db_name}"')


def create_database(nodb_cursor, new_db, template_db=None):
    """
    restores db optionally based on backup

    based on https://stackoverflow.com/a/876565
    """
    if template_db:
        nodb_cursor.execute(f'CREATE DATABASE "{new_db}" WITH TEMPLATE "{template_db}"')
    else:
        nodb_cursor.execute(f'CREATE DATABASE "{new_db}"')


def save_db(db_name):
    db_name_backup = get_backup_db_name(db_name)

    # close my own active db connection to the database and get a connection to the dbms without selecting the db:
    db.connections.close_all()
    with connection._nodb_cursor() as cursor:
        close_active_connections(cursor, db_name)
        drop_database_if_exists(cursor, db_name_backup)
        create_database(cursor, new_db=db_name_backup, template_db=db_name)


def save_dbs():
    """
    Used to create a temporary db snapshot of the active db (for fast api testing)
    """
    django_db_name = connection.settings_dict['NAME']
    save_db(django_db_name)


def drop_and_create_db(db_name):
    db.connections.close_all()
    with connection._nodb_cursor() as cursor:
        close_active_connections(cursor, db_name)
        drop_database_if_exists(cursor, db_name)
        create_database(cursor, new_db=db_name)


def init_dbs():
    """
    Resets the db by dropping it, recreating it
    """
    django_db_name = connection.settings_dict['NAME']
    drop_and_create_db(django_db_name)


def get_backup_db_name(db_name):
    return f'{db_name}-bak'


def restore_db(db_name):

    with connection._nodb_cursor() as cursor:
        close_active_connections(cursor, db_name)
        drop_database_if_exists(cursor, db_name)
        create_database(cursor, new_db=db_name, template_db=get_backup_db_name(db_name))


def restore_dbs():
    db.connections.close_all()
    django_db_name = connection.settings_dict['NAME']

    # add here db's which needs to be restored during tests
    restore_db(django_db_name)
