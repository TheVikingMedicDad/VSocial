# Register your models here.
from django.contrib import admin

from webapp.core.models.organisation import Organisation


@admin.register(Organisation)
class OrganisationAdmin(admin.ModelAdmin):
    pass
