from django.db import models

from webapp.core.models.base_model import BaseModel


class Todo(BaseModel):
    is_done = models.BooleanField(default=False)
    text = models.CharField(max_length=200, blank=False, null=False)
    created_by = models.ForeignKey(
        'core.Organisation', on_delete=models.CASCADE, blank=False, null=False, related_name='todos'
    )

    class Meta(BaseModel.Meta):
        verbose_name = 'Todo'
        verbose_name_plural = 'Todos'
        ordering = ['id']

    def __str__(self):
        return f'{self.text} ({self.id})'
