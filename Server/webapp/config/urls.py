from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.views import defaults as default_views
from django.views.generic import TemplateView
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.core import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

from webapp.core import testing_views
from webapp.core.views import TestView

urlpatterns = [
    # Django Admin, use {% url "admin:index" %}
    path(settings.ADMIN_URL, admin.site.urls),
    # Wagtail (CMS) Admin
    path(settings.CMS_URL, include(wagtailadmin_urls)),
    # Your stuff: custom urls includes go here
    url(r'^api/file-upload/', include('webapp.file_upload.urls', namespace='file_upload')),
    # Core
    path("api/", include("webapp.core.urls", namespace="core")),
    # GraphQL
    path("api/", include("webapp.gql.urls", namespace="gql")),
    # just for testing
    path("api/test", TestView.as_view(), name="test_view"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        path("400/", default_views.bad_request, kwargs={"exception": Exception("Bad Request!")}),
        path(
            "403/",
            default_views.permission_denied,
            kwargs={"exception": Exception("Permission Denied")},
        ),
        path(
            "404/", default_views.page_not_found, kwargs={"exception": Exception("Page not Found")}
        ),
        path("500/", default_views.server_error),
        path("api/testing/", include("core.testing_urls", namespace="testing-urls")),
    ]
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns


if settings.CSD_WEBAPP_ONLINE_DB_RESET or settings.DEBUG:
    urlpatterns += [
        path(
            'api/testing/create-testing-db-template/',
            view=testing_views.create_testing_db_template,
            name='create-testing-db-template',
        )
    ]


# the catchall url is wagtail
urlpatterns += [re_path(r'', include(wagtail_urls))]
