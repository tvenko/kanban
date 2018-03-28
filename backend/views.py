from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from backend.models import User, Role, AllowedRole, DeveloperGroup, DeveloperGroupMembership, GroupRole
from backend.serializers import UserSerializer, DeveloperGroupSerializer


@csrf_exempt
def user_list(request):
    """
    List all users, or create a new one.
    """
    if request.method == 'GET':
        roles = Role.objects.all()
        allowed_roles = AllowedRole.objects.all()
        users = User.objects.all()

        user_roles = {}
        counter = 0
        for user in users:
            roles_list = []
            allowed_roles_query = allowed_roles.filter(user_id=user.id)
            for query in allowed_roles_query:
                roles_query = roles.filter(id=query.role_id.id)
                roles_list.append(roles_query[0].title)
            user_allowed_roles = UserSerializer(user).data
            user_allowed_roles["allowed_user_roles"] = roles_list
            user_roles[counter] = user_allowed_roles
            counter += 1

        return JsonResponse(user_roles, safe=False)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = UserSerializer(data=data)

        if serializer.is_valid():
            serializer.save()

        user_id = serializer.data["id"]
        for role_id in data["roles"]:
            user = User.objects.get(pk=user_id)
            role = Role.objects.get(pk=role_id)
            AllowedRole.objects.create(user_id=user, role_id=role)

        return JsonResponse(serializer.errors, status=400)


@csrf_exempt
def user_detail(request, pk):
    """
    Retrieve, update or delete a user.
    """

    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return JsonResponse(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = UserSerializer(user, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)

    elif request.method == 'DELETE':
        user.delete()
        return HttpResponse(status=204)


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


@csrf_exempt
def group_list(request):
    """
    List all users roles.
    """
    if request.method == 'GET':
        groups = DeveloperGroup.objects.all()
        group_memberships = DeveloperGroupMembership.objects.all()
        users = User.objects.all()

        group_roles = {}
        counter = 0
        for group in groups:
            allowed_roles_query = group_memberships.filter(developer_group_id=group.id)
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


@csrf_exempt
def all_roles_list(request):
    """
    List all roles.
    """
    if request.method == 'GET':
        roles = Role.objects.all()

        all_roles = []
        for i in roles:
            all_roles.append(i.title)

        return JsonResponse(all_roles, safe=False)
