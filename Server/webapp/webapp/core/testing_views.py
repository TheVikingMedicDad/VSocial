import logging
import os
import time
from pprint import pformat

from django import db
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.db import connection, transaction
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.conf import settings
from django.utils import timezone
from django_redis import get_redis_connection
from rest_framework.response import Response
from rest_framework.views import APIView

# 
from webapp.core.utils.color import generate_mat_color_palette
from webapp.core.utils.email_utils import base_template_context
from webapp.core.utils.testing_email_backend import TestingEmailFileStorage
from webapp.core.utils.testing_views_utils import db_exists, save_dbs, restore_dbs
from webapp.core.utils.test_record_input import TestRecordInput
from webapp.core.utils.test_record_creator import TestRecordCreator

User = get_user_model()

log = logging.getLogger(__name__)

HTTP_STATUS_PRECONDITION_REQUIRED = 428


def change_email_email_view(request):
    base_context = base_template_context()
    return render(request, "users/email/password_reset_request_message.txt", base_context)


def restore_testing_env(request):
    """
    Used to restore the active db from  a temporary db snapshot and cleanup redis and
    testing email system
    """
    db_name = connection.settings_dict["NAME"]
    db_name_backup = f"{db_name}{settings.CSD_DB_TESTING_SNAPSHOT_SUFFIX}"

    # first we have to make sure that the backup db exists
    if not db_exists(db_name_backup):
        raise Exception(f"Backup DB does not exist")

    restore_dbs()

    # clear the redis cache
    redis_connection = get_redis_connection("redis")
    redis_connection.flushdb()

    # clear all sent emails
    TestingEmailFileStorage.delete_message_files()

    return HttpResponse(status=200)


class EmailsView(APIView):
    def get(self, request, format=None):
        from webapp.core.utils.testing_email_backend import TestingEmailFileStorage

        return Response(data=TestingEmailFileStorage.get_last_messages_json())

    def delete(self, request, format=None):
        from webapp.core.utils.testing_email_backend import TestingEmailFileStorage

        TestingEmailFileStorage.delete_message_files()
        return Response()


def last_email(request):
    """
    This View displays the last email and renders it as html
    """
    from webapp.core.utils.testing_email_backend import TestingEmailFileStorage

    last_messages_json = TestingEmailFileStorage.get_last_messages_json()
    if len(last_messages_json) <= 0:
        return HttpResponse("No Email found", status=404)

    body = TestingEmailFileStorage.get_last_messages_json()[0]["html_message"]
    return HttpResponse(body)


def testing_record_settings(request):
    """
    This View returns the testing record settings dict as json object
    """
    if not settings.CSD_TEST_RECORDS_ACCESS:
        raise PermissionDenied()

    return JsonResponse(TestRecordInput().get())


@transaction.non_atomic_requests
def create_testing_db_template(request):
    """
    Inits the current db with testing data and persists the data as a db template
    so that it can easily and fast restored before each test using the restore_testing_env() function.
    """
    # create the test records
    log.debug("Run TestRecordCreator")
    creator = TestRecordCreator(TestRecordInput())
    if creator.is_db_in_initial_state():
        creator.do_create()

    # 
    log.debug("Save snapshot to db")
    save_dbs()
    return HttpResponse(status=200)


def enable_debugger_view(request):
    from webapp.core.utils.debugger_utils import DEBUGGER_FLAG_FILE, disconnect_debugger

    open(DEBUGGER_FLAG_FILE, "a").close()
    return HttpResponse(f"pydev enabled at {timezone.now()}", status=200)


def disable_debugger_view(request):
    from webapp.core.utils.debugger_utils import DEBUGGER_FLAG_FILE, disconnect_debugger

    disconnect_debugger()
    if os.path.isfile(DEBUGGER_FLAG_FILE):
        os.remove(DEBUGGER_FLAG_FILE)
    return HttpResponse(f"pydev disabled at {timezone.now()}", status=200)


def init_demo_data(request):
    """
    This should ideally do nothing and should only be used during developing of new test_creator parts
    as it is faster to debug here, as recreate the whole testing db snapshot

    To use this function, call from a test init_demo_data() to execute this function
    """
    b = "#" + request.GET.get("b", "")
    d = "#" + request.GET.get("d", "")
    l = "#" + request.GET.get("l", "")

    log.debug(f"#### {pformat(generate_mat_color_palette(b, d, l))}")
    return HttpResponse(f"demo data initialized {timezone.now()}", status=200)
