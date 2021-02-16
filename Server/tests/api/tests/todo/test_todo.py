from tests.graphql import (
    QUERY_ALL_USER_TODOS,
    CREATE_TODO_MUTATION,
    DELETE_TODO_MUTATION,
    UPDATE_TODO_MUTATION,
)
from tests.utils import execute_gql, execute_gql_mutation


def test_create(test1_header):
    # GIVEN
    payload = {'text': 'default todo text', 'isDone': False}

    # WHEN
    result = execute_gql_mutation(CREATE_TODO_MUTATION, _headers=test1_header, **payload)

    # THEN
    todo = result['todo']
    assert result['error'] is None
    assert todo['text'] == payload['text']
    assert todo['isDone'] == payload['isDone']


def test_query(test1_header):
    # GIVEN
    payload = {'text': 'default todo text', 'isDone': False}
    original_todo = execute_gql_mutation(CREATE_TODO_MUTATION, _headers=test1_header, **payload)

    # WHEN
    todos = execute_gql(QUERY_ALL_USER_TODOS, headers=test1_header)

    # THEN
    queried_todo = todos['data']['me']['ownedOrganisation']['todos']['edges'][0]['node']
    assert queried_todo['id'] == original_todo['todo']['id']


def test_delete(test1_header):
    # GIVEN
    payload = {'text': 'default todo text', 'isDone': False}
    original_todo = execute_gql_mutation(CREATE_TODO_MUTATION, _headers=test1_header, **payload)

    # WHEN
    delete_payload = {'id': original_todo['todo']['id']}
    deleted_todo = execute_gql_mutation(
        DELETE_TODO_MUTATION, _headers=test1_header, **delete_payload
    )

    # THEN
    assert deleted_todo['error'] is None


def test_update(test1_header):
    # GIVEN
    payload = {'text': 'updated todo text', 'isDone': True}
    original_todo = execute_gql_mutation(CREATE_TODO_MUTATION, _headers=test1_header, **payload)

    # WHEN
    update_payload = {
        'id': original_todo['todo']['id'],
        'text': 'default todo text',
        'isDone': False,
    }
    updated_todo = execute_gql_mutation(
        UPDATE_TODO_MUTATION, _headers=test1_header, **update_payload
    )

    # THEN
    assert updated_todo['error'] is None
    assert updated_todo['todo']['id'] == original_todo['todo']['id']
    assert updated_todo['todo']['text'] == update_payload['text']
    assert updated_todo['todo']['isDone'] == update_payload['isDone']
