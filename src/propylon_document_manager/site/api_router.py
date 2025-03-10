from django.conf import settings
from django.urls import path
from rest_framework.routers import DefaultRouter, SimpleRouter
from propylon_document_manager.file_versions.api.views import FileVersionViewSet, UploadDocumentView, upload_document, get_document

if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

router.register("file_versions", FileVersionViewSet)


app_name = "api"
urlpatterns = router.urls


urlpatterns = urlpatterns + [
    path("upload-document/", UploadDocumentView.as_view(), name="upload-document"),
    path("upload/", upload_document, name="upload"),
    path("documents/<str:filename>/", get_document, name="get-document"),
]
