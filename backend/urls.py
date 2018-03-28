from django.conf.urls import url, include
from backend import views

users_urls = [
    url(r'^user/$', views.user_list),
    url(r'^user/(?P<pk>[0-9]+)/$', views.user_detail),
]

roles_urls = [
    url(r'^all_roles/$', views.all_roles_list),
]

groups_urls = [
    url(r'^groups/$', views.group_list),
]

urlpatterns = [
    url(r'^', include(users_urls)),
    url(r'^', include(roles_urls)),
    url(r'^', include(groups_urls))
]
