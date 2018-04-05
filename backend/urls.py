from django.conf.urls import url, include
from backend import views

users_urls = [
    url(r'^user/$', views.UserList.as_view()),
    url(r'^user/(?P<pk>[0-9]+)/$', views.UserUpdate.as_view()),
    url(r'^user/(?P<email>.+)/$', views.SingleUser.as_view()),
    # Note that this is only used for jwt logout.
    url(r'^user/invalidateToken/$', views.InvalidateToken.as_view(), name='invalidate-token'),
]

roles_urls = [
    url(r'^all_roles/$', views.RoleList.as_view()),
]

groups_urls = [
    url(r'^groups/(?P<pk>[0-9]+)/$', views.DeveloperGroupDetail.as_view()),
    url(r'^groups/$', views.DeveloperGroupList.as_view()),
]


projects_urls = [
    url(r'^projects/(?P<id_project>[0-9]+)/$', views.ProjectDetail.as_view()),
    url(r'^projects/$', views.ProjectList.as_view()),
]


urlpatterns = [
    url(r'^', include(users_urls)),
    url(r'^', include(roles_urls)),
    url(r'^', include(groups_urls)),
    url(r'^', include(projects_urls)),
    url(r'^docs/', views.schema_view)
]
