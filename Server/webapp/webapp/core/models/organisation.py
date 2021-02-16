from django.db import models

from webapp.core.models.base_model import BaseModel


class Organisation(BaseModel):
    name = models.CharField(max_length=200, blank=True)
    owner = models.OneToOneField(
        'users.User',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='owned_organisation',
    )

    class Meta(BaseModel.Meta):
        pass

    def is_user_organisation(self) -> bool:
        return not not self.owner

    def __str__(self):
        if self.owner:
            return f'{self.owner} owner organisation'
        else:
            return self.name
