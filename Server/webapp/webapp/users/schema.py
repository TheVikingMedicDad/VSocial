import logging
from datetime import timedelta

from itertools import chain

import graphene.relay
from django.utils import timezone
from graphene import Field
from graphene.relay import ClientIDMutation

from rest_framework.generics import get_object_or_404

from rest_framework.authtoken.models import Token

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.models import AnonymousUser, Permission
from django.db import IntegrityError

from webapp import gql

# 
from webapp.core.models.generated_file import GeneratedFile
from webapp.gql import from_global_id
from webapp.gql.authorization_type_mixin import FieldPermTypeMixin, ObjPermTypeMixin
from webapp.gql.errors import PermissionDeniedError
from webapp.tagging.models.tag import Tag
from webapp.tagging.schema import TagType
from webapp.core.utils.email_utils import send_need_email_confirmation
from webapp.core.utils.email_utils import send_password_reset_request
from webapp.gql.fields import OrderedDjangoFilterConnectionField, FileType
from webapp.gql.model_serializer_mutation import GqlModelSerializerMutation, InterfaceErrorType
from webapp.gql.types import CsdDjangoObjectType
from webapp.gql.utils import auth_required, custom_filter_function, query_superuser_required
from webapp.invitation_system.schema import InvitationType
from webapp.users.email_confirmation import EmailConfirmationHMAC
from webapp.users.errors import AuthErrors
from webapp.users.models import PasswordResetRequest, AuthCheck, USER_TAGS_FIELD_NAME
from webapp.users.constants import AuthCheckActions
from webapp.users.serializer import (
    CreateUserSerializer,
    UpdateUserSerializer,
    DeleteUserSerializer,
    UserAccountConfirmSerializer,
)
from webapp.users.utils import create_user_list_csv_file

User = get_user_model()
log = logging.getLogger(__name__)


class PasswordResetRequestType(CsdDjangoObjectType):
    class Meta:
        model = PasswordResetRequest
        fields = ('user', 'created', 'key')
        interfaces = (gql.Node,)
        csd_filter_fields = {}


@custom_filter_function(argument_type=graphene.String())
def name_filter(queryset, filter_value):
    where = """
    CONCAT(first_name, ' ', last_name) = %s
    """
    return queryset.extra(where=[where], params=[filter_value])


# 


class UserType(ObjPermTypeMixin, CsdDjangoObjectType):
    class Meta:
        model = User
        fields = (
            'username',
            'first_name',
            'last_name',
            'registration_completed',
            'email_verified',
            'email',
            'salutation',
            'interests',
            'language',
            'country',
            'tags',
            'owned_organisation',
            'profile_image',
        )
        # Allow for some more advanced filtering here
        csd_filter_fields = {
            'first_name': [
                'exact',
                'iexact',
                'icontains',
                'contains',
                'istartswith',
                'startswith',
                'iendswith',
                'endswith',
            ],
            'last_name': ['exact', 'icontains', 'contains', 'istartswith'],
            'email': ['exact', 'icontains', 'contains', 'istartswith'],
            'language': ['exact'],
            'name': name_filter,
            # 
        }
        interfaces = (gql.Node,)

    def resolve_groups(self, info):
        return self.groups.values_list('name', flat=True)

    def resolve_permissions(self, info):
        return list(
            set(
                chain(
                    self.user_permissions.all().values_list('codename', flat=True),
                    Permission.objects.filter(group__user=self).values_list('codename', flat=True),
                )
            )
        )

    def resolve_profile_image(self, info):
        if self.profile_image is not None and len(self.profile_image.name) > 0:
            return self.profile_image.url
        else:
            return ""

    @classmethod
    def has_obj_permission(cls, request, operation, obj_id, path):
        # 
        # TODO: no permission check, upgrade to get permission management
        return True
        # 

    groups = graphene.List(graphene.String)
    permissions = graphene.List(graphene.String)
    invitations = OrderedDjangoFilterConnectionField(InvitationType)
    last_event = graphene.String()


class ConfirmAccountInfoType(graphene.InputObjectType):
    first_name = graphene.String()
    last_name = graphene.String()
    interests = graphene.List(graphene.String)
    salutation = graphene.String()
    country = graphene.String()


class CreateUserMutation(GqlModelSerializerMutation):
    class Meta:
        serializer_class = CreateUserSerializer
        model_operations = ['create']
        lookup_field = 'id'
        exclude_fields = ('id',)
        output_field_type = UserType

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, **input):
        # make sure only superuser is allowed
        if not info.context.user.is_superuser:
            return cls(error=AuthErrors.PERMISSION_DENIED_ERROR)

        return super().mutate_and_get_payload(root, info, **input)


class UpdateUserMutation(GqlModelSerializerMutation):
    class Meta:
        serializer_class = UpdateUserSerializer
        model_operations = ['update']
        lookup_field = 'id'
        output_field_type = UserType

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, **input):
        user_id = from_global_id(input['id'])[1]

        # make sure only superuser or the user himself is allowed
        if info.context.user.pk != int(user_id) and not info.context.user.is_superuser:
            return cls(error=AuthErrors.PERMISSION_DENIED_ERROR)

        return super().mutate_and_get_payload(root, info, **input)


class UpdateMeMutation(GqlModelSerializerMutation):
    """
    Updates the current logged in user
    """

    class Meta:
        serializer_class = UpdateUserSerializer
        model_operations = ['update']
        lookup_field = 'id'
        output_field_type = UserType

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, **input):
        user_id = from_global_id(input['id'])[1]

        # make sure only superuser or the user himself is allowed
        if info.context.user.pk != int(user_id) and not info.context.user.is_superuser:
            return cls(error=AuthErrors.PERMISSION_DENIED_ERROR)

        return super().mutate_and_get_payload(root, info, **input)


class DeleteUserMutation(GqlModelSerializerMutation):
    class Meta:
        serializer_class = DeleteUserSerializer
        model_operations = ['delete']
        lookup_field = 'id'
        output_field_type = UserType

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, **input):
        user_id = from_global_id(input['id'])[1]

        # make sure only superuser or the user himself is allowed
        if info.context.user.pk != int(user_id) and not info.context.user.is_superuser:
            return cls(error=AuthErrors.PERMISSION_DENIED_ERROR)

        return super().mutate_and_get_payload(root, info, **input)


class ExportUserListMutation(ClientIDMutation):
    """
    This Mutation is generating a file that contains all registered Users
    """

    class Input:
        type = graphene.String(
            required=True, description='The type of the outputfile (currenlty supported: csv)'
        )

    error = graphene.Field(InterfaceErrorType)
    file = graphene.Field(FileType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, type, **input):

        # make sure only superuser is allowed
        if not info.context.user.is_superuser:
            return cls(error=AuthErrors.PERMISSION_DENIED_ERROR)

        # create a new instance of generatedFile
        if type not in ('csv',):
            return cls(error=AuthErrors.INVALID_API_CALL)
        generated_file = GeneratedFile(valid_until=timezone.now() + timedelta(days=1))
        generated_file.file.save('exported-user-data.csv', content=create_user_list_csv_file())
        generated_file.save()
        return cls(file=generated_file.file)


class LoginUserMutation(ClientIDMutation):
    """
    Tries to login the user
    """

    class Input:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    token = graphene.String()
    error = graphene.Field(InterfaceErrorType)
    user = graphene.Field(UserType)

    @classmethod
    def mutate_and_get_payload(cls, root, info, email, password, **input):
        user = authenticate(username=email, password=password)
        if not user:
            return cls(error=AuthErrors.INVALID_CREDENTIALS_ERROR)

        user.last_login = timezone.now()
        user.save()
        token, _ = Token.objects.get_or_create(user=user)
        return cls(token=token, user=user)


class LogoutUserMutation(ClientIDMutation):
    """
    Logging out the currently logged in User
    """

    error = graphene.Field(InterfaceErrorType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, user, **input):
        user.auth_token.delete()
        return cls()


class RegisterUserMutation(ClientIDMutation):
    """
    Registers a new user
    """

    class Input:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        language = graphene.String(required=True)

    token = graphene.String()
    error = graphene.Field(InterfaceErrorType)
    user = graphene.Field(UserType)

    @classmethod
    def mutate_and_get_payload(cls, root, info, email, password, language, **input):
        try:
            user = User.objects.create_user(
                username=email, email=email, password=password, language=language
            )
        except IntegrityError:
            return cls(error=AuthErrors.DUPLICATE_EMAIL_ERROR)

        # send confirmation mail with token
        confirmation = EmailConfirmationHMAC(user.email, user.id)
        send_need_email_confirmation(user=user, key=confirmation.key, signup=True)

        # create auth token
        token = Token.objects.create(user=user)
        return cls(token=token, user=user)


class ConfirmUserMutation(ClientIDMutation):
    """
    This Mutation is called when the User wants to confirm his/her email address
    Its hmac key is beeing validated by the Server. If the key is wrong an error returns.
    """

    class Input:
        key = graphene.String(required=True)
        confirm_account_info = ConfirmAccountInfoType(required=True)

    user = graphene.Field(UserType)
    error = graphene.Field(InterfaceErrorType)

    @classmethod
    def mutate_and_get_payload(cls, root, info, key, confirm_account_info, **input):
        confirmation = EmailConfirmationHMAC.from_key(key=key)
        if not confirmation:
            log.info(f'user wanted to confirm account with an invalid token')
            return cls(error=AuthErrors.INVALID_TOKEN_ERROR)

        user_id = confirmation.user_id

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            log.info(
                f'user with id={user_id} was not found in database but hmac was correct. something is wrong!'
            )
            return cls(error=AuthErrors.INVALID_TOKEN_ERROR)

        serializer = UserAccountConfirmSerializer(data=confirm_account_info)
        if serializer.is_valid():
            user = serializer.update(user, serializer.validated_data)
        else:
            return cls(error=AuthErrors.INVALID_USER_DATA)

        log.info(f'user {user} has confirmed his account')
        return cls(user=user)


class DeleteMeMutation(ClientIDMutation):
    """
    Deletes the current logged in user
    """

    error = graphene.Field(InterfaceErrorType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, user, **input):
        user.delete()
        return cls()


class AuthCheckMeMutation(ClientIDMutation):
    """
    Performs an authentication check (some mutations need a call of authCheckMe before they can be called)
    """

    class Input:
        current_password = graphene.String(required=True)
        action_key = graphene.String(required=True)

    error = graphene.Field(InterfaceErrorType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, user, current_password, action_key, **input):
        if not user.check_password(current_password):
            return cls(error=AuthErrors.INVALID_CREDENTIALS_ERROR)

        auth_check = AuthCheck(user=user, action_key=action_key)
        auth_check.save()
        return cls()


class UserEmailChangeRequestMutation(graphene.relay.ClientIDMutation):
    """

    Creates an E-Mail change request for changing the email address of the currently logged in
    user. Is sending an email to tne provided newEmail for email verification.

    """

    class Input:
        new_email = graphene.String(required=True)

    error = graphene.Field(InterfaceErrorType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, new_email, **input):
        request = info.context
        if not AuthCheck.is_authorized(user=request.user, action_key=AuthCheckActions.CHANGE_EMAIL):
            log.info(f'user is not authorized')
            return cls(error=AuthErrors.PERMISSION_DENIED_ERROR)
        current_email = request.user.email
        user_id = request.user.id
        if current_email == new_email:
            log.info(f'user wanted to change email to {new_email}, but he already has this email')
            return cls(error=AuthErrors.DUPLICATE_EMAIL_ERROR)
        # 
        confirmation = EmailConfirmationHMAC(new_email, user_id)
        send_need_email_confirmation(user=request.user, key=confirmation.key, to=new_email)
        return cls()


class UserConfirmEmailMutation(graphene.relay.ClientIDMutation):
    """

    tries to change mail address of user according to the key of confirmation email

    """

    class Input:
        key = graphene.String(required=True)

    error = graphene.Field(InterfaceErrorType)

    @classmethod
    def mutate_and_get_payload(cls, root, info, key, **input):

        confirmation = EmailConfirmationHMAC.from_key(key=key)
        if not confirmation:
            log.info(f'user wanted to confirm an email with an invalid token')
            return cls(error=AuthErrors.INVALID_TOKEN_ERROR)
        email = confirmation.email_address
        user_id = confirmation.user_id
        user = get_object_or_404(User, pk=user_id)
        user.email = email
        user.email_verified = True

        try:
            user.save()
        except IntegrityError as e:
            log.info(f'user {user} wanted to confirm an email which already exists')
            return cls(error=AuthErrors.DUPLICATE_EMAIL_ERROR)
        # 
        log.info(f'user {user} has confirmed his email')
        return cls()


class UserResentSignupEmailConfirmRequest(graphene.relay.ClientIDMutation):
    """

    resends the user confirmation email

    """

    error = graphene.Field(InterfaceErrorType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, **input):
        request = info.context
        confirmation = EmailConfirmationHMAC(request.user.email, request.user.id)
        send_need_email_confirmation(user=request.user, key=confirmation.key, signup=True)
        return cls()


class RequestPasswordResetMutation(graphene.relay.ClientIDMutation):
    """

    Requests a password reset via email

    """

    # get user from email
    class Input:
        email = graphene.String(required=True)

    error = graphene.Field(InterfaceErrorType)
    user = graphene.Field(UserType)

    @classmethod
    def mutate_and_get_payload(cls, root, info, email, **input):
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            log.info(f'user wanted to request a password reset with an invalid email {email}')
            return cls(error=AuthErrors.INVALID_EMAIL_ERROR)

        reset_request = PasswordResetRequest(user=user)
        reset_request.save()

        # send email with reset url
        send_password_reset_request(user, reset_request.key)

        return cls()


class ResetPasswordMutation(graphene.relay.ClientIDMutation):
    """

    Resets the password with the token from the password reset request

    """

    class Input:
        reset_token = graphene.String(required=True)
        new_password = graphene.String(required=True)

    error = graphene.Field(InterfaceErrorType)
    user = graphene.Field(UserType)

    @classmethod
    def mutate_and_get_payload(cls, root, info, reset_token, new_password, **input):
        try:
            reset_request = PasswordResetRequest.objects.get(key=reset_token)
        except PasswordResetRequest.DoesNotExist:
            log.info(f'user wanted to reset password with an invalid token {reset_token}')
            return cls(error=AuthErrors.INVALID_TOKEN_ERROR)
        user = reset_request.user
        user.set_password(new_password)
        user.save()
        reset_request.delete()

        return cls(user=user)


class ChangePasswordMutation(graphene.relay.ClientIDMutation):
    """

    Tries to change the password of the user

    """

    class Input:
        new_password = graphene.String(required=True)

    error = graphene.Field(InterfaceErrorType)
    user = graphene.Field(UserType)

    @classmethod
    @auth_required
    def mutate_and_get_payload(cls, root, info, new_password, **input):
        request = info.context
        user = request.user

        if not AuthCheck.is_authorized(user=user, action_key=AuthCheckActions.CHANGE_PASSWORD):
            return cls(error=AuthErrors.PERMISSION_DENIED_ERROR)

        user.set_password(new_password)
        user.save()

        return cls(user=user)


class Query(object):
    user = gql.Node.Field(UserType)
    me = Field(UserType)
    all_users = OrderedDjangoFilterConnectionField(UserType)
    password_reset_request = gql.Node.Field(PasswordResetRequestType)
    all_password_reset_requests = OrderedDjangoFilterConnectionField(PasswordResetRequestType)
    all_user_tags = OrderedDjangoFilterConnectionField(TagType)

    def resolve_me(self, info):
        """
        Returns the User who is logged in when querying `me`
        """
        if isinstance(info.context.user, AnonymousUser):
            return None
        return info.context.user

    def resolve_all_user_tags(self, info, **kwargs):
        return Tag.objects.filter(field_name=USER_TAGS_FIELD_NAME).all()

    @query_superuser_required
    def resolve_all_users(self, info, **kwargs):
        return User.objects.all()

    @query_superuser_required
    def resolve_all_user_tags(self, info, **kwargs):
        return Tag.objects.all()

    @query_superuser_required
    def all_password_reset_requests(self, info, **kwargs):
        return PasswordResetRequest.objects.all()


class Mutations(object):
    createUser = CreateUserMutation.Field()
    updateUser = UpdateUserMutation.Field()
    deleteUser = DeleteUserMutation.Field()
    exportUserList = ExportUserListMutation.Field()
    emailRequest = UserEmailChangeRequestMutation.Field()
    confirmEmail = UserConfirmEmailMutation.Field()
    resentSignupEmail = UserResentSignupEmailConfirmRequest.Field()
    loginUser = LoginUserMutation.Field()
    logoutUser = LogoutUserMutation.Field()
    registerUser = RegisterUserMutation.Field()
    confirmUser = ConfirmUserMutation.Field()
    updateMe = UpdateMeMutation.Field()
    deleteMe = DeleteMeMutation.Field()
    authCheckMe = AuthCheckMeMutation.Field()
    requestPasswordReset = RequestPasswordResetMutation.Field()
    resetPassword = ResetPasswordMutation.Field()
    changePassword = ChangePasswordMutation.Field()
