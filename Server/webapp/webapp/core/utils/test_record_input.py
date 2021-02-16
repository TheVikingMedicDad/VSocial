import logging
import os

from webapp.core.utils.testing_views_assets import (
    EXAMPLE_AVATAR_IMAGE_MALE,
    EXAMPLE_AVATAR_IMAGE_FEMALE,
)

log = logging.getLogger(__name__)


def is_production():
    return os.environ.get('DJANGO_SETTINGS_MODULE') == 'config.settings.production'


class TestRecordInput:
    _raw = {
        'users': [
            {
                'language': 'en',
                'salutation': 'MR',
                'firstName': 'Admin',
                'lastName': 'Admin',
                'tags': [],
                'is_staff': True,
                'is_superuser': True,
            },
            {
                'language': 'en',
                'salutation': 'MR',
                'firstName': 'Test',
                'lastName': 'One',
                'tags': [{'name': 'testuser'}],
            },
            {'language': 'en', 'salutation': 'MR', 'firstName': 'Test', 'lastName': 'Two'},
            {'language': 'en', 'salutation': 'MRS', 'firstName': 'Test', 'lastName': 'Three'},
            {'language': 'de', 'salutation': 'MRS', 'firstName': 'Test', 'lastName': 'Vier'},
            {'language': 'de', 'salutation': 'MR', 'firstName': 'Test', 'lastName': 'Fünf'},
        ],
        'isProduction': is_production(),
        'default_email_domain': 'example.com',
        'default_password': '123456',
    }

    def get(self, path: str = None):
        tmp_data = self.enriched()
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

    def enriched(self):
        enriched_input = self._enrich_user(self._raw)
        enriched_input = self._enrich_default_email_domain(enriched_input)
        enriched_input = self._enrich_default_password(enriched_input)
        return enriched_input

    def _enrich_user(self, input):
        user_count = 0
        for user in input['users']:
            email_prefix = f'test{user_count}' if user_count != 0 else 'admin'
            email = f'{email_prefix}@{self._default_email_domain()}'
            user['username'] = email
            user['email'] = email
            user['password'] = self._default_password()
            user['profileImage'] = EXAMPLE_AVATAR_IMAGE_FEMALE
            user_count += 1
        return input

    def _default_email_domain(self):
        return os.environ.get(
            'CSD_TESTING_USER_DEFAULT_EMAIL_DOMAIN', self._raw["default_email_domain"]
        )

    def _default_password(self):
        return os.environ.get('CSD_TESTING_USER_DEFAULT_PASSWORD', self._raw["default_password"])

    def _enrich_default_email_domain(self, input):
        input['default_email_domain'] = self._default_email_domain()
        return input

    def _enrich_default_password(self, input):
        input['default_password'] = self._default_password()
        return input
