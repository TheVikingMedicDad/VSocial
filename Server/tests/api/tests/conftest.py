import os
import pytest

from tests.utils import (
    login,
    restore_db,
    delete_emails,
    authenticated_header,
    get_testing_records_settings,
    get_user_info_by_email,
    HashedSimpleDict,
)

ENV_TESTING_PREFIX = 'CSD_TESTING'


@pytest.fixture(scope="function", autouse=True)
def prepare_test_case():
    # restore db before each test
    response = restore_db()
    assert response.status_code == 200
    yield
    # we dont need to clean after each test - better to clean before each test


@pytest.fixture(scope="session")
def test_record_settings():
    """
    Loads the test records from the server (only available in testing mode)
    :return:
    """
    data = get_testing_records_settings()

    def get(path: str = None):
        tmp_data = data
        if not path:
            return tmp_data
        keys = path.split('.')
        for key in keys:
            try:
                key = int(key)
            except ValueError:
                pass
            tmp_data = tmp_data[key]
        return tmp_data

    return get


@pytest.fixture(scope="session")
def api_is_production(test_record_settings):
    return test_record_settings('isProduction')


@pytest.fixture()
def default_user_token(test_record_settings):
    """
    This fixture logs in the default user and returns its token
    """
    email = test_record_settings('users.1.email')
    pwd = test_record_settings('users.1.password')
    return login(email, pwd)


@pytest.fixture()
def german_user_token(test_record_settings):
    """
    This fixture logs in the german user and returns its token
    """
    email = test_record_settings('users.4.email')
    pwd = test_record_settings('users.4.password')
    return login(email, pwd)


@pytest.fixture(scope="session")
def test_user_settings(test_record_settings) -> callable:
    suffix = test_record_settings('default_email_domain')
    all_users = test_record_settings('users')

    def _user_entry(email_prefix: str) -> dict:
        email = f'{email_prefix}@{suffix}'
        user_setting = list(filter(lambda user: user['username'] == email, all_users))
        assert len(user_setting) != 0, f'{email} not found in test_records'
        return user_setting[0]

    return _user_entry


@pytest.fixture(scope="session")
def test_user_header_func(test_user_settings) -> callable:
    def _get_authenticated_header(email_prefix: str) -> dict:
        user_setting = test_user_settings(email_prefix)
        return authenticated_header(login(user_setting['username'], user_setting['password']))

    return _get_authenticated_header


@pytest.fixture()
def test_user_obj_func(test_user_settings, admin_header) -> callable:
    def __get_test_user_obj(email_prefix):
        return get_user_info_by_email(test_user_settings(email_prefix)['username'], admin_header)

    return __get_test_user_obj


@pytest.fixture()
def test1_user_obj(test_user_obj_func):
    return test_user_obj_func('test1')


@pytest.fixture()
def test2_user_obj(test_user_obj_func):
    return test_user_obj_func('test2')


@pytest.fixture()
def test3_user_obj(test_user_obj_func):
    return test_user_obj_func('test3')


@pytest.fixture()
def test4_user_obj(test_user_obj_func):
    return test_user_obj_func('test4')


@pytest.fixture()
def test5_user_obj(test_user_obj_func):
    return test_user_obj_func('test5')


@pytest.fixture()
def test1_header(test_user_header_func):
    return test_user_header_func('test1')


@pytest.fixture()
def test2_header(test_user_header_func):
    return test_user_header_func('test2')


@pytest.fixture()
def test3_header(test_user_header_func):
    return test_user_header_func('test3')


@pytest.fixture()
def test4_header(test_user_header_func):
    return test_user_header_func('test4')


@pytest.fixture()
def test5_header(test_user_header_func):
    return test_user_header_func('test5')


@pytest.fixture()
def german_user_header(german_user_token):
    """
    This fixture logs in the german user and returns its authenticated header
    """
    return authenticated_header(german_user_token)


@pytest.fixture()
def default_header(default_user_token):
    """
    Logs in the default user and returns a header dictionary having the Authentication Token set already
    """
    return authenticated_header(default_user_token)


@pytest.fixture()
def admin_header(test_record_settings):
    """
    Logs in the admin user and returns a header dictionary having the Authentication Token set already
    """
    email = test_record_settings('users.0.email')
    pwd = test_record_settings('users.0.password')
    return authenticated_header(login(email, pwd))


@pytest.fixture()
def need_reset_emails():
    delete_emails()
    yield "Done"
