from pprint import pprint

from tests.graphql import (
    ME_QUERY,
    UPDATE_USER_PROFILE_IMAGE_MUTATION,
    QUERY_USER_PROFILE_PICTURE,
    UPDATE_USER_MUTATION,
    QUERY_USER_BY_ID,
    DELETE_USER_MUTATION,
    CREATE_USER_MUTATION,
    UPDATE_ME_MUTATION,
)
from tests.utils import execute_gql, execute_gql_mutation, upload_image, is_static_content_available

EXAMPLE_PROFILE_PICTURE_PATH = 'tests/assets/example_profile_image.png'


def test_create_user_as_admin(admin_header, test_record_settings):
    # GIVEN
    email = f'test-create-user-with-tag@{test_record_settings("default_email_domain")}'
    payload = {'email': email}

    # WHEN
    data = execute_gql_mutation(CREATE_USER_MUTATION, _headers=admin_header, **payload)

    # THEN
    assert data['user']['email'] == email


def test_create_user_not_allowed(test1_header, test_record_settings):
    # GIVEN
    # user payload
    email = f'test-create-user-with-tag@{test_record_settings("default_email_domain")}'
    payload = {'email': email}

    # WHEN
    # we try to create a user without permissions
    result = execute_gql_mutation(
        CREATE_USER_MUTATION,
        _headers=test1_header,
        _check_errors=False,
        _return_data=False,
        **payload,
    )

    # THEN
    # it must retun an error
    assert result['data']['createUser']['error']['id'] == 'PERMISSION_DENIED_ERROR'


def test_query_me(snapshot, default_header, test_record_settings):
    result = execute_gql(ME_QUERY, headers=default_header)
    me = result['data']['me']
    assert me['username'] == test_record_settings('users.1.email')
    pprint(me)

    # remove time related data
    del me['registrationCompleted']
    snapshot.assert_match(me)


def test_query_me_admin_permissions(admin_header):
    result = execute_gql(ME_QUERY, headers=admin_header)
    me = result['data']['me']
    assert 'Administrators' in me['groups']


def test_update_me(test1_user_obj, test1_header):
    # GIVEN
    user_id = test1_user_obj['id']
    # WHEN
    data = execute_gql_mutation(
        UPDATE_ME_MUTATION, _headers=test1_header, **{'id': user_id, 'firstName': 'Saphod'}
    )
    # THEN
    assert data['user']['firstName'] == 'Saphod'


def test_update_me_as_not_allowed(test1_user_obj, test2_header):
    # GIVEN
    user_id = test1_user_obj['id']
    # WHEN
    result = execute_gql_mutation(
        UPDATE_ME_MUTATION,
        _headers=test2_header,
        _check_errors=False,
        _return_data=False,
        **{'id': user_id, 'firstName': 'Saphod'},
    )
    # THEN
    # permission denied error must be returned
    assert result['data']['updateMe']['error']['id'] == 'PERMISSION_DENIED_ERROR'


def test_update_user_empty_interests(test1_user_obj, test1_header):
    # GIVEN
    # WHEN
    result = execute_gql_mutation(
        UPDATE_USER_MUTATION, _headers=test1_header, **{'id': test1_user_obj['id'], 'interests': []}
    )['user']
    # THEN
    assert len(result['interests']) == 0


def test_update_user_image(admin_header, test2_user_obj, test2_header, api_is_production):
    # GIVEN
    user_id = test2_user_obj['id']
    oldImg = execute_gql(
        QUERY_USER_PROFILE_PICTURE, headers=admin_header, variables={'id': user_id}
    )['data']['user']['profileImage']

    payload = {'id': user_id, 'profileImageTemporaryId': upload_image(EXAMPLE_PROFILE_PICTURE_PATH)}

    # WHEN
    data = execute_gql_mutation(
        UPDATE_USER_PROFILE_IMAGE_MUTATION, _headers=test2_header, **payload
    )

    # THEN
    newImg = execute_gql(
        QUERY_USER_PROFILE_PICTURE, headers=admin_header, variables={'id': user_id}
    )['data']['user']['profileImage']
    assert newImg is not None and newImg != ''
    assert oldImg != newImg
    if not api_is_production:
        # test also if image is downloadable, (does not work on drone)
        assert is_static_content_available(newImg), "cannot not download uploaded image"


def test_delete_user_as_myself(test2_user_obj, test2_header, api_is_production):
    # GIVEN
    user_id = test2_user_obj['id']
    payload = {'id': user_id}

    # WHEN
    data = execute_gql_mutation(DELETE_USER_MUTATION, _headers=test2_header, **payload)

    # THEN
    assert data['error'] is None


def test_delete_user_as_admin(admin_header, test2_user_obj, api_is_production):
    # GIVEN
    user_id = test2_user_obj['id']
    payload = {'id': user_id}

    # WHEN
    data = execute_gql_mutation(DELETE_USER_MUTATION, _headers=admin_header, **payload)

    # THEN
    assert data['error'] is None


def test_delete_user_as_other_user(test1_header, test2_user_obj, api_is_production):
    # GIVEN
    # a user we want to delete
    user_id = test2_user_obj['id']
    payload = {'id': user_id}

    # WHEN
    # we try to delete a user with another one who has no permission to do that
    result = execute_gql_mutation(
        DELETE_USER_MUTATION,
        _headers=test1_header,
        _check_errors=False,
        _return_data=False,
        **payload,
    )

    # THEN
    # permission denied error must be returned
    assert result['data']['deleteUser']['error']['id'] == 'PERMISSION_DENIED_ERROR'


# 
