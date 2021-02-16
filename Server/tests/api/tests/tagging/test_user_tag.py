from tests.graphql import CREATE_USER_MUTATION, UPDATE_USER_MUTATION, QUERY_ALL_USER_TAGS
from tests.utils import execute_gql_mutation, execute_gql


def test_create_user_with_tag(admin_header, test_record_settings):
    # GIVEN
    payload = {
        'email': f'test-create-user-with-tag@{test_record_settings("default_email_domain")}',
        'tags': [{'name': 'tag1'}, {'name': 'tag2'}, {'name': 'tag3'}],
    }

    # WHEN
    result = execute_gql_mutation(CREATE_USER_MUTATION, _headers=admin_header, **payload)['user']

    # THEN
    assert result['tags']['totalCount'] == 3


def test_tag_user(admin_header, test1_user_obj):
    """
    This test adds some new tags to user 1 (note: user 1 already has one tag before)
    """
    # GIVEN
    payload = {
        'id': test1_user_obj['id'],
        'tags': [{'name': 'tag1'}, {'name': 'tag2'}, {'name': 'tag3'}],
    }
    # WHEN
    result = execute_gql_mutation(UPDATE_USER_MUTATION, _headers=admin_header, **payload)['user']
    # THEN
    assert result['tags']['totalCount'] == 4


def test_tag_two_user(admin_header, test1_user_obj, test2_user_obj):
    """
    This test tags user 1 and user 2
    """
    # GIVEN
    payload = {
        'id': test1_user_obj['id'],
        'tags': [{'name': 'tag1'}, {'name': 'tag2'}, {'name': 'tag3'}],
    }
    user_one_tags = execute_gql_mutation(UPDATE_USER_MUTATION, _headers=admin_header, **payload)[
        'user'
    ]['tags']
    tag1_user_one_id = list(
        filter(lambda edge: edge['node']['name'] == 'tag1', user_one_tags['edges'])
    )[0]['node']['id']

    # WHEN
    payload = {
        'id': test2_user_obj['id'],
        'tags': [{'name': 'tag1'}, {'name': 'tag4'}, {'name': 'tag3'}, {'name': 'tag6'}],
    }
    user_two_tags = execute_gql_mutation(UPDATE_USER_MUTATION, _headers=admin_header, **payload)[
        'user'
    ]['tags']
    tag1_user_two_id = list(
        filter(lambda edge: edge['node']['name'] == 'tag1', user_two_tags['edges'])
    )[0]['node']['id']

    # THEN
    assert tag1_user_one_id == tag1_user_two_id
    assert user_two_tags['totalCount'] == 4


def test_query_all_user_tags(admin_header, test1_user_obj, test2_user_obj):
    # GIVEN
    execute_gql_mutation(
        UPDATE_USER_MUTATION,
        _headers=admin_header,
        **{
            'id': test1_user_obj['id'],
            'tags': [{'name': 'tag1'}, {'name': 'tag2'}, {'name': 'tag3'}],
        },
    )
    execute_gql_mutation(
        UPDATE_USER_MUTATION,
        _headers=admin_header,
        **{
            'id': test2_user_obj['id'],
            'tags': [{'name': 'tag1'}, {'name': 'tag5'}, {'name': 'foo3'}],
        },
    )

    # WHEN
    result = execute_gql(
        QUERY_ALL_USER_TAGS, headers=admin_header, variables={'name_Istartswith': 'tAg'}
    )['data']['allUserTags']

    # THEN
    assert result['totalCount'] == 4, "foo is filtered out, so tag1, tag2, tag3 and tag5"
