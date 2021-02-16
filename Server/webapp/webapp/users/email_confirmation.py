# code based on allauth package
from django.contrib.auth import get_user_model
from django.core import signing

User = get_user_model()


class EmailConfirmationHMAC:
    salt = 'aSlldaSDfskk201asm1ma0ckad'  # TODO: make this configurable
    expire_days = 10

    def __init__(self, email_address, user_id):
        self.email_address = email_address
        self.user_id = user_id

    @property
    def key(self):
        return signing.dumps(
            obj={'email': self.email_address, 'user_id': self.user_id}, salt=self.salt
        )

    @classmethod
    def from_key(cls, key):
        if not key:
            return
        try:
            max_age = 60 * 60 * 24 * cls.expire_days
            obj = signing.loads(key, max_age=max_age, salt=cls.salt)
            ret = EmailConfirmationHMAC(obj['email'], obj['user_id'])
        except (signing.SignatureExpired, signing.BadSignature):
            ret = None
        return ret
