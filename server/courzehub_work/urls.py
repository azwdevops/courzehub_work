
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

# import the settings to check the PRODUCTION status to facilitate file serving
from .settings import PRODUCTION

urlpatterns = [
    path('admin/', admin.site.urls),

    # include api urls
    path('api/user/', include('user.api.urls')),
    path('api/work/', include('work.api.urls')),

    # normal urls
    path('pesapal/', include('pesapal.urls')),
    path('accounting/', include('accounting.urls')),
]


urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# if not production serve files locally
if not PRODUCTION:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)

# to allow for incorporation of react front end urls/ other routes not represented above

urlpatterns += [re_path(r'^.*',
                        TemplateView.as_view(template_name='index.html'))]
