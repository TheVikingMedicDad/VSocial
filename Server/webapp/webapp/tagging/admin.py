from django.contrib import admin

from webapp.tagging.models.tag import Tag
from webapp.tagging.models.tagged_item import TaggedItem


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    pass


@admin.register(TaggedItem)
class TaggedItemAdmin(admin.ModelAdmin):
    pass
