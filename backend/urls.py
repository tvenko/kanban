from django.conf.urls import url, include
from backend import views

user_urls = [
    url(r'^user/$', views.user_list),
    url(r'^user/(?P<pk>[0-9]+)/$', views.user_detail),
]

urlpatterns = [
    url(r'^', include(user_urls)),
]