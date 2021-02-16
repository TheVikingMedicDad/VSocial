import taggit.models
import taggit.managers

from django.db import models


def raise_error_on_empty():
    raise Exception('field_name must not be empty')


class Tag(taggit.models.TagBase):
    name = models.CharField(blank=False, max_length=100)
    field_name = models.CharField(blank=False, max_length=100, default=raise_error_on_empty)

    @property
    def is_predefined(self) -> bool:
        return False

    class Meta:
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        unique_together = (("name", "field_name"),)
        app_label = 'tagging'
