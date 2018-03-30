from django.conf.urls import url, include
from backend import views

users_urls = [
    url(r'^user/$', views.UserList.as_view()),
    url(r'^user/(?P<pk>[0-9]+)/$', views.UserUpdate.as_view()),
]

roles_urls = [
    url(r'^all_roles/$', views.RoleList.as_view()),
]

groups_urls = [
    url(r'^groups/(?P<pk>[0-9]+)/$', views.DeveloperGroupDetail.as_view()),
    url(r'^groups/$', views.DeveloperGroupList.as_view()),
]

urlpatterns = [
    url(r'^', include(users_urls)),
    url(r'^', include(roles_urls)),
    url(r'^', include(groups_urls)),
    url(r'^docs/', views.schema_view)
]
