import re
from datetime import datetime, timezone
from uuid import uuid4

from dateutil.parser import isoparse

from tests.invitation_system.support_graphql import (
    CREATE_INVITATION_MUTATION,
    QUERY_INVITATION_BY_TOKEN,
    ACCEPT_INVITATION_MUTATION,
    CANCEL_INVITATION_MUTATION,
    QUERY_INVITATION_BY_ID,
    REJECT_INVITATION_MUTATION,
    RESEND_INVITATION_MUTATION,
)
from tests.utils import (
    get_emails,
    execute_gql_mutation,
    is_url,
    authenticated_header,
    login,
    execute_gql,
    delete_emails,
)

STATE_PENDING = 'PENDING'


REGEX_INVITATION_LINK = r'http[s]{0,1}:\/\/.*\/invitation\/check\/([0-9a-fA-F-]{0,36})'


def extract_invitation_link_and_token(html):
    """
    Returns (url, token) or raises Exception
    """
    match = re.search(REGEX_INVITATION_LINK, html)
    assert match is not None
    url = match.group(0)
    token = match.group(1)
    assert is_url(url)
    return url, token


def test_sending_email_when_create_user_invitation(need_reset_emails, default_header):
    # GIVEN
    input = {
        'invitationType': 'USER',
        'inviteeEmail': f'invitee-{uuid4()}@example.com',
        'message': 'Hey buddy!\nI just registered at vsocial. This app is great! Have a look :-)',
    }

    # WHEN
    result = execute_gql_mutation(CREATE_INVITATION_MUTATION, _headers=default_header, **input)

    # THEN
    # test the result:
    assert 'invitation' in result
    assert all(
        key in result['invitation']
        for key in ('id', 'expires', 'created', 'state', 'invitationType', 'message', 'payload')
    )
    expires = isoparse(result['invitation']['expires'])
    assert expires > datetime.now(timezone.utc)
    assert result['invitation']['state'] == STATE_PENDING

    # test the sent mail:
    emails = get_emails()
    assert len(emails) == 1
    email = emails[0]
    assert len(email['to']) == 1
    assert email['to'][0] == input['inviteeEmail']
    assert email['body'].find('Hey buddy!') != -1, 'Personal message should be in email text'
    extract_invitation_link_and_token(email['body'])


def test_resend_invitation(default_header):
    pass


def test_query_invitation_using_token(default_header, test_record_settings):
    # we invite the admin user
    # GIVEN
    invitee_email = test_record_settings('users.4.email')
    input = {'invitationType': 'USER', 'inviteeEmail': invitee_email}
    # invite the user as default_user:
    execute_gql_mutation(CREATE_INVITATION_MUTATION, _headers=default_header, **input)
    _, token = extract_invitation_link_and_token(get_emails()[0]['body'])

    # WHEN
    hubert_header = authenticated_header(
        login(invitee_email, test_record_settings('users.1.password'))
    )
    result = execute_gql(
        QUERY_INVITATION_BY_TOKEN, headers=hubert_header, variables={'token': token}
    )
    invitation = result['data']['invitation']

    # THEN
    assert invitation is not None
    assert invitation['state'] == STATE_PENDING
    assert invitation['inviteeEmail'] == invitee_email
    assert invitation['isValid']
    assert invitation['invalidReason'] is None
    assert len(invitation['acceptPage']) > 0


def test_accept_user_invitation_with_existing_user(default_header, test_record_settings):
    # we invite the german user
    # GIVEN
    invitee_email = test_record_settings('users.4.email')
    input = {'invitationType': 'USER', 'inviteeEmail': invitee_email}
    # invite the user as default_user:
    execute_gql_mutation(CREATE_INVITATION_MUTATION, _headers=default_header, **input)
    # retrieve the token by reading hubert's mail:
    _, token = extract_invitation_link_and_token(get_emails()[0]['body'])

    # WHEN
    # log in as hubert and call the acceptInvitationMutation as him:
    hubert_header = authenticated_header(
        login(invitee_email, test_record_settings('users.4.password'))
    )
    # accept
    result = execute_gql_mutation(
        ACCEPT_INVITATION_MUTATION, _headers=hubert_header, acceptToken=token
    )

    # THEN
    assert result['invitation']['state'] == 'ACCEPTED'


def test_cancel_user_invitation(default_header, test_record_settings):
    # we invite the german user and cancel it again
    # GIVEN
    invitee_email = test_record_settings('users.4.email')
    input = {'invitationType': 'USER', 'inviteeEmail': invitee_email}
    result = execute_gql_mutation(CREATE_INVITATION_MUTATION, _headers=default_header, **input)
    invitation_id = result['invitation']['id']
    delete_emails()

    # WHEN
    execute_gql_mutation(CANCEL_INVITATION_MUTATION, _headers=default_header, id=invitation_id)

    # THEN
    result = execute_gql(
        QUERY_INVITATION_BY_ID, headers=default_header, variables={'id': invitation_id}
    )
    assert result['data']['invitation']['state'] == 'CANCELED'
    # test the information mail:
    emails = get_emails()
    assert len(emails) == 1
    email = emails[0]
    assert email['to'][0] == input['inviteeEmail']
    assert email['body'].lower().find('cancel') != -1, 'Info mail should include `cancel`'


def test_accept_canceled_user_invitation(default_header, test_record_settings):
    """
    This test
        - creates an invitation as user (a) to user (b)
        - cancels the invitation as user (a)
        - tries to accept the invitation as user (b) --> should fail
    """
    # GIVEN
    invitee_email = test_record_settings('users.4.email')
    input = {'invitationType': 'USER', 'inviteeEmail': invitee_email}
    result = execute_gql_mutation(CREATE_INVITATION_MUTATION, _headers=default_header, **input)
    invitation_id = result['invitation']['id']
    _, token = extract_invitation_link_and_token(get_emails()[0]['body'])
    execute_gql_mutation(CANCEL_INVITATION_MUTATION, _headers=default_header, id=invitation_id)

    # WHEN
    hubert_header = authenticated_header(
        login(invitee_email, test_record_settings('users.4.password'))
    )
    result = execute_gql_mutation(
        ACCEPT_INVITATION_MUTATION,
        _headers=hubert_header,
        acceptToken=token,
        _check_errors=False,
        _return_data=False,
    )
    assert result['data']['acceptInvitation']['error'] is not None
    assert result['data']['acceptInvitation']['error']['id'] == 'INVITATION_NOT_VALID'
    assert result['data']['acceptInvitation']['error']['data'] == 'CANCELED'


def test_reject_user_invitation(default_header, test_record_settings):
    # we invite the german user and reject the invitation as the german user
    # GIVEN
    invitee_email = test_record_settings('users.4.email')
    input = {'invitationType': 'USER', 'inviteeEmail': invitee_email}
    result = execute_gql_mutation(CREATE_INVITATION_MUTATION, _headers=default_header, **input)
    invitation_id = result['invitation']['id']

    # WHEN
    hubert_header = authenticated_header(
        login(invitee_email, test_record_settings('users.4.password'))
    )
    execute_gql_mutation(REJECT_INVITATION_MUTATION, _headers=hubert_header, id=invitation_id)

    # THEN
    result = execute_gql(
        QUERY_INVITATION_BY_ID, headers=default_header, variables={'id': invitation_id}
    )
    assert result['data']['invitation']['state'] == 'REJECTED'


def test_resend_user_invitation(default_header, test_record_settings):
    # we invite the german user and reject the invitation as the german user
    # GIVEN
    invitee_email = test_record_settings('users.4.email')
    input = {'invitationType': 'USER', 'inviteeEmail': invitee_email}
    invitation_id = execute_gql_mutation(
        CREATE_INVITATION_MUTATION, _headers=default_header, **input
    )['invitation']['id']
    delete_emails()
    assert len(get_emails()) == 0

    # WHEN
    result = execute_gql_mutation(
        RESEND_INVITATION_MUTATION, _headers=default_header, id=invitation_id
    )

    # THEN
    assert isoparse(result['invitation']['created']) < isoparse(result['invitation']['updated'])
    emails = get_emails()
    assert len(emails) == 1, 'There must be one mail'
    assert emails[0]['to'][0] == invitee_email, 'Mail should be sent to the invitee'
