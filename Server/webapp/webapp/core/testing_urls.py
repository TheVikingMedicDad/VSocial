from django.urls import path

from webapp.core import testing_views

app_name = 'core'
urlpatterns = [
    path(
        'change-email-email', view=testing_views.change_email_email_view, name='change-email-email'
    ),
    path(
        'restore-testing-env/', view=testing_views.restore_testing_env, name='restore-testing-env'
    ),
    path(
        'testing-record-settings/',
        view=testing_views.testing_record_settings,
        name='testing-record-settings',
    ),
    path('emails/', view=testing_views.EmailsView.as_view(), name='emails'),
    path('last-email/', view=testing_views.last_email, name='last-email'),
    path('debugger-on/', view=testing_views.enable_debugger_view, name='debugger-on'),
    path('debugger-off/', view=testing_views.disable_debugger_view, name='debugger-off'),
    path('init-demo-data/', view=testing_views.init_demo_data, name='init-demo-data'),
]
