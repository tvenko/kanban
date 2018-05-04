from django.conf.urls import url, include
from backend import views

users_urls = [
    url(r'^user/$', views.UserList.as_view()),
    url(r'^user/(?P<pk>[0-9]+)/$', views.UserUpdate.as_view()),
    url(r'^user/(?P<email>.+)/$', views.SingleUser.as_view()),
    url(r'^user_groups/(?P<pk>[0-9]+)/$', views.UserGroups.as_view()),
    # Note that this is only used for jwt logout.
    url(r'^user/invalidateToken/$', views.InvalidateToken.as_view(), name='invalidate-token'),
]

user_projects_urls = [
    url(r'^user_projects/(?P<pk>[0-9]+)/$', views.UserProjects.as_view()),
]

roles_urls = [
    url(r'^all_roles/$', views.RoleList.as_view()),
]

groups_urls = [
    url(r'^groups/(?P<pk>[0-9]+)/$', views.DeveloperGroupDetail.as_view()),
    url(r'^groups/$', views.DeveloperGroupList.as_view()),
]


projects_urls = [
    url(r'^projects/(?P<pk>[0-9]+)/$', views.ProjectDetail.as_view()),
    url(r'^projects/$', views.ProjectList.as_view()),
]

columns_urls = [
    url(r'^columns/$', views.ColumnList.as_view()),
    url(r'^columns/(?P<pk>[0-9]+)/$', views.ColumnDetail.as_view()),

]

board_urls = [
    url(r'^boards/$', views.BoardList.as_view()),
    url(r'^boards/(?P<pk>[0-9]+)/$', views.BoardDetail.as_view()),
]

wip_violations = [
    url(r'^wip_violations/$', views.WipViolationList.as_view()),
]
card_urls = [
    url(r'^cards/$', views.CardList.as_view()),
    url(r'^cards/(?P<pk>[0-9]+)/$', views.CardDetail.as_view()),
    url(r'^card_priority/$', views.CardPriorityList.as_view()),
    url(r'^about_card/(?P<pk>[0-9]+)/$', views.CardAbout.as_view()),
]


urlpatterns = [
    url(r'^', include(users_urls)),
    url(r'^', include(user_projects_urls)),
    url(r'^', include(roles_urls)),
    url(r'^', include(groups_urls)),
    url(r'^', include(projects_urls)),
    url(r'^', include(columns_urls)),
    url(r'^', include(board_urls)),
    url(r'^', include(card_urls)),
    url(r'^', include(wip_violations)),
    url(r'^docs/', views.schema_view)
]
