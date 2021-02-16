import graphene
from django.contrib.auth import get_user_model
from graphene import ClientIDMutation
from graphene.utils.str_converters import to_camel_case
from graphene_django import DjangoObjectType

from webapp import gql
from webapp.gql import from_global_id
from webapp.gql.model_serializer_mutation import InterfaceErrorType
from webapp.gql.types import CsdDjangoObjectType
from webapp.gql.utils import (
    auth_required,
    convert_dict_underscore_to_camel,
    convert_dict_camel_to_underscore,
)
from webapp.invitation_system.controller import InvitationSystemFacade
from webapp.invitation_system.models.invitation import Invitation


def queried_by_token(resolver_func):
    def __wrapper_func(invitation, info):
        if not hasattr(info.context, 'checked_invitation'):
            attr = to_camel_case(resolver_func.__name__.strip("resolve_"))
            raise Exception(f'You have to query via the token to resolve {attr}')
        return resolver_func(invitation, info, info.context.checked_invitation)

    return __wrapper_func


class InvitationType(CsdDjangoObjectType):
    class Meta:
        model = Invitation
        fields = (
            'id',
            'expires',
            'created',
            'updated',
            'state',
            'invitation_type',
            'message',
            'invitee_email',
        )
        interfaces = (gql.Node,)
        csd_filter_fields = {'state': ['exact', 'in']}

    is_valid = graphene.Boolean()
    invalid_reason = graphene.String()
    accept_page = graphene.String()
    payload = graphene.JSONString()

    def resolve_payload(self, info):
        return convert_dict_underscore_to_camel(self.encoded_payload)

    @queried_by_token
    def resolve_is_valid(self, info, checked_invitation):
        return checked_invitation['is_valid']

    @queried_by_token
    def resolve_invalid_reason(self, info, checked_invitation):
        if checked_invitation['is_valid']:
            return None
        return checked_invitation['error']

    @queried_by_token
    def resolve_accept_page(self, info, checked_invitation):
        if not checked_invitation['is_valid']:
            return None
        return checked_invitation['accept_page']


class InvitationInfoType(graphene.ObjectType):
    class Input:
        token = graphene.UUID(required=True)

    invitation = graphene.Field(InvitationType)


class CreateInvitationMutation(ClientIDMutation):
    class Input:
        invitation_type = graphene.String(required=True)
        invitee_user_id = graphene.String(required=False)
        invitee_email = graphene.String(required=True)
        message = graphene.String(required=False)
        payload = graphene.JSONString(required=False)

    error = graphene.Field(InterfaceErrorType)
    invitation = graphene.Field(InvitationType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, user, invitation_type, invitee_email, **kwargs):
        payload = convert_dict_camel_to_underscore(kwargs.pop('payload', {}))
        message = kwargs.pop('message', '')
        invitee_user_id = kwargs.pop('invitee_user_id', None)
        if invitee_user_id:
            invitee_user = get_user_model().objects.get(id=invitee_user_id)
        else:
            invitee_user = None
        try:
            invitation = InvitationSystemFacade.create_invitation(
                invitation_type, user, invitee_email, invitee_user, message, payload
            )
        except Exception as e:
            return cls(error=InterfaceErrorType.from_exception(e))
        return cls(invitation=invitation)


class ResendInvitationMutation(ClientIDMutation):
    class Input:
        id = graphene.GlobalID(required=True)

    error = graphene.Field(InterfaceErrorType)
    invitation = graphene.Field(InvitationType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, user, id, **kwargs):
        _, lookup_id = from_global_id(id)
        try:
            invitation = Invitation.objects.get(id=lookup_id)
        except Invitation.DoesNotExist as e:
            return cls(error=InterfaceErrorType.from_exception(e))

        checked = InvitationSystemFacade.check_invitation(invitation, user)
        if not checked['is_valid']:
            return cls(error=InterfaceErrorType(id='INVITATION_NOT_VALID', data=checked['error']))

        InvitationSystemFacade.resend_invitation(invitation, user)
        return cls(invitation=invitation)


class AcceptInvitationMutation(ClientIDMutation):
    class Input:
        accept_token = graphene.String(required=True)
        payload = graphene.JSONString(required=False)

    error = graphene.Field(InterfaceErrorType)
    invitation = graphene.Field(InvitationType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, user, accept_token, **kwargs):
        try:
            invitation = Invitation.objects.get(accept_token=accept_token)
        except Invitation.DoesNotExist as e:
            return cls(error=InterfaceErrorType.from_exception(e))

        checked = InvitationSystemFacade.check_invitation(invitation, user)
        if not checked['is_valid']:
            return cls(error=InterfaceErrorType(id='INVITATION_NOT_VALID', data=checked['error']))
        payload = convert_dict_camel_to_underscore(kwargs.get('payload', {}))
        InvitationSystemFacade.accept_invitation(invitation, user, payload)
        return cls(invitation=invitation)


class CancelInvitationMutation(ClientIDMutation):
    class Input:
        id = graphene.GlobalID(required=True)

    error = graphene.Field(InterfaceErrorType)
    invitation = graphene.Field(InvitationType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, user, id, **kwargs):
        _, lookup_id = from_global_id(id)
        try:
            invitation = Invitation.objects.get(id=lookup_id)
        except Invitation.DoesNotExist as e:
            return cls(error=InterfaceErrorType.from_exception(e))
        InvitationSystemFacade.cancel_invitation(invitation, user)
        return cls(invitation=invitation)


class RejectInvitationMutation(ClientIDMutation):
    class Input:
        id = graphene.GlobalID(required=True)

    error = graphene.Field(InterfaceErrorType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, user, id, **kwargs):
        _, lookup_id = from_global_id(id)
        try:
            invitation = Invitation.objects.get(id=lookup_id)
        except Invitation.DoesNotExist as e:
            return cls(error=InterfaceErrorType.from_exception(e))
        checked = InvitationSystemFacade.check_invitation(invitation, user)
        if not checked['is_valid']:
            return cls(error=InterfaceErrorType(id='INVITATION_NOT_VALID', data=checked['error']))
        InvitationSystemFacade.reject_invitation(invitation, user)
        return cls()


class Query(object):
    invitation = graphene.Field(
        InvitationType, id=graphene.ID(required=False), token=graphene.String(required=False)
    )

    def resolve_invitation(self, info, **kwargs):
        if ('id' in kwargs and 'token' in kwargs) or ('id' not in kwargs and 'token' not in kwargs):
            raise Exception(
                'One of each inputs are required: id or token (both at the same time is not valid also)'
            )

        try:
            if 'id' in kwargs:
                _, lookup_id = from_global_id(kwargs['id'])
                invitation = Invitation.objects.get(id=lookup_id)
            else:
                invitation = Invitation.objects.get(accept_token=kwargs['token'])
                info.context.checked_invitation = InvitationSystemFacade.check_invitation(
                    invitation, info.context.user
                )
        except Invitation.DoesNotExist:
            return None

        return invitation


class Mutations(object):
    createInvitation = CreateInvitationMutation.Field()
    acceptInvitation = AcceptInvitationMutation.Field()
    cancelInvitation = CancelInvitationMutation.Field()
    rejectInvitation = RejectInvitationMutation.Field()
    resendInvitation = ResendInvitationMutation.Field()
