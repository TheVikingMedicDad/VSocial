from pprint import pprint
from uuid import uuid4

import pytest
from tests.utils import register_user, get_emails, delete_emails

from tests.graphql import DELETE_USER_MUTATION
from tests.utils import execute_gql_mutation


# @pytest.mark.skip()
def test_send_signup_email():
    """
    Just here for local testing of sending registration email.
    """
    email_to = "christian.haintz@cnc.io"
    res = register_user(email_to, "Test1!")
    auth_header = {"Authorization": f"Token {res['token']}"}

    user_id = res["user"]["id"]

    # WHEN

    # THEN

    # CLEANUP
    payload = {"id": user_id}
    execute_gql_mutation(DELETE_USER_MUTATION, _headers=auth_header, **payload)


def test_emails():
    # GIVEN
    email_to = f"{uuid4()}@example.com"
    res = register_user(email_to, "123456")
    auth_header = {"Authorization": f"Token {res['token']}"}

    user_id = res["user"]["id"]

    # WHEN
    emails = get_emails()

    # THEN
    assert len(emails) == 1
    assert emails[0].get("to")[0] == email_to
    assert len(emails[0].get("body")) > 100
    assert len(emails[0].get("htmlMessage")) > 100
    assert len(emails[0].get("subject")) > 5
    assert "@" in emails[0].get("fromEmail")

    # CLEANUP
    payload = {"id": user_id}
    data = execute_gql_mutation(DELETE_USER_MUTATION, _headers=auth_header, **payload)
    pprint(data)


def test_delete_emails():
    # GIVEN
    register_user("some-random-user@example.com", 1234)

    # WHEN
    delete_emails()

    # THEN
    emails = get_emails()
    assert len(emails) == 0
