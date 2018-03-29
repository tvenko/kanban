from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from backend.models import User, Role, AllowedRole, DeveloperGroup, DeveloperGroupMembership, GroupRole
from backend.serializers import UserSerializer, DeveloperGroupSerializer, AllowedRoleSerializer, RoleSerializer, DeveloperGroupMembershipSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics

from rest_framework_swagger.renderers import OpenAPIRenderer, SwaggerUIRenderer
from rest_framework.decorators import api_view, renderer_classes
from rest_framework import response, schemas
from . import urls


@api_view()
@renderer_classes([SwaggerUIRenderer, OpenAPIRenderer])
def schema_view(request):
    """
    Schema for swagger
    """

    generator = schemas.SchemaGenerator(title='API Docs', patterns=urls.urlpatterns, url='/api/v1/')
    return response.Response(generator.get_schema())


class UserList(generics.ListCreateAPIView):
    """
    List all users, or create a new one.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get(self, request, **kwargs):
        roles = Role.objects.all()
        allowed_roles = AllowedRole.objects.all()
        users = User.objects.all().order_by("password")

        user_roles = []
        counter = 0
        for user in users:
            roles_list = []
            allowed_roles_query = allowed_roles.filter(user_id=user.id)
            for query in allowed_roles_query:
                roles_query = roles.filter(id=query.role_id.id)
                roles_list.append(roles_query[0].title)
            user_allowed_roles = UserSerializer(user).data
            user_allowed_roles["roles"] = roles_list
            user_roles.append(user_allowed_roles)
            counter += 1
        return Response(user_roles)

    def post(self, request, **kwargs):
        data = JSONParser().parse(request)
        serializer = UserSerializer(data=data)

        if serializer.is_valid():
            serializer.save()

        if "roles" in data:
            user_id = serializer.data["id"]
            for role_id in data["roles"]:
                user = User.objects.get(pk=user_id)
                role = Role.objects.get(pk=role_id)
                AllowedRole.objects.create(user_id=user, role_id=role)

        return JsonResponse(serializer.errors, status=status.HTTP_201_CREATED)


class UserUpdate(generics.UpdateAPIView):
    """
    Update user.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def put(self, request, *args, **kwargs):
        try:
            user = User.objects.get(pk=kwargs["pk"])
        except User.DoesNotExist:
            return HttpResponse(status=404)

        data = JSONParser().parse(request)
        serializer = UserSerializer(user, data=data)

        if serializer.is_valid():
            serializer.save()

        if "roles" in data:
            user_id = serializer.data["id"]
            allowed_roles = AllowedRole.objects.filter(user_id=user_id)
            for role in data["roles"]:
                if role not in list(allowed_roles.values_list('role_id', flat=True)):
                    user = User.objects.get(pk=user_id)
                    roles = Role.objects.get(pk=role)
                    AllowedRole.objects.create(user_id=user, role_id=roles)
            for i in allowed_roles:
                if i.role_id.id not in data["roles"]:
                    i.delete()

        return JsonResponse(serializer.errors, status=400)


def get_user_group_roles(dev_group_memb_id):
    """
    Get all user roles on DeveloperGroup
    """

    roles = Role.objects.all()
    group_roles = GroupRole.objects.all()

    roles_list = []
    group_roles_query = group_roles.filter(developer_group_membership_id=dev_group_memb_id)
    for query in group_roles_query:
        roles_query = roles.filter(id=query.role_id.id)
        roles_list.append(roles_query[0].title)

    return roles_list


class DeveloperGroupMembershipList(generics.ListCreateAPIView):
    """
    List all developer group memberships, or create a new one.
    """

    queryset = DeveloperGroupMembership.objects.all()
    serializer_class = DeveloperGroupMembershipSerializer

    def get(self, request, **kwargs):
        groups = DeveloperGroup.objects.all()
        group_memberships = DeveloperGroupMembership.objects.all()
        users = User.objects.all()

        group_roles = {}
        counter = 0
        for group in groups:
            allowed_roles_query = group_memberships.filter(
                developer_group_id=group.id)
            group_data = DeveloperGroupSerializer(group).data
            user_roles_dict = {}
            counter2 = 0
            for z in allowed_roles_query:
                user_roles = get_user_group_roles(z.id)
                user_details = users.filter(id=z.user_id.id)[0]
                user_data = UserSerializer(user_details).data
                user_data["allowed_group_roles"] = user_roles
                user_data["group_active"] = z.active
                user_roles_dict[counter2] = user_data
                counter2 += 1
            group_data["users"] = user_roles_dict
            group_roles[counter] = group_data
            counter += 1

        return JsonResponse(group_roles, safe=False)

    def post(self, request, **kwargs):
        data = JSONParser().parse(request)
        serializer = DeveloperGroupSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)


class DeveloperGroupList(generics.ListAPIView):
    """
    List all groups.
    """

    queryset = DeveloperGroup.objects.all()
    serializer_class = DeveloperGroupSerializer


class DeveloperGroupDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a developer group.
    """
    queryset = DeveloperGroup.objects.all()
    serializer_class = DeveloperGroupSerializer


class RoleList(generics.ListAPIView):
    """
    List all roles, or create a new one.
    """

    def get(self, request, *args, **kwargs):
        roles = Role.objects.all()

        all_roles = []
        for i in roles:
            all_roles.append(i.title)

        return JsonResponse(all_roles, safe=False)

