import requests
import urllib3

from tests.user.test_user import EXAMPLE_PROFILE_PICTURE_PATH
from tests.utils import get_server_url

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

IMAGE_UPLOAD_PATH = f'{get_server_url()}/api/file-upload/process/'


def test_image_upload():
    url = IMAGE_UPLOAD_PATH
    files = {'filepond': open(EXAMPLE_PROFILE_PICTURE_PATH, 'rb')}
    r = requests.post(url, files=files, verify=False)
    assert r.status_code == 200
    assert len(r.text) == 22
