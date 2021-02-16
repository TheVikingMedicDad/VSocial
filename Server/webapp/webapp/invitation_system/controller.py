import json
import logging
from abc import ABC, abstractmethod
from collections import namedtuple
from enum import Enum

from django.utils import timezone

from webapp.invitation_system.errors import (
    HandlerAlreadyRegisteredError,
    NoHandlerForInvitationTypeError,
    InviteSelfNotPossibleError,
    InvitationNotPendingError,
)
from webapp.invitation_system.models.invitation import Invitation, days_from_now

log = logging.getLogger(__name__)


class HandlerConfigKey(Enum):
    CHECK_EMAIL_OF_USER = 'check_email_of_user'
    EXPIRE_IN_DAYS = 'expire_in_days'


def register_invitation_handler(invitation_type, handler_config={}):
    """
    Usage:

    @register_invitation_handler('INVITATION_TYPE')
    class InvitationHandler(AbstractInvitationHandler):
        pass
    """

    def __handler_cls_wrapper(handler_cls):
        InvitationSystemDispatcher.register_invitation_handler(
            handler_cls, invitation_type, handler_config
        )
        return handler_cls

    return __handler_cls_wrapper


class InvitationSystemFacade:
    """
    This facade class offers some public static method which can be used by the API
    """

    @classmethod
    def create_invitation(
        cls, invitation_type, inviter_user, invitee_email, invitee_user, message, encoded_payload
    ):
        """
        Creates an invitation by calling the specific InvitationHandler

        :return: An Invitation model object with state PENDING
        """
        dispatcher = InvitationSystemDispatcher(invitation_type)
        handler_config = dispatcher.get_handler_config()

        if invitee_email == inviter_user.email:
            raise InviteSelfNotPossibleError()

        # create an invitation
        from webapp.invitation_system.models.invitation import Invitation

        invitation = Invitation(
            invitation_type=invitation_type,
            inviter_user=inviter_user,
            invitee_user=invitee_user,
            invitee_email=invitee_email,
            message=message,
            payload=json.dumps(encoded_payload),
        )
        expire_in_days = handler_config.get(HandlerConfigKey.EXPIRE_IN_DAYS, None)
        if expire_in_days:
            invitation.expires = days_from_now(expire_in_days)
        invitation.save()

        # dispatch the invitation to the handler
        dispatcher.call_handle_invitation(
            invitation, cls._get_user_check_page(invitation.accept_token)
        )
        return invitation

    @classmethod
    def resend_invitation(cls, invitation, user):
        dispatcher = InvitationSystemDispatcher(invitation.invitation_type)
        dispatcher.call_resend_invitation(
            invitation, user, cls._get_user_check_page(invitation.accept_token)
        )
        invitation.save()

    @staticmethod
    def accept_invitation(invitation, user, payload):
        dispatcher = InvitationSystemDispatcher(invitation.invitation_type)
        dispatcher.call_accept_invitation(invitation, user, payload)
        invitation.invitee_user = user
        invitation.state = Invitation.STATE.ACCEPTED
        invitation.save()

    @staticmethod
    def cancel_invitation(invitation, user):
        if invitation.state != Invitation.STATE.PENDING:
            raise InvitationNotPendingError()

        dispatcher = InvitationSystemDispatcher(invitation.invitation_type)
        dispatcher.call_cancel_invitation(invitation, user)
        invitation.state = Invitation.STATE.CANCELED
        invitation.save()

    @staticmethod
    def reject_invitation(invitation, user):
        dispatcher = InvitationSystemDispatcher(invitation.invitation_type)
        dispatcher.call_reject_invitation(invitation, user)
        invitation.state = Invitation.STATE.REJECTED
        invitation.save()

    @staticmethod
    def check_invitation(invitation, user):
        """
        This method checks if the given user is allowed to `accept` the given invitation.

        It is returning:
        {
            is_valid: True/False
            accept_page: a link that can be shown to the user to accept the invitation (always None if is_valid is False)
            error
        }
        """
        dispatcher = InvitationSystemDispatcher(invitation.invitation_type)
        refuse = lambda error: {'is_valid': False, 'error': error}

        # check if state is PENDING
        if invitation.state != Invitation.STATE.PENDING:
            return refuse(invitation.state)

        # check if it's already expired
        if timezone.now() > invitation.expires:
            return refuse('EXPIRED')

        # check the inviteeEmail (if we have to)
        config = dispatcher.get_handler_config()
        if config.get(HandlerConfigKey.CHECK_EMAIL_OF_USER, False):
            if user.email != invitation.invitee_email:
                return refuse('WRONG_EMAIL')

        # ok, everything fine, retrieve the accept_page by the handler
        return {'is_valid': True, 'accept_page': dispatcher.call_get_accept_page(invitation)}

    @staticmethod
    def _get_user_check_page(token):
        """
        This method is called to give the underlying handler it's returning value when creating the invitation
        :param token:
        :return:
        """
        # TODO: get this link from environment a global setting or something
        return f'invitation/check/{token}'


class InvitationSystemDispatcher:
    _handler_registry = {}
    HandlerEntry = namedtuple('HandlerEntry', ['cls', 'config'])

    @classmethod
    def register_invitation_handler(cls, invitation_handler_cls, invitation_type, handler_config):
        if invitation_type in InvitationSystemDispatcher._handler_registry:
            raise HandlerAlreadyRegisteredError()
        InvitationSystemDispatcher._handler_registry[
            invitation_type
        ] = InvitationSystemDispatcher.HandlerEntry(
            cls=invitation_handler_cls, config=handler_config
        )
        log.debug(f'InvitationHandler of type {invitation_type} registered')

    @classmethod
    def _get_invitation_handler_entry(cls, invitation_type):
        handler_entry = InvitationSystemDispatcher._handler_registry.get(invitation_type, None)
        if not handler_entry:
            raise NoHandlerForInvitationTypeError(invitation_type)
        return handler_entry

    def __init__(self, invitation_type):
        handler_entry = InvitationSystemDispatcher._get_invitation_handler_entry(invitation_type)
        # get the config:
        self._handler_config = handler_entry.config
        # initiate an object of the handler
        self._handler_obj = handler_entry.cls()

    def get_handler_config(self):
        return self._handler_config

    def call_handle_invitation(self, invitation, user_check_page):
        return self._handler_obj.handle_invitation(invitation, user_check_page)

    def call_get_accept_page(self, invitation):
        return self._handler_obj.get_accept_page(invitation)

    def call_accept_invitation(self, invitation, user, payload):
        return self._handler_obj.accept_invitation(invitation, user, payload)

    def call_cancel_invitation(self, invitation, user):
        return self._handler_obj.cancel_invitation(invitation, user)

    def call_reject_invitation(self, invitation, user):
        return self._handler_obj.reject_invitation(invitation, user)

    def call_resend_invitation(self, invitation, user, user_check_page):
        return self._handler_obj.resend_invitation(invitation, user, user_check_page)


class AbstractInvitationHandler(ABC):
    @abstractmethod
    def handle_invitation(self, invitation, user_check_page):
        pass

    @abstractmethod
    def get_accept_page(self, invitation):
        pass

    @abstractmethod
    def accept_invitation(self, invitation, user, payload):
        pass

    @abstractmethod
    def resend_invitation(self, invitation, user, user_check_page):
        """
        must not be implemented by handler if no feature code is needed
        """

    def cancel_invitation(self, invitation, user):
        """
        must not be implemented by handler if no feature code is needed
        """
        pass

    def reject_invitation(self, invitation, user):
        """
        must not be implemented by handler if no feature code is needed
        """
        pass
