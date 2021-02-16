from django.conf import settings
from django.contrib.auth import get_user
from django.http import HttpResponseBadRequest
from django.utils import translation
from django.utils.functional import SimpleLazyObject
from rest_framework.authentication import TokenAuthentication

FALLBACK_HEADER_KEY = 'X_API_LANGUAGE'


class ModelLanguageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        if hasattr(settings, 'MODEL_LANGUAGE_HEADER'):
            _header_key = settings.MODEL_LANGUAGE_HEADER
        else:
            _header_key = FALLBACK_HEADER_KEY
        self.http_header_key = 'HTTP_' + _header_key
        self.allowed_languages = set(lang_key for lang_key, lang_name in settings.LANGUAGES)

    def __call__(self, request):
        """
        We will set the model's language for this current request according to the following rules:
         1) If there is a Header called X-API_LANGUAGE (more precicely `_header_key) we will set the model's language to this
         2) If the user is logged in we will set the user's language
         3) We will do nothing since we already defined a default language in django settings
        """
        user = self.get_user(request)
        if self.http_header_key in request.META:
            _lang = request.META[self.http_header_key]
            if _lang not in self.allowed_languages:
                return HttpResponseBadRequest(f'Language {_lang} not allowed')
            lang = _lang
        elif user.is_authenticated:
            lang = user.language
        else:
            return self.get_response(request)

        # do language switching for this request only:
        old_lang = translation.get_language()
        translation.activate(lang)
        response = self.get_response(request)
        translation.activate(old_lang)
        return response

    def get_user(self, request):
        # see https://crondev.blog/2018/05/13/django-middlewares-with-rest-framework/
        return SimpleLazyObject(lambda: self._get_user(request))

    def _get_user(self, request):
        user = get_user(request)
        if user.is_authenticated:
            return user
        token_authentication = TokenAuthentication()
        try:
            user, token = token_authentication.authenticate(request)
        except:
            pass
        return user
