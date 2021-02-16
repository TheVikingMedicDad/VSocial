from django.contrib import admin

from webapp.invitation_system.models.invitation import Invitation


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    pass
