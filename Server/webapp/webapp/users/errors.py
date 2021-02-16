from django.db import InterfaceError
from webapp.gql.model_serializer_mutation import InterfaceErrorType


class InvalidEmailError(InterfaceError):
    pass


class InvalidTokenError(InterfaceError):
    pass


class PermissionDeniedError(InterfaceError):
    pass


class AuthErrors:
    DUPLICATE_EMAIL_ERROR = InterfaceErrorType(
        'DUPLICATE_EMAIL_ERROR', message='User with this email already exists'
    )
    INVALID_EMAIL_ERROR = InterfaceErrorType('INVALID_EMAIL_ERROR', message='Email does not exist')
    INVALID_CREDENTIALS_ERROR = InterfaceErrorType(
        'INVALID_CREDENTIALS_ERROR', message='Invalid credentials'
    )
    INVALID_API_CALL = InterfaceErrorType('INVALID_API_CALL', message='')
    INVALID_TOKEN_ERROR = InterfaceErrorType('INVALID_TOKEN_ERROR', message='Token is invalid')
    INVALID_USER_DATA = InterfaceErrorType('INVALID_USER_DATA', message='Invalid user data')
    NOT_AUTHENTICATED_ERROR = InterfaceErrorType(
        id='NOT_AUTHENTICATED_ERROR', message='not authenticated'
    )
    PERMISSION_DENIED_ERROR = InterfaceErrorType(
        id='PERMISSION_DENIED_ERROR', message='user does not have the permissions for this action'
    )
