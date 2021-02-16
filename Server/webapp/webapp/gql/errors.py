class InterfaceError(Exception):
    pass


class GqlError(Exception):
    def __init__(self, id=None, message=None, data=None, from_error=None):
        from webapp.gql.utils import camel_to_underscore

        create_id = (
            lambda cls_name: id if id is not None else camel_to_underscore(cls_name)[1:].upper()
        )

        if from_error:
            id = create_id(type(from_error).__name__)
            message = str(from_error)

        self.id = create_id(type(self).__name__)
        self.message = message
        self.data = str(data) if data is not None else None


class InvalidIdFieldError(GqlError):
    pass


class UserNotFoundError(GqlError):
    pass


class TemporaryUploadIdNotFoundError(GqlError):
    pass


class GqlIntegrityError(GqlError):
    pass


class PermissionDeniedError(GqlError):
    pass


class FilterNotExisting(Exception):
    pass
