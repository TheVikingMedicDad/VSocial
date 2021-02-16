import json
import logging
import os
import time
from django.core.mail import EmailMultiAlternatives

from django.core.mail.backends import locmem

from django.conf import settings
from rest_framework import serializers
from rest_framework.fields import empty, SerializerMethodField

log = logging.getLogger(__name__)

MESSAGES_PATH = settings.EMAIL_TESTING_BACKEND_STORE_PATH


class TestingEmailBackend(locmem.EmailBackend):
    """
    This Backend stores all sent emails to EMAIL_TESTING_BACKEND_STORE_PATH as a json file

    In additition to locem's in-memory storage this is needed because of our multi-worker testing environment
    (we cannot share data in-memory between testing api calls)
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def send_messages(self, messages):
        log.info('Send E-Mails:')
        for message in messages:
            log.info(message.message())
        super().send_messages(messages)
        TestingEmailFileStorage.write_messages(messages)


class TestingEmailFileStorage:
    @staticmethod
    def _ensure_dir():
        if not os.path.exists(MESSAGES_PATH):
            os.makedirs(MESSAGES_PATH)

    @staticmethod
    def _get_new_file_name():
        timestamp_ms = int(time.time() * 1000)
        return os.path.join(MESSAGES_PATH, f'{timestamp_ms}.json')

    @classmethod
    def write_messages(cls, messages):
        cls._ensure_dir()
        with open(cls._get_new_file_name(), 'w') as file:
            serializer = EmailSerializer(data=messages, many=True)
            serializer.is_valid()
            file.write(json.dumps(serializer.data, sort_keys=True, indent=4))

    @classmethod
    def get_last_messages_json(cls):
        cls._ensure_dir()
        # get last file
        file_list = os.listdir(MESSAGES_PATH)
        file_list.sort(reverse=True)
        if len(file_list) <= 0:
            return []
        last_file_name = os.path.join(MESSAGES_PATH, file_list[0])
        assert os.path.splitext(last_file_name)[1] == '.json'

        with open(last_file_name) as file:
            messages_json = json.loads(file.read())
        return messages_json

    @classmethod
    def delete_message_files(cls):
        cls._ensure_dir()
        for file in os.listdir(MESSAGES_PATH):
            if not os.path.splitext(file)[1] == '.json':
                continue
            os.remove(os.path.join(MESSAGES_PATH, file))


class EmailSerializer(serializers.Serializer):
    to = serializers.ListField()
    cc = serializers.ListField()
    bcc = serializers.ListField()
    reply_to = serializers.CharField()
    from_email = serializers.CharField()
    subject = serializers.CharField()
    body = serializers.CharField()
    html_message = SerializerMethodField()

    def get_html_message(self, obj: EmailMultiAlternatives):
        if type(obj) != EmailMultiAlternatives or len(obj.alternatives) <= 0:
            return None
        # assuming that first alternative is html message
        if len(obj.alternatives[0]) <= 0:
            return None
        return obj.alternatives[0][0]
