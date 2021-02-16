import copy
import logging
import os
import random
import tempfile
from distutils.dir_util import copy_tree

from django.contrib import auth
from django.contrib.auth.models import Group
from django.contrib.sessions.backends.db import SessionStore
from django.utils import timezone

from webapp.core.utils.testing_views_assets import (
    EXAMPLE_AVATAR_IMAGE_TUX,
    EXAMPLE_AVATAR_IMAGE_FEMALE,
)
from webapp.core.utils.testing_views_utils import (
    ENV_TESTING_PREFIX,
    User,
    register_user,
    execute_gql_mutation,
    upload_base64_decoded_image_file,
)
from webapp.core.utils.testing_views_utils_graphql import (
    CONFIRM_EMAIL_MUTATION,
    CONFIRM_USER_MUTATION,
    UPDATE_USER_MUTATION,
)
from webapp.users.email_confirmation import EmailConfirmationHMAC

log = logging.getLogger(__name__)


class TestRecordCreator:
    def __init__(self, testing_record_input):
        self.input = testing_record_input

    def is_db_in_initial_state(self):
        test_user = self.input.get('users.1.email')
        try:
            User.objects.get(email=test_user)
        except User.DoesNotExist:
            return True
        return False

    def do_create(self):
        self._create_users()
        self._set_user_permissions()

    def _create_users(self):
        # create our new test users
        for user_record in self.input.get('users'):
            self._register_user_and_confirm(user_record)

    def _register_user_and_confirm(self, user_record):
        register_result = register_user(
            user_record['username'], user_record['password'], language=user_record['language']
        )
        global_user_id = register_result['user']['id']
        user_id = global_user_id.split(':')[-1]
        user_header = {'Authorization': f'Token {register_result["token"]}'}
        # get key by calculating it again, todo: parse email
        confirm_key = EmailConfirmationHMAC(user_record['username'], user_id).key
        # confirm email
        result = execute_gql_mutation(CONFIRM_EMAIL_MUTATION, key=confirm_key)
        # confirm account
        confirmed = execute_gql_mutation(
            CONFIRM_USER_MUTATION,
            **{
                'key': confirm_key,
                'confirmAccountInfo': {
                    'firstName': user_record.get('firstName', 'Ano'),
                    'lastName': user_record.get('lastName', 'Nymous'),
                    'interests': user_record.get('interests', []),
                    'salutation': user_record.get('salutation', random.choice(['MR', 'MRS'])),
                    'country': user_record.get('country', 'AT'),
                },
            },
        )
        # update user: set profile picture:
        upload_id = upload_base64_decoded_image_file(
            user_record.get('profileImage', EXAMPLE_AVATAR_IMAGE_FEMALE)
        )
        execute_gql_mutation(
            UPDATE_USER_MUTATION,
            _headers=user_header,
            **{
                'id': global_user_id,
                'profileImageTemporaryId': upload_id,
                'tags': user_record.get('tags', []),
            },
        )

    def _set_user_permissions(self):
        """
        This method sets superuser permissions to the admin user
        by calling model methods directly
        """
        user = User.objects.get(email=self.input.get('users.0.email'))
        user.is_superuser = True
        user.is_staff = True
        user.save()
        Group.objects.get(name='Administrators').user_set.add(user)

        session = SessionStore(None)
        session.clear()
        session.cycle_key()
        session[auth.SESSION_KEY] = user._meta.pk.value_to_string(user)
        session[auth.BACKEND_SESSION_KEY] = 'django.contrib.auth.backends.ModelBackend'
        session[auth.HASH_SESSION_KEY] = user.get_session_auth_hash()
        session.save()
