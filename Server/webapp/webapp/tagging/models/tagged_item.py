import taggit.models, taggit.managers

from django.db import models

from webapp.core.models.organisation import Organisation
from webapp.tagging.models.tag import Tag


class TaggedItem(taggit.models.GenericTaggedItemBase):
    tag = models.ForeignKey(Tag, related_name='tagged_items', on_delete=models.CASCADE)
    tagger_organisation = models.ForeignKey(
        Organisation, related_name='tagged_items', on_delete=models.CASCADE
    )
