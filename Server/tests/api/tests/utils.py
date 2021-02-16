import json
import os
from datetime import datetime, timezone
from functools import lru_cache
from typing import Dict
from urllib.parse import urlparse

import urllib3
import requests
from uuid import uuid4
from pydash import get

from tests.graphql import LOGIN_USER_MUTATION, REGISTER_USER_MUTATION, QUERY_USER_BY_EMAIL

URL_ENV_KEY = 'CSD_API_TESTING_URL'
IMAGE_UPLOAD_PATH = '/api/file-upload/process/'

# disable the SSL warnings which occurs because of the self signed certificate
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class NoTestingUrlError(Exception):
    pass


class QueryFailedError(Exception):
    pass


def get_server_url():
    try:
        return os.environ[URL_ENV_KEY]
    except KeyError:
        msg = (
            'Error: you need to provide the CSD_API_TESTING_URL '
            'as environment variable like: "https://app.example.com"'
        )
        raise NoTestingUrlError(msg)


def younger_than_seconds(iso_timestamp: str, max_age_seconds: int = 20) -> bool:
    """
    Checks if a given iso timestamp string is younger than max_age_seconds seconds

    :param iso_timestamp: the datetime as isoformatstring which needs to be checked
    :param max_age_seconds: the max age in secends the iso_timestamp is allowed to have
    :return: if the iso_timestamp is younger or not
    """
    questioned_date = datetime.fromisoformat(iso_timestamp)
    age_timedelta = datetime.now(timezone.utc) - questioned_date
    if age_timedelta.seconds < max_age_seconds:
        return True
    else:
        return False


def are_equal_dicts(dict_a: Dict, dict_b: Dict) -> bool:
    """
    Compares two dicts which might be unsorted

    :param dict_a: Dict A
    :param dict_b: Dict B
    :return: if the dicts are equal or not
    """
    dict_a_string = json.dumps(dict_a, sort_keys=True, indent=2)
    dict_b_string = json.dumps(dict_b, sort_keys=True, indent=2)
    return dict_a_string == dict_b_string


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
        f'{get_server_url()}/api/graphql/',
        json={'query': query, 'variables': variables},
        headers=headers,
        verify=False,
    )
    if response.status_code == 200:
        try:
            decoded_json = response.json()
        except Exception:
            raise Exception('JSON decode error. Response: {}', response.content)
    else:
        raise QueryFailedError("Query failed {}. {}".format(response.status_code, response.content))
    return decoded_json


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
        if get(result, f'data.{mutation_name}') is None:
            raise Exception(f'data.{mutation_name} is None')
        if get(result, f'data.{mutation_name}.error') is not None:
            error = get(result, f'data.{mutation_name}.error')
            raise Exception(f'data.{mutation_name}.error is not None: {error}')

    if _return_data:
        assert _check_errors
        return get(result, f'data.{mutation_name}')
    else:
        return result


def upload_image(filepath):
    """
    Uploads an image to the Server's Image upload interface and return the responding key
    """
    url = f'{get_server_url()}{IMAGE_UPLOAD_PATH}'
    files = {'filepond': open('tests/assets/example_profile_image.png', 'rb')}
    response = requests.post(url, files=files, verify=False)
    assert response.status_code == 200
    assert len(response.text) == 22
    return response.text


def is_static_content_available(url):
    try:
        r = requests.get(url, verify=False)
    except ConnectionError:
        return False
    return r.status_code == 200


def restore_db():
    """
    Restores the active DB from a temporary db viea a testing rest endpoint and cleans redis and sent testing emails
    :return:
    """
    return requests.get(f'{get_server_url()}/api/testing/restore-testing-env/', verify=False)


def create_test_records():
    """
    Creates some test user on the server-side via a testing rest endpoint
    """
    return requests.get(f'{get_server_url()}/api/testing/create-test-records/', verify=False)


def get_emails():
    """
    Calls the email testing endpoint which delivers the last sent emails via the TestingEmailBackend
    :return:
    """
    request = requests.get(f'{get_server_url()}/api/testing/emails/', verify=False)
    assert request.status_code == 200
    return request.json()


def get_testing_records_settings() -> dict:
    """
    Calls the testing records settings server endpoint and returns a settings dict if successful
    """
    request = requests.get(f'{get_server_url()}/api/testing/testing-record-settings/', verify=False)
    assert request.status_code == 200, "Testing records settings Endpoint returned an error"
    return request.json()


def delete_emails():
    request = requests.delete(f'{get_server_url()}/api/testing/emails/', verify=False)
    assert request.status_code == 200


def register_and_login():
    """
    Registers a fake user and logs in afterwards
    :return: A dictionary { 'Authorization' : 'Token server-token' } that you can directly pass as a headers argument
    """
    email, password = f'{uuid4()}@example.com', str(uuid4())
    register_user(email, password)
    token = login(email, password)
    return {'Authorization': f'Token {token}'}


def login(email, password, cached=True):
    """
    Logs a given user in and returns the retrieved token.
        Will not redo login mutation if email/password combination already was retrieved

    """
    return (_cached_login if cached else _uncached_login)(email, password)


def _uncached_login(email, password):
    result = execute_gql_mutation(LOGIN_USER_MUTATION, email=email, password=password)
    return result['token']


@lru_cache()
def _cached_login(email, password):
    return _uncached_login(email, password)


def authenticated_header(token):
    return {'Authorization': f'Token {token}'}


def register_user(email, password, language='en'):
    return execute_gql_mutation(
        REGISTER_USER_MUTATION, email=email, password=password, language=language
    )


def get_or_error(obj, path, error=None):
    """
    Uses the pydash.get function to extract `path` out of `obj`. If this object is None: raises Error `error`
    """
    elem = get(obj, path)
    if elem is None:
        if error is None:
            raise AssertionError(f'get_or_error(): obj has no element at {path}')
        else:
            raise error
    return elem


def is_url(url):
    """
    Tests if a given `url` string is a valid url
    from https://stackoverflow.com/a/7183127/11449960
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False


def to_camel_case(snake_str: str) -> str:
    """
    taken from # from graphene/utils/str_converters.py
    """
    components = snake_str.split("_")
    # We capitalize the first letter of each component except the first one
    # with the 'capitalize' method and join them together.
    return components[0] + "".join(x.capitalize() if x else "_" for x in components[1:])


def gql_compare_input_output(should_be: dict, actual: dict, recursive=True, ignore_keys=[]) -> None:
    """
    Helper function which can be used for asserting if a given gql input dictionary `should_be` has the same contents like
    the given output `actual_dict`

    keys in `should_be` are transformed to camelCase before (e.g. should_be['address_line_1'] gets compared with addressLine1

    Raises AssertionError if something differs
    """
    for key, val in should_be.items():
        key = to_camel_case(key)
        if key in ignore_keys:
            continue
        assert key in actual, f'{key} should be in the output dict. Did you forget to query?'
        if type(val) == dict:
            if recursive:
                gql_compare_input_output(val, actual[key])
            else:
                # only compare if the other one is also a dict
                assert type(actual[key]) == dict
        else:
            assert should_be[key] == actual[key], 'some values differs'


class HashedSimpleDict(dict):
    """
    This class can be used to make a simple dictionary hashable (to can use it e.g. as input argument to a cached function)
    """

    def __hash__(self):
        return hash(frozenset(self.items()))


def get_user_info_by_email(email: str, admin_header: dict) -> dict:
    return _cached_get_user_info_by_email(email, HashedSimpleDict(admin_header))


@lru_cache()
def _cached_get_user_info_by_email(email: str, admin_header_hdict: HashedSimpleDict) -> dict:
    all_users = execute_gql(
        QUERY_USER_BY_EMAIL, headers=admin_header_hdict, variables={'email': email}
    )['data']['allUsers']
    assert all_users['totalCount'] == 1, f'No user found with email {email}'
    return all_users['edges'][0]['node']


def init_demo_data():
    """
    Inits some demo data, this is just for debugging in should not do anything because
    all demo test data should be created in the test_creator
    """
    url = f'{get_server_url()}/api/testing/init-demo-data/'
    response = requests.get(url, verify=False)
    assert response.status_code == 200
    return response.text
