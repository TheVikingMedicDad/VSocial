import requests
import time
import pytest

from pydash import get

from tests.utils import execute_gql, get_server_url


def test_rest():
    response = requests.get(f'{get_server_url()}/api/test', verify=False)
    json_data = response.json()
    assert json_data['msg'] == 'My rest call response'


def test_query_all_users(admin_header):
    """
    Tests the gql Query `allUsers` 3 times:
        * without the `orderBy` argument
        * with the `orderBy` argument
        * with the `orderBy` set to id,email
    :return:
    """
    total_counts = []
    for order_by_clause in ('', '(orderBy: "id")', '(orderBy: ["id", "email"])'):
        query = (
            "query AllUsers { allUsers"
            + order_by_clause
            + " { totalCount, edges { node { id } } } }"
        )
        result = execute_gql(query, headers=admin_header)
        total_count = get(result, 'data.allUsers.totalCount')
        assert total_count is not None
        edges = get(result, 'data.allUsers.edges')
        assert total_count == len(edges)
        total_counts.append(total_count)

    # check if all queries returned the same amount of users:
    assert all(item == total_counts[0] for item in total_counts)
