from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views import defaults as default_views
from django.views.generic import TemplateView
from rest_framework.authtoken.views import obtain_auth_token
from django.urls import path
from ..file_versions.api.views import CustomAuthToken, TestAuthView


# API URLS
urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # API base url
    path("api/", include("propylon_document_manager.site.api_router")),
    # DRF auth token
    path("api-auth/", include("rest_framework.urls")),
    # path("auth-token/", obtain_auth_token),
    path("auth-token/", CustomAuthToken.as_view(), name="auth-token"),
    path("test-auth/", TestAuthView.as_view(), name="test-auth"),
]

if settings.DEBUG:
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns

    # Serve media files in development mode
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)