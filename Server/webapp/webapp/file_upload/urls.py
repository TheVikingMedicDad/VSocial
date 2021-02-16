from django.urls import path

from webapp.file_upload import views

app_name = 'core'
urlpatterns = [path('process/', view=views.UploadView.as_view(), name='process')]
