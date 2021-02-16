from webapp.core.utils.email_utils import send_mail
from webapp.invitation_system.controller import (
    register_invitation_handler,
    AbstractInvitationHandler,
    HandlerConfigKey,
)


@register_invitation_handler(
    'USER', {HandlerConfigKey.CHECK_EMAIL_OF_USER: False, HandlerConfigKey.EXPIRE_IN_DAYS: 365 * 5}
)
class UserInvitationHandler(AbstractInvitationHandler):
    def __init__(self):
        pass

    def handle_invitation(self, invitation, user_check_page):
        # send mail
        self._send_invitation_mail(invitation, user_check_page)

    def resend_invitation(self, invitation, user, user_check_page):
        # send mail again
        self._send_invitation_mail(invitation, user_check_page)

    def _send_invitation_mail(self, invitation, user_check_page):
        inviter_user = invitation.inviter_user
        inviter_user_name = self._get_user_name(inviter_user)
        context = {
            'user_check_page': user_check_page,
            'inviter_user_name': inviter_user_name,
            'invitee_email': invitation.invitee_email,
            'message': invitation.message,
        }
        email_template = 'users/email/invitation_to_register'
        send_mail(email_template, invitation.invitee_email, context)

    def get_accept_page(self, invitation):
        return f'/user-invitations/accept/{invitation.accept_token}'

    def accept_invitation(self, invitation, user, payload):
        # nothing to do here
        pass

    def cancel_invitation(self, invitation, user):
        # we have to inform the user that the previous invitation has been canceled
        self._send_canceled_info_mail(invitation, user)

    def _send_canceled_info_mail(self, invitation, cancel_user):
        send_mail(
            template_prefix='users/email/invitation_canceled',
            to=invitation.invitee_email,
            context={'cancel_user_name': self._get_user_name(cancel_user)},
        )

    def _get_user_name(self, user):
        return f'{user.first_name} {user.last_name} ({user.email})'
