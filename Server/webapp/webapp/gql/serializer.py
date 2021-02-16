from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import empty

from webapp.gql.errors import InvalidIdFieldError


class GraphQLIdField(serializers.CharField):
    def __init__(self, **kwargs):
        self.model_type = kwargs.pop('model_type', None)
        super().__init__(**kwargs)

    def run_validation(self, data=empty):
        if data != empty:
            value = data.split(':')
            if len(value) != 2:
                raise InvalidIdFieldError(message='format must be Type:ID')
            try:
                id_val = int(value[1])
            except ValueError:
                raise InvalidIdFieldError(message=f'{value[1]} is not an integer number')
            if self.model_type and value[0] != self.model_type:
                raise InvalidIdFieldError(message=f'id must be of type {self.model_type}')
            return id_val
        else:
            if self.required:
                raise ValidationError('Field is required')
        return None
