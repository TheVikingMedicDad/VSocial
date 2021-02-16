import csv
from tempfile import TemporaryFile

from django.contrib.auth import get_user_model

from webapp.users.serializer import UserCsvExportSerializer


def create_user_list_csv_file():
    """
    Creates a Comma Separated Value File of all Users using the UserCsvExportSerializer
    :return: A TemporaryFile object
    """
    temp_file = TemporaryFile('w+')
    csv_file = csv.DictWriter(temp_file, fieldnames=UserCsvExportSerializer.Meta.fields)
    csv_file.writeheader()
    user_serializer = UserCsvExportSerializer(get_user_model().objects.all(), many=True)
    for user in user_serializer.data:
        csv_file.writerow(user)
    return temp_file
