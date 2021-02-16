from abc import ABC, abstractmethod
from typing import List


class ObjPermTypeMixin:
    @classmethod
    def has_obj_permission(cls, request, operation: str, obj_id: int, path: List[str]):
        raise NotImplementedError()


class FieldPermTypeMixin:
    @classmethod
    def has_field_permission(
        cls, request, operation: str, obj: any, field_name: str, path: List[str]
    ):
        raise NotImplementedError()
