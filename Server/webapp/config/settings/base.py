"""
Base settings to build other settings files upon.
"""
import os
from datetime import datetime

import environ
import markdown

from webapp.core.utils.common import clean_url

ROOT_DIR = environ.Path(__file__) - 3  # (webapp/config/settings/base.py - 3 = webapp/)
APPS_DIR = ROOT_DIR.path('webapp')

BASE_DIR = str(ROOT_DIR)

env = environ.Env()

READ_DOT_ENV_FILE = env.bool('DJANGO_READ_DOT_ENV_FILE', default=False)
if READ_DOT_ENV_FILE:
    # OS environment variables take precedence over variables from .env
    env.read_env(str(ROOT_DIR.path('.env')))

from django.utils.translation import ugettext_lazy as _

CSD_MAIN_VERSION = env.str('CSD_MAIN_VERSION')
CSD_PROJECT_VERSION = env.str('CSD_PROJECT_VERSION')
BUILD_TIME = datetime.now()

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = env.bool('CSD_WEBAPP_SERVER_WEBAPP_DJANGO_DEBUG', default=False)
# Local time zone. Choices are
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# though not all of them may be available with every OS.
# In Windows, this must be set to your system time zone.
TIME_ZONE = 'UTC'
# https://docs.djangoproject.com/en/dev/ref/settings/#language-code
LANGUAGE_CODE = 'en-us'
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
SECRET_KEY = env('CSD_WEBAPP_SERVER_SECRET_KEY')

LOCALE_PATHS = (str(ROOT_DIR.path('locale')),)

LANGUAGES = [('en', _('English')), ('de', _('German'))]

# https://docs.djangoproject.com/en/dev/ref/settings/#site-id
SITE_ID = 1
# https://docs.djangoproject.com/en/dev/ref/settings/#use-i18n
USE_I18N = True
# https://docs.djangoproject.com/en/dev/ref/settings/#use-l10n
USE_L10N = True
# https://docs.djangoproject.com/en/dev/ref/settings/#use-tz
USE_TZ = True

# DATABASES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#databases
DATABASES = {'default': env.db('CSD_WEBAPP_SERVER_DATABASE_URL')}
DATABASES['default']['ATOMIC_REQUESTS'] = True

# CACHES
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('CSD_WEBAPP_SERVER_REDIS_URL'),
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
    },
    'redis': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('CSD_WEBAPP_SERVER_REDIS_URL'),
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
    },
}

# URLS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#root-urlconf
ROOT_URLCONF = 'config.urls'
# https://docs.djangoproject.com/en/dev/ref/settings/#wsgi-application
WSGI_APPLICATION = 'config.wsgi.application'

# APPS
# ------------------------------------------------------------------------------
DJANGO_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 'django.contrib.humanize', # Handy template tags
    'django.contrib.admin',
]
THIRD_PARTY_APPS = [
    'wagtail.contrib.forms',
    'wagtail.contrib.redirects',
    'wagtail.embeds',
    'wagtail.sites',
    'wagtail.users',
    'wagtail.snippets',
    'wagtail.documents',
    'wagtail.images',
    'wagtail.search',
    'wagtail.admin',
    'wagtail.core',
    'wagtail.contrib.modeladmin',  # needed for wagtailtrans & wagtailmenus
    'wagtailtrans',
    'wagtailmenus',
    'taggit',
    'crispy_forms',
    'rest_framework',
    'rest_framework.authtoken',
    'graphene_django',
    'parler',
    'django_extensions',
    'webpack_loader',
    'dbbackup',
]
LOCAL_APPS = [
    'webapp.users.apps.UsersAppConfig',
    # Your stuff: custom apps go here
    'webapp.core.apps.CoreAppConfig',
    'webapp.gql.apps.GqlAppConfig',
    'webapp.invitation_system.apps.InvitationSystemAppConfig',
    # 
    'webapp.tagging.apps.TaggingConfig',
    # 
    'webapp.todo.apps.TodoConfig',
    # 
    'webapp.file_upload.apps.FileUploadConfig',
    'webapp.website.apps.WebsiteConfig',
]
# https://docs.djangoproject.com/en/dev/ref/settings/#installed-apps
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

PARLER_ENABLE_CACHING = False
PARLER_DEFAULT_LANGUAGE_CODE = 'en'

# TODO: dry: languages should be the same as LANGUAGES
# may set PARLER_SHOW_EXCLUDED_LANGUAGE_TABS = True instead
PARLER_LANGUAGES = {
    SITE_ID: ({'code': 'en'}, {'code': 'de'}),
    'default': {
        'fallback': 'en',  # defaults to PARLER_DEFAULT_LANGUAGE_CODE
        'hide_untranslated': False,
        # the default; let .active_translations()       return fallbacks too.
    },
}

# MIGRATIONS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#migration-modules
MIGRATION_MODULES = {'sites': 'webapp.contrib.sites.migrations'}

# AUTHENTICATION
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#authentication-backends
AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']
# https://docs.djangoproject.com/en/dev/ref/settings/#auth-user-model
AUTH_USER_MODEL = 'users.User'
# https://docs.djangoproject.com/en/dev/ref/settings/#login-redirect-url
LOGIN_REDIRECT_URL = 'users:redirect'
# https://docs.djangoproject.com/en/dev/ref/settings/#login-url
LOGIN_URL = 'account_login'

# PASSWORDS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#password-hashers
PASSWORD_HASHERS = [
    # https://docs.djangoproject.com/en/dev/topics/auth/passwords/#using-argon2-with-django
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    'django.contrib.auth.hashers.BCryptPasswordHasher',
]
# https://docs.djangoproject.com/en/dev/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# MIDDLEWARE
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#middleware
MIDDLEWARE = [
    'webapp.core.middleware.reverse_proxy_middleware.ReverseProxyMiddleware',
    'webapp.core.middleware.api_csrf_middleware.ApiCsrfMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'webapp.core.middleware.model_language_middleware.ModelLanguageMiddleware',
    # TODO: this interferes with ModelLanguageMiddleware middleware, we need to inherit and
    #  customize TranslationMiddleware so that it is only applied on the website or at least
    #  excluded on the /api. #CSD
    # 'wagtailtrans.middleware.TranslationMiddleware',
    'wagtail.contrib.redirects.middleware.RedirectMiddleware',
]

if DEBUG:
    # When Testing we use hot-swaps of postgres database, therefore we need to cut all connection from the database
    # Other processes/connections to postgres doesn't recognize the connection loose
    # therefore we introduce a middleware which tests the postgres connection before each request:
    # see also https://code.djangoproject.com/ticket/15802
    # we don't need this in production since we don't do stuff like hot-swapping and the below
    # middleware is time-intensive!
    MIDDLEWARE.insert(
        0, 'webapp.core.middleware.close_broken_db_middleware.CloseBrokenDbMiddleware'
    )

# STORAGES
# ------------------------------------------------------------------------------


AWS_ACCESS_KEY_ID = env('CSD_AWS_S3_KEY')
AWS_SECRET_ACCESS_KEY = env('CSD_AWS_S3_SECRET')
AWS_STORAGE_BUCKET_NAME = env('CSD_AWS_S3_STORAGE_BUCKET_NAME')
AWS_S3_ENDPOINT_URL = env('CSD_AWS_S3_ENDPOINT_URL')
AWS_DEFAULT_ACL = 'public-read'

# this is evtl not necessary as we set the static_url and media_url
# AWS_S3_CUSTOM_DOMAIN = (
#     env('CSD_WEBAPP_CDN_DOMAIN_NAME')
#     + ':'
#     + env('CSD_WEBAPP_PUBLIC_HTTPS_PORT')
#     + '/'
#     + AWS_STORAGE_BUCKET_NAME
# )
clean_cdn_url = clean_url(
    f"{env('CSD_WEBAPP_CDN_DOMAIN_NAME')}:{env('CSD_WEBAPP_PUBLIC_HTTPS_PORT')}"
)
AWS_S3_CUSTOM_DOMAIN = f'{clean_cdn_url}/{AWS_STORAGE_BUCKET_NAME}'

# STATIC

STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#static-root
STATIC_ROOT = str(ROOT_DIR.path('staticfiles'))
# https://docs.djangoproject.com/en/dev/ref/settings/#static-url
STATIC_URL = '/static/'
# https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#std:setting-STATICFILES_DIRS
STATICFILES_DIRS = [str(APPS_DIR.path('static'))]
# https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#staticfiles-finders
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

# MEDIA
# ------------------------------------------------------------------------------
DEFAULT_FILE_STORAGE = 'webapp.core.utils.storage_s3_utils.MediaRootS3BotoStorage'
# https://docs.djangoproject.com/en/dev/ref/settings/#media-root
MEDIA_ROOT = str(ROOT_DIR.path('media'))
# https://docs.djangoproject.com/en/dev/ref/settings/#media-url=
MEDIA_URL = f"{env('CSD_WEBAPP_CDN_DOMAIN_NAME')}:{env('CSD_WEBAPP_PUBLIC_HTTPS_PORT')}/{AWS_STORAGE_BUCKET_NAME}/media/"
MEDIA_GENERATED_FILES_FOLDER = 'generated'
MEDIA_IMAGE_FOLDER = 'stored_uploads'

# TEMPLATES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#templates
TEMPLATES = [
    {
        # https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-TEMPLATES-BACKEND
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        # https://docs.djangoproject.com/en/dev/ref/settings/#template-dirs
        'DIRS': [str(APPS_DIR.path('templates'))],
        'OPTIONS': {
            # https://docs.djangoproject.com/en/dev/ref/settings/#template-debug
            'debug': DEBUG,
            # https://docs.djangoproject.com/en/dev/ref/settings/#template-loaders
            # https://docs.djangoproject.com/en/dev/ref/templates/api/#loader-types
            'loaders': [
                'django.template.loaders.filesystem.Loader',
                'django.template.loaders.app_directories.Loader',
            ],
            # https://docs.djangoproject.com/en/dev/ref/settings/#template-context-processors
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'django.template.context_processors.tz',
                'django.contrib.messages.context_processors.messages',
                'wagtailmenus.context_processors.wagtailmenus',
            ],
        },
    }
]
# http://django-crispy-forms.readthedocs.io/en/latest/install.html#template-packs
CRISPY_TEMPLATE_PACK = 'bootstrap4'

# FIXTURES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#fixture-dirs
FIXTURE_DIRS = (str(APPS_DIR.path('fixtures')),)

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
EMAIL_BACKEND = env(
    'CSD_WEBAPP_SERVER_WEBAPP_DJANGO_EMAIL_BACKEND',
    default='webapp.core.utils.testing_email_backend.TestingEmailBackend',
)
EMAIL_HOST = env('CSD_SMTP_HOST', default='')
EMAIL_PORT = env('CSD_SMTP_PORT', default='')
EMAIL_HOST_USER = env('CSD_SMTP_USER', default='')
EMAIL_HOST_PASSWORD = env('CSD_SMTP_PASSWORD', default='')
DEFAULT_FROM_EMAIL = f"{env('CSD_DISPLAY_NAME')} <{env('CSD_EMAIL_TRANSACTIONAL')}>"
EMAIL_TESTING_BACKEND_STORE_PATH = os.path.join(str(ROOT_DIR.path('media')), 'emails')

EMAIL_USE_TLS = True

MODEL_ORDERING_DEFAULT_DISTANCE = 1000.0

# ADMIN
# ------------------------------------------------------------------------------
# Django Admin URL.
ADMIN_URL = env('CSD_WEBAPP_SERVER_ADMIN_URL') + '/'
# https://docs.djangoproject.com/en/dev/ref/settings/#admins
ADMINS = [('''TRO''', 'arqdevteam@gmail.com')]
# https://docs.djangoproject.com/en/dev/ref/settings/#managers
MANAGERS = ADMINS

# Wagtail
CMS_URL = env('CSD_WEBAPP_SERVER_CMS_URL', default='cms') + '/'
WAGTAIL_SITE_NAME = 'CMS'

# Your stuff...
# ------------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_RENDERER_CLASSES': ('djangorestframework_camel_case.render.CamelCaseJSONRenderer',),
    'DEFAULT_PARSER_CLASSES': ('djangorestframework_camel_case.parser.CamelCaseJSONParser',),
}

GRAPHENE = {'SCHEMA': 'webapp.core.schema.schema'}

WAGTAILADMIN_STATIC_FILE_VERSION_STRINGS = False

# useful to have consistent url requests from frontend which always must end with an /
APPEND_SLASH = True

WEBPACK_LOADER = {
    'DEFAULT': {'BUNDLE_DIR_NAME': '', 'STATS_FILE': str(ROOT_DIR.path('webpack-stats.json'))}
}

MARKUP_FIELD_TYPES = (('markdown', markdown.markdown),)

# Test Records in testing view
CSD_TEST_RECORDS_ACCESS = env('CSD_WEBAPP_SERVER_WEBAPP_TEST_RECORDS_ACCESS', default=False)

# colors
CSD_COLOR_PRIMARY = env('CSD_COLOR_PRIMARY')
CSD_COLOR_ACCENT = env('CSD_COLOR_ACCENT')
CSD_COLOR_WARN = env('CSD_COLOR_WARN')
CSD_DISPLAY_NAME = env('CSD_DISPLAY_NAME')

CSD_EMAIL_TRANSACTIONAL = env('CSD_EMAIL_TRANSACTIONAL')
CSD_PROJECT_NAME = env('CSD_PROJECT_NAME')
CSD_COMPANY_ADDRESS = env('CSD_COMPANY_ADDRESS')
CSD_WEBSITE_DOMAIN_NAME = env('CSD_WEBSITE_DOMAIN_NAME')
CSD_WEBSITE_HOST = env('CSD_WEBSITE_PUBLIC_HOST', default='www.example.com')
CSD_WEBSITE_PORT = env.int('CSD_WEBSITE_PUBLIC_HTTPS_PORT', default='443')
CSD_WEBAPP_HOST = env('CSD_WEBAPP_PUBLIC_HOST', default='www.example.com')
CSD_WEBAPP_PORT = env.int('CSD_WEBAPP_PUBLIC_HTTPS_PORT', default='443')
CSD_WEBSITE_TERMS_PATH = env('CSD_WEBSITE_TERMS_PATH', default='tos')
CSD_WEBSITE_PRIVACY_PATH = env('CSD_WEBSITE_PRIVACY_PATH', default='privacy-policy')
CSD_WEBSITE_CONTACT_PATH = env('CSD_WEBSITE_CONTACT_PATH', default='contact')
CSD_DOMAIN_NAME = env('CSD_DOMAIN_NAME', default='example.com')
CSD_PUBLIC_HOST = env('CSD_WEBAPP_DOMAIN_NAME', default='app.example.com')
CSD_PUBLIC_HTTPS_PORT = env.int('CSD_WEBSITE_PUBLIC_HTTPS_PORT', default=443)
CSD_WEBAPP_CDN_DOMAIN_NAME = env('CSD_WEBAPP_CDN_DOMAIN_NAME')
CSD_RESET_PASSWORD_PATH_NAME = env(
    'CSD_WEBAPP_RESET_PASSWORD_PATH_NAME', default='auth/password-reset'
)
CSD_CONFIRM_EMAIL_PATH_NAME = env(
    'CSD_WEBAPP_CONFIRM_EMAIL_PATH_NAME', default='auth/confirm-email'
)
CSD_CONFIRM_REGISTRATION_PATH_NAME = env(
    'CSD_WEBAPP_CONFIRM_REGISTRATION_PATH_NAME', default='auth/confirm-registration'
)

CSD_GRAPHQL_SDL_FILE = 'schema.graphql'
CSD_GRAPHQL_RESOLVER = ['webapp.users.resolver']
CSD_DB_TESTING_SNAPSHOT_SUFFIX = env(
    'CSD_WEBAPP_SERVER_DATABASE_TESTING_SNAPSHOT_SUFFIX', default='-bak'
)

CSD_WEBAPP_ONLINE_DB_RESET = env.bool('CSD_WEBAPP_ONLINE_DB_RESET', default=False)
