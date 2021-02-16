from django.conf import settings
from django.db import models
from django.forms import Select
from wagtail.admin.edit_handlers import FieldPanel
from wagtail.core.fields import RichTextField
from wagtail.snippets.models import register_snippet


@register_snippet
class Footer(models.Model):
    column_1 = RichTextField()
    column_2 = RichTextField()
    column_3 = RichTextField()
    copyright_info = models.TextField(blank=True)
    language_code = models.TextField(max_length=6, choices=settings.LANGUAGES)

    panels = [
        FieldPanel('language_code', widget=Select),
        FieldPanel('column_1'),
        FieldPanel('column_2'),
        FieldPanel('column_3'),
        FieldPanel('copyright_info'),
    ]

    def __str__(self):
        return f'{self.language_code}'
