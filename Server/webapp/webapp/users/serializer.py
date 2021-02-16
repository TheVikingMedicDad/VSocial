import logging

from itertools import chain

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.files.base import ContentFile
from rest_framework import serializers

from webapp.core.serializer import TemporaryUploadIdField
from webapp.file_upload.models import TemporaryUpload
from webapp.gql.errors import PermissionDeniedError
from webapp.tagging.serializer import NestedTagSerializer
from webapp.users.models import PasswordResetRequest

User = get_user_model()
log = logging.getLogger(__name__)


class PasswordResetRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordResetRequest
        fields = ('key', 'created')  # 'user')


class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'date_joined',
            'registration_completed',
            'email_verified',
            'salutation',
            'interests',
            'language',
            'permissions',
            'groups',
            'country',
            'profile_image',
        )
        read_only_fields = (
            'id',
            'email',
            'email_verified',
            'date_joined',
            'permissions',
            'groups',
            'profile_image',
        )

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    def get_permissions(self, obj):
        return list(
            set(
                chain(
                    obj.user_permissions.all().values_list('codename', flat=True),
                    Permission.objects.filter(group__user=obj).values_list('codename', flat=True),
                )
            )
        )

    def get_groups(self, obj):
        return obj.groups.values_list('name', flat=True)


class UserCsvExportSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'salutation',
            'first_name',
            'last_name',
            'date_joined',
            'registration_completed',
            'email_verified',
            'interests',
            'language',
            'country',
            'groups',
        )

    def to_representation(self, obj):
        data_dict = super().to_representation(obj)
        data_dict['interests'] = ','.join(data_dict['interests'])
        data_dict['groups'] = ','.join(str(group) for group in obj.groups.all())
        return data_dict


class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = (
            'email',
            'first_name',
            'last_name',
            'salutation',
            'interests',
            'profile_image_temporary_id',
            'country',
            'tags',
        )

    tags = NestedTagSerializer(many=True, required=False)
    profile_image_temporary_id = serializers.CharField(
        allow_blank=True, required=False, max_length=40
    )

    def save(self, **kwargs):
        tags = self.validated_data.pop('tags', None)
        user = self.context['request'].user
        image_upload_object = None
        if 'profile_image_temporary_id' in self.validated_data:
            temporary_id = self.validated_data.pop('profile_image_temporary_id')
            try:
                image_upload_object = TemporaryUpload.objects.get(upload_id=temporary_id)
            except TemporaryUpload.DoesNotExist:
                raise ValueError(f'profile_image_temparary_id {temporary_id} not found')
        user_object = get_user_model()(**self.validated_data)
        if image_upload_object:
            user_object.profile_image.save(
                image_upload_object.upload_name, ContentFile(image_upload_object.file.read())
            )
            image_upload_object.delete()
        user_object.save()
        if tags:
            NestedTagSerializer.apply_tags_to_tag_manager(
                tag_manager=user_object.tags,
                tagger_organisation=user.selected_organisation,
                validated_data=tags,
            )
        return user_object


class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'salutation',
            'interests',
            'language',
            'country',
            'profile_image_temporary_id',
            'tags',
        )

    tags = NestedTagSerializer(many=True, required=False)
    interests = serializers.ListField(
        child=serializers.CharField(), required=False, allow_empty=True
    )
    profile_image_temporary_id = TemporaryUploadIdField(required=False)

    def update(self, instance: User, validated_data: dict) -> User:
        user = self.context['request'].user
        profile_image_tmp = validated_data.pop('profile_image_temporary_id', None)
        tags = validated_data.pop('tags', None)
        if tags:
            NestedTagSerializer.apply_tags_to_tag_manager(
                tag_manager=instance.tags,
                tagger_organisation=user.selected_organisation,
                validated_data=tags,
            )
        if profile_image_tmp:
            instance.profile_image.save(
                profile_image_tmp.upload_name, ContentFile(profile_image_tmp.file.read())
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class UserAccountConfirmSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'salutation', 'interests', 'country')

    interests = serializers.ListField(
        child=serializers.CharField(), required=False, allow_empty=True
    )


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password', 'language')


class UserLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password')


class DeleteUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id',)
