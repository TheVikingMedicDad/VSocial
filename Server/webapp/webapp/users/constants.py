from enum import Enum


# NOTE: these values must be in sync with the frontends
class AuthCheckActions(Enum):
    CHANGE_PASSWORD = 'CHANGE_PASSWORD_ACTION'
    DELETE_ACCOUNT = 'DELETE_ACCOUNT'
    CHANGE_EMAIL = 'CHANGE_EMAIL'
