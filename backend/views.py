from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from rest_framework.parsers import JSONParser
from backend.models import User, Role, AllowedRole, DeveloperGroup, DeveloperGroupMembership, GroupRole, Project, Column, Board, Card, CardPriority, WipViolation, WipViolationReason, Task, CardLog, DeleteReason
from backend.serializers import UserSerializer, DeveloperGroupSerializer, AllowedRoleSerializer, RoleSerializer, DeveloperGroupMembershipSerializer, ProjectSerializer, ColumnSerializer, BoardSerializer, CardSerializer, CardPrioritySerializer, TaskSerializer, WipViolationSerializer, CardLogSerializer, DeleteReasonSerializer, WipViolationReasonSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from rest_framework import views
from rest_framework import permissions

from rest_framework_swagger.renderers import OpenAPIRenderer, SwaggerUIRenderer
from rest_framework.decorators import api_view, renderer_classes
from rest_framework import response, schemas
from . import urls

from django.db.models import Q

import uuid

# TODO: remove session auth, remove auth for swagger
@api_view()
@renderer_classes([SwaggerUIRenderer, OpenAPIRenderer])
def schema_view(request):
    """
    Schema for swagger
    """
    generator = schemas.SchemaGenerator(title='API Docs', patterns=urls.urlpatterns, url='/')
    return response.Response(generator.get_schema())

class InvalidateToken(views.APIView):
    """
    Use this endpoint to log out all sessions for a given user (jwt).

    Basically invalidate all issued jwt tokens. Not really needed but hey, it's there and it works.
    """
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, *args, **kwargs):
        user = request.user
        user.jwt_secret = uuid.uuid4()
        user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SingleUser(views.APIView):
    """
    Retrieve all information (or most of it) about a single user. Search by email.
    """

    def get(self, request, **kwargs):
        roles = Role.objects.all()
        allowed_roles = AllowedRole.objects.all()
        #user = User.objects.all().filter(email=kwargs["email"]).values_list('email', 'name', 'id')
        user = get_object_or_404(User, email=kwargs["email"])

        roles_list = []
        allowed_roles_query = allowed_roles.filter(user_id=user.id)
        for query in allowed_roles_query:
            roles_query = roles.filter(id=query.role_id.id)
            roles_list.append(roles_query[0].title)
        user_allowed_roles = UserSerializer(user).data
        user_allowed_roles["roles"] = roles_list
        for key in ["password", "last_login", "first_name", "last_name", "is_staff",
                        "date_joined", "jwt_secret", "groups", "user_permissions", "username"]:
            del user_allowed_roles[key]

        return Response(user_allowed_roles, status=status.HTTP_202_ACCEPTED)


class UserList(generics.ListCreateAPIView):
    """
    List all users, or create a new one.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get(self, request, **kwargs):
        roles = Role.objects.all()
        allowed_roles = AllowedRole.objects.all()
        users = User.objects.all().filter(is_superuser=False).order_by("surname")

        user_roles = []
        for user in users:
            roles_list = []
            allowed_roles_query = allowed_roles.filter(user_id=user.id)
            for query in allowed_roles_query:
                roles_query = roles.filter(id=query.role_id.id)
                roles_list.append(roles_query[0].title)
            user_allowed_roles = UserSerializer(user).data
            user_allowed_roles["roles"] = roles_list
            user_roles.append(user_allowed_roles)

        return Response(user_roles, status=status.HTTP_202_ACCEPTED)

    def post(self, request, **kwargs):
        data = JSONParser().parse(request)
        print(data)
        serializer = UserSerializer(data=data)

        success_status=False

        if serializer.is_valid():
            success_status=True
            serializer.save()
        else:
            pass

        if "roles" in data:
            user_id = serializer.data["id"]
            for role_id in data["roles"]:
                user = User.objects.get(pk=user_id)
                role = Role.objects.get(pk=role_id)
                AllowedRole.objects.create(user_id=user, role_id=role)

        if success_status:
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return JsonResponse(serializer.errors, status=status.HTTP_406_NOT_ACCEPTABLE)


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

        # Set to existing hash if password is null.
        if data["password"] is None:
            data["password"] = getattr(user, "password")

        serializer = UserSerializer(user, data=data)

        success_status=False

        if serializer.is_valid():
            success_status=True
            serializer.save()
        else:
            print(serializer.errors)

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

        if success_status:
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)

        return JsonResponse(serializer.errors, status=status.HTTP_406_NOT_ACCEPTABLE)


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
        roles_list.append(roles_query[0].id)

    return roles_list


class DeveloperGroupList(generics.ListCreateAPIView):
    """
    List all groups.
    """

    queryset = DeveloperGroup.objects.all()
    serializer_class = DeveloperGroupSerializer

    def get(self, request, **kwargs):
        groups = DeveloperGroup.objects.all()
        group_memberships = DeveloperGroupMembership.objects.all()
        users = User.objects.all()

        group_roles = []
        for group in groups:
            allowed_roles_query = group_memberships.filter(
                developer_group_id=group.id)
            group_data = DeveloperGroupSerializer(group).data
            user_roles_dict = []
            for z in allowed_roles_query:
                user_roles = get_user_group_roles(z.id)
                user_details = users.filter(id=z.user_id.id)[0]
                user_data = UserSerializer(user_details).data
                user_data["allowed_group_roles"] = user_roles
                user_data["group_active"] = z.active
                user_roles_dict.append(user_data)
            group_data["users"] = user_roles_dict
            group_roles.append(group_data)

        return Response(group_roles, status=status.HTTP_202_ACCEPTED)

    def post(self, request, **kwargs):
        data = JSONParser().parse(request)
        developer_group_title=data["title"]
        developer_group = DeveloperGroup(title=developer_group_title)
        developer_group.save()

        for user_data in data["users"]:
            user = User.objects.get(pk=user_data["id"])
            developer_group = DeveloperGroup.objects.get(pk=developer_group.id)
            developer_group_membership = DeveloperGroupMembership(user_id=user, developer_group_id=developer_group, active=user_data["group_active"])
            developer_group_membership.save()

            for group_role in user_data["allowed_group_roles"]:
                role = Role.objects.get(pk=group_role)
                GroupRole.objects.create(developer_group_membership_id=developer_group_membership, role_id=role)

        return Response(data=None, status=status.HTTP_200_OK)

from datetime import datetime
class DeveloperGroupDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a developer group.
    """

    queryset = DeveloperGroup.objects.all()
    serializer_class = DeveloperGroupSerializer

    def get(self, request, **kwargs):
        group = DeveloperGroup.objects.get(pk=kwargs["pk"])
        group_memberships = DeveloperGroupMembership.objects.all()
        users = User.objects.all()

        group_roles = []
        allowed_roles_query = group_memberships.filter(
            developer_group_id=group.id)
        group_data = DeveloperGroupSerializer(group).data
        user_roles_dict = []
        for z in allowed_roles_query:
            user_roles = get_user_group_roles(z.id)
            user_details = users.filter(id=z.user_id.id)[0]
            user_data = UserSerializer(user_details).data
            user_data["allowed_group_roles"] = user_roles
            user_data["group_active"] = z.active
            user_roles_dict.append(user_data)
        group_data["users"] = user_roles_dict
        group_roles.append(group_data)

        return Response(group_roles, status=status.HTTP_202_ACCEPTED)

    def put(self, request, *args, **kwargs):
        data = JSONParser().parse(request)
        group = DeveloperGroup.objects.get(pk=kwargs["pk"])
        group.title = data["title"]
        group.save()

        developer_group_membership_list = list(
            DeveloperGroupMembership.objects.filter(
                developer_group_id=kwargs["pk"]).values_list('user_id',
                                                             flat=True))

        developer_group_membership = DeveloperGroupMembership.objects.filter(
            developer_group_id=kwargs["pk"])

        for user_data in data["users"]:
            user_id = user_data["id"]

            if user_id not in developer_group_membership_list:
                user = User.objects.get(pk=user_id)
                developer_group = DeveloperGroup.objects.get(
                    pk=kwargs["pk"])
                developer_group_membership = DeveloperGroupMembership(
                    user_id=user, developer_group_id=developer_group,
                    active=user_data["group_active"])
                developer_group_membership.save()

                for group_role in user_data["allowed_group_roles"]:
                    role = Role.objects.get(pk=group_role)
                    GroupRole.objects.create(
                        developer_group_membership_id=developer_group_membership,
                        role_id=role)
            else:
                developer_group_membership_user = developer_group_membership.get(user_id=user_id)
                if developer_group_membership_user.active == False and user_data["group_active"] == True:
                    developer_group_membership_user.deleted_at = None
                else:
                    developer_group_membership_user.deleted_at = datetime.now()
                developer_group_membership_user.active = user_data["group_active"]
                developer_group_membership_user.save()

                allowed_roles = GroupRole.objects.filter(developer_group_membership_id=developer_group_membership_user.id)

                for role in user_data["allowed_group_roles"]:
                    if role not in list(
                            allowed_roles.values_list('role_id', flat=True)):
                        roles = Role.objects.get(pk=role)
                        GroupRole.objects.create(developer_group_membership_id=developer_group_membership_user, role_id=roles)
                for i in allowed_roles:
                    if i.role_id.id not in user_data["allowed_group_roles"]:
                        i.delete()

        return Response(data=None, status=status.HTTP_200_OK)


class RoleList(generics.ListAPIView):
    """
    List all roles, or create a new one.
    """

    def get(self, request, *args, **kwargs):
        roles = Role.objects.all()

        all_roles = []
        for i in roles:
            all_roles.append(i.title)

        return JsonResponse(all_roles, safe=False, status=status.HTTP_202_ACCEPTED)


class ProjectList(generics.ListCreateAPIView):
    """
    List all groups.
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


    def get(self, request, **kwargs):
        projects = Project.objects.all()
        group_memberships = DeveloperGroupMembership.objects.all()
        users = User.objects.all()
        cards = Card.objects.all()

        projects_data = []
        for project in projects:
            allowed_roles_query = group_memberships.filter(
                developer_group_id=project.developer_group_id.id)
            group_data = DeveloperGroupSerializer(
                project.developer_group_id).data
            project_data = ProjectSerializer(project).data
            project_cards = cards.filter(project_id=project.id)
            print(project_data)
            if not project_cards:
                project_data["card_active"] = False
            else:
                project_data["card_active"] = True
            project_data["group_data"] = group_data

            user_roles_dict = []
            for z in allowed_roles_query:
                user_roles = get_user_group_roles(z.id)
                user_details = users.filter(id=z.user_id.id)[0]
                user_data = UserSerializer(user_details).data
                user_data["allowed_group_roles"] = user_roles
                user_data["group_active"] = z.active
                user_roles_dict.append(user_data)
            group_data["users"] = user_roles_dict
            projects_data.append(project_data)
        return Response(projects_data, status=status.HTTP_202_ACCEPTED)


class ProjectDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    List all groups.
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class ColumnList(generics.ListCreateAPIView):
    """
    List all groups.
    """

    queryset = Column.objects.all()
    serializer_class = ColumnSerializer

    def get(self, request, **kwargs):
        columns = Column.objects.all()
        columns_data = []
        for column in columns:
            serializer = ColumnSerializer(column).data
            if serializer["parent_column_id"] == None:
                serializer["subcolumns_length"] = len(Column.objects.all().filter(parent_column_id=column))
            columns_data.append(serializer)

        return Response(columns_data, status=status.HTTP_200_OK)

    def post(self, request, **kwargs):
        columns = Column.objects.all()
        serializer = ColumnSerializer(data=request.data)

        if request.data["parent_column_id"] == None:
            board_id = request.data["board_id"]
            display_offset = request.data["display_offset"]
            filtered_columns = columns.filter(board_id=board_id).filter(parent_column_id=None)

            for i in filtered_columns:
                offset = i.display_offset
                if offset >= display_offset:
                    i.display_offset += 1
                    i.save()
        else:
            board_id = request.data["board_id"]
            display_offset = request.data["display_offset"]
            filtered_columns = columns.filter(board_id=board_id).filter(
                parent_column_id=request.data["parent_column_id"])

            for i in filtered_columns:
                offset = i.display_offset
                if offset >= display_offset:
                    i.display_offset += 1
                    i.save()

        if serializer.is_valid():
            serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ColumnDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    List all groups.
    """

    queryset = Column.objects.all()
    serializer_class = ColumnSerializer

    def get(self, request, **kwargs):
        column = Column.objects.get(pk=kwargs["pk"])
        serializer = ColumnSerializer(column).data

        if serializer["parent_column_id"] == None:
            serializer["subcolumns_length"] = len(Column.objects.all().filter(parent_column_id=column))

        return Response(serializer, status=status.HTTP_200_OK)
    
    def delete(self, request, *args, **kwargs):
        columns = Column.objects.all()
        column = Column.objects.get(pk=kwargs["pk"])


        board_id = column.board_id
        display_offset = column.display_offset

        if column.parent_column_id == None:
            filtered_columns = columns.filter(board_id=board_id).filter(
                parent_column_id=None)

            for i in filtered_columns:
                offset = i.display_offset
                if offset >= display_offset:
                    i.display_offset -= 1
                    i.save()
        else:
            filtered_columns = columns.filter(board_id=board_id).filter(
                parent_column_id=column.parent_column_id)

            for i in filtered_columns:
                offset = i.display_offset
                if offset >= display_offset:
                    i.display_offset -= 1
                    i.save()

        column.delete()

        return Response(None, status=status.HTTP_200_OK)


class BoardList(generics.ListCreateAPIView):
    """
        List all boards.
    """

    queryset = Board.objects.all()
    serializer_class = BoardSerializer


class BoardDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    List all groups.
    """

    queryset = Board.objects.all()
    serializer_class = BoardSerializer


    def get(self, request, **kwargs):
        board = Board.objects.get(pk=kwargs["pk"])
        columns = Column.objects.all().order_by("display_offset")
        cards = Card.objects.all()

        board_data = []
        board_serializer = BoardSerializer(board).data
        board_columns = columns.filter(
            board_id=board.id).filter(parent_column_id=None)
        board_column_data = []

        for i in board_columns:
            print(i)
            column_serializer = ColumnSerializer(i).data
            column_subcolumns = columns.filter(
                parent_column_id=i.id)
            column_cards_list = []
            column_cards = cards.filter(column_id=i.id)
            for column_card in column_cards:
                column_card_data = CardSerializer(column_card).data
                column_cards_list.append(column_card_data)
            subcolumns_data = []
            for x in column_subcolumns:
                subcolumns_cards_list = []
                subcolumn_serializer = ColumnSerializer(x).data
                subcolumn_cards = cards.filter(column_id=x.id)
                for subcolumn_card in subcolumn_cards:
                    subcolumn_card_data = CardSerializer(subcolumn_card).data
                    subcolumns_cards_list.append(subcolumn_card_data)
                subcolumn_serializer["column_cards"] = subcolumns_cards_list
                subcolumns_data.append(subcolumn_serializer)

            column_serializer["subcolumns"] = subcolumns_data
            column_serializer["column_cards"] = column_cards_list
            board_column_data.append(column_serializer)
        board_serializer["columns"] = board_column_data


        board_projects = Project.objects.all().filter(board_id=kwargs["pk"])

        group_memberships = DeveloperGroupMembership.objects.all()
        users = User.objects.all()
        cards = Card.objects.all()

        projects_data = []
        for board_project in board_projects:
            allowed_roles_query = group_memberships.filter(
                developer_group_id=board_project.developer_group_id.id)
            group_data = DeveloperGroupSerializer(
                board_project.developer_group_id).data
            project_data = ProjectSerializer(board_project).data
            project_cards = cards.filter(project_id=board_project.id)
            if not project_cards:
                project_data["card_active"] = False
            else:
                project_data["card_active"] = True
            project_data["group_data"] = group_data

            user_roles_dict = []
            for z in allowed_roles_query:
                user_roles = get_user_group_roles(z.id)
                user_details = users.filter(id=z.user_id.id)[0]
                user_data = UserSerializer(user_details).data
                user_data["allowed_group_roles"] = user_roles
                user_data["group_active"] = z.active
                user_roles_dict.append(user_data)
            group_data["users"] = user_roles_dict
            projects_data.append(project_data)

        board_serializer["projects"] = projects_data

        board_data.append(board_serializer)

        return Response(board_data, status=status.HTTP_202_ACCEPTED)


class UserProjects(generics.RetrieveUpdateDestroyAPIView):
    """
    List all groups.
    """

    queryset = Board.objects.all()
    serializer_class = BoardSerializer


    def get(self, request, *args, **kwargs):
        boards = Board.objects.all()
        user_id = kwargs["pk"]
        admin = AllowedRole.objects.all().filter(user_id=user_id).filter(role_id=4)
        kanban_master = AllowedRole.objects.all().filter(user_id=user_id).filter(role_id=3)
        if admin and not kanban_master:
            board_list = []

            for board in boards:
                board_data = []
                board_data.append(board.title)
                board_data.append(board.id)
                projects = Project.objects.all().filter(board_id=board.id)
                project_data = dict()
                project_data["projects"] = []

                for project in projects:
                    project_data["projects"].append(project.project_id)
                board_data.append(project_data)
                board_list.append(board_data)
        else:
            #allowed_roles = AllowedRole.objects.all().filter(user_id=user_id).filter(role_id=3)
            board_list = []

            for board in boards:
                board_data = []
                board_data.append(board.title)
                board_data.append(board.id)
                projects = Project.objects.all().filter(board_id=board.id)
                project_data = dict()
                project_data["projects"] = []
                user_in_project = False

                for project in projects:
                    project_data["projects"].append(project.project_id)
                    developer_groups = DeveloperGroupMembership.objects.all().filter(developer_group_id=project.developer_group_id)

                    for developer_group in developer_groups:
                        user = get_object_or_404(User, email=developer_group.user_id)
                        if user.id == int(user_id) and developer_group.active:
                            user_in_project = True
                if user_in_project:
                    board_data.append(project_data)
                    board_data.append(True)
                    board_list.append(board_data)
                if not user_in_project and kanban_master:
                    board_data.append(project_data)
                    board_data.append(False)
                    board_list.append(board_data)
                # If kanban master, return attribute about board membership.

        return Response(board_list, status=status.HTTP_202_ACCEPTED)


class CardList(generics.ListCreateAPIView):
    """
    List all cards.
    """

    queryset = Card.objects.all()
    serializer_class = CardSerializer

    def post(self, request, *args, **kwargs):
        serializer = CardSerializer(data=request.data)

        if serializer.is_valid():
            cards = Card.objects.all().filter(project_id=int(serializer.validated_data["project_id"].id)).filter(active=True)
            cards_on_column = Card.objects.all().filter(column_id=serializer.validated_data["column_id"]).filter(active=True)
            wip_sum = len([card.size for card in cards_on_column])
            if not cards:
                serializer.save(number=1)
                #card = Card.objects.all().order_by("-card_id")[0]
                #CardLog.objects.create(card_id=card, )
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            else:
                silver_type = cards.filter(type_silver=True).filter(column_id=serializer.validated_data["column_id"])
                if serializer.validated_data["type_silver"] and silver_type:
                    return JsonResponse(serializer.error_messages, status=status.HTTP_406_NOT_ACCEPTABLE)
                card = cards.order_by("-number")[0]
                card_serializer = CardSerializer(card)
                if serializer.validated_data["column_id"].wip_restriction == 0:
                    serializer.save(number=card_serializer.data["number"] + 1)
                    return JsonResponse(serializer.data,
                                        status=status.HTTP_200_OK)
                elif serializer.is_valid() and not (wip_sum + 1 > serializer.validated_data["column_id"].wip_restriction):
                    serializer.save(number=card_serializer.data["number"] + 1)
                    return JsonResponse(serializer.data,
                                        status=status.HTTP_200_OK)
                elif wip_sum + 1 > serializer.validated_data["column_id"].wip_restriction:
                    serializer.save(number=card_serializer.data["number"] + 1)
                    card = Card.objects.all().filter(active=True).order_by("-card_id")[0]
                    WipViolation.objects.create(card_id=card, column_id=serializer.validated_data["column_id"],
                                                       user_id=User.objects.get(pk=request.data["violation_user"]), wip_violation_reason_id=WipViolationReason.objects.get(pk=1))
                    return JsonResponse(serializer.data,
                                        status=status.HTTP_409_CONFLICT)

                return JsonResponse(serializer.data, status=status.HTTP_200_OK)

        return JsonResponse(serializer.data, status=status.HTTP_406_NOT_ACCEPTABLE)


class CardDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    List card detail
    """

    queryset = Card.objects.all()
    serializer_class = CardSerializer


class CardPriorityList(generics.ListCreateAPIView):
    """
    List all cards priority.
    """

    queryset = CardPriority.objects.all()
    serializer_class = CardPrioritySerializer

    # def post(self, request, *args, **kwargs):
    #     card = Card(request.data)
    #     print(card)
    #     print(card.number)
    #     print(card.project_id)
    #     cards = Card.objects.all().filter(project_id=int(card.project_id))


class CardLogList(generics.ListCreateAPIView):
    queryset = CardLog.objects.all()
    serializer_class = CardLogSerializer


class DeleteReasonList(generics.ListCreateAPIView):
    queryset = DeleteReason.objects.all()
    serializer_class = DeleteReasonSerializer


class CardTime(generics.ListCreateAPIView):
    queryset = CardLog.objects.all()
    serializer_class = CardLogSerializer

    def post(self, request, *args, **kwargs):
        from collections import defaultdict
        list_of_data = {}
        average_dict = defaultdict(list)
        cards_list = []
        for project in request.data["project_ids"]:
            project_cards = Card.objects.all().filter(project_id=project)

            if request.data["createdStart"] != None:
                createdStart = request.data["createdStart"]
                createdStop = request.data["createdStop"]
                project_cards = project_cards.filter(created_at__range = (createdStart, createdStop))

            if request.data["finishedStart"] != None:
                finishedStart = request.data["finishedStart"]
                finishedStop = request.data["finishedStop"]
                project_cards = project_cards.filter(completed_at__range=(finishedStart, finishedStop))

            if request.data["developmentStart"] != None:
                developmentStart = request.data["developmentStart"]
                developmentStop = request.data["developmentStop"]
                project_cards = project_cards.filter(started_at__range=(developmentStart, developmentStop))

            if request.data["sizeStart"] != None:
                sizeStart = request.data["sizeStart"]
                sizeStop = request.data["sizeStop"]
                project_cards = project_cards.filter(size__range=(sizeStart, sizeStop))

            card_types = request.data["types"]

            if "silver" in card_types:
                project_cards = project_cards.filter(type_silver=True)

            if "rejected" in card_types:
                project_cards = project_cards.filter(type_rejected=True)

            for card in project_cards:
                card_dict = {}
                card_dict["number"] = card.number
                card_dict["title"] = card.title
                card_dict["card_id"] = card.card_id
                card_logs = CardLog.objects.all().filter(card_id=card)
                card_dict["times"] = defaultdict(lambda: 0)
                if card_logs:
                    tmp_time = abs(card.created_at - card_logs[0].date).total_seconds() / 3600
                    card_dict["times"]["[" + str(card_logs[0].from_column_id.id) + "]" + " " + card_logs[0].from_column_id.title] += tmp_time
                    average_dict["[" + str(card_logs[0].from_column_id.id) + "]" + " " + card_logs[0].from_column_id.title].append(tmp_time)
                    previous = card_logs[0].date
                    for log in card_logs[1:]:
                        tmp_time = abs(previous - log.date).total_seconds() / 3600
                        card_dict["times"]["[" + str(log.from_column_id.id) + "]" + " " + log.from_column_id.title] += tmp_time
                        average_dict["[" + str(log.from_column_id.id) + "]" + " " + log.from_column_id.title].append(tmp_time)
                        previous = log.date
                times = []
                for key, item in card_dict["times"].items():
                    times.append([key, item])
                card_dict["times"] = times
                cards_list.append(card_dict)
        list_of_data["cards"] = cards_list
        averages = []
        for key, item in average_dict.items():
            averages.append([key, (sum(item) / float(len(item)))])
        list_of_data["average"] = averages

        return Response(list_of_data, status=status.HTTP_202_ACCEPTED)


class CardAbout(generics.ListCreateAPIView):
    """
    List all cards priority.
    """

    queryset = Card.objects.all()
    serializer_class = CardSerializer

    def get(self, request, **kwargs):
        card = Card.objects.get(pk=kwargs["pk"])

        card_user = UserSerializer(card.assigned_user_id).data
        card_delete_reason = DeleteReasonSerializer(card.delete_reason_id).data
        card_column = ColumnSerializer(card.column_id).data

        project = card.project_id
        group_memberships = DeveloperGroupMembership.objects.all()
        users = User.objects.all()
        cards = Card.objects.all()

        projects_data = []
        allowed_roles_query = group_memberships.filter(
            developer_group_id=project.developer_group_id.id)
        group_data = DeveloperGroupSerializer(
            project.developer_group_id).data
        project_data = ProjectSerializer(project).data
        project_cards = cards.filter(project_id=project.id)
        print(project_data)
        if not project_cards:
            project_data["card_active"] = False
        else:
            project_data["card_active"] = True
        project_data["group_data"] = group_data

        user_roles_dict = []
        for z in allowed_roles_query:
            user_roles = get_user_group_roles(z.id)
            user_details = users.filter(id=z.user_id.id)[0]
            user_data = UserSerializer(user_details).data
            user_data["allowed_group_roles"] = user_roles
            user_data["group_active"] = z.active
            user_roles_dict.append(user_data)
        group_data["users"] = user_roles_dict
        projects_data.append(project_data)

        card_priority_id = CardPrioritySerializer(card.card_priority_id).data

        card_tasks = []
        for task in Task.objects.filter(card_id=card):
            task_serializer = TaskSerializer(task).data
            task_serializer["card_id"] = CardSerializer(task.card_id).data
            task_serializer["assigned_user_id"] = UserSerializer(task.assigned_user_id).data
            card_tasks.append(task_serializer)

        card_wip_violations = []
        for wip_violation in WipViolation.objects.filter(card_id=card):
            wip_violation_serializer = WipViolationSerializer(wip_violation).data
            wip_violation_serializer["card_id"] = CardSerializer(wip_violation.card_id).data
            wip_violation_serializer["column_id"] = ColumnSerializer(wip_violation.column_id).data
            wip_violation_serializer["user_id"] = UserSerializer(wip_violation.user_id).data
            wip_violation_serializer["wip_violation_reason_id"] = WipViolationReasonSerializer(wip_violation.wip_violation_reason_id).data
            card_wip_violations.append(wip_violation_serializer)

        card_logs = []
        for card_log in CardLog.objects.filter(card_id=card):
            card_log_serializer = CardLogSerializer(card_log).data
            card_log_serializer["card_id"] = CardSerializer(card_log.card_id).data
            card_log_serializer["from_column_id"] = ColumnSerializer(card_log.from_column_id).data
            card_log_serializer["to_column_id"] = ColumnSerializer(card_log.to_column_id).data
            card_logs.append(card_log_serializer)

        card_serializer = CardSerializer(card).data
        card_serializer["assigned_user_id"] = card_user
        card_serializer["delete_reason_id"] = card_delete_reason
        card_serializer["column_id"] = card_column
        card_serializer["project_id"] = projects_data
        card_serializer["card_priority_id"] = card_priority_id
        card_serializer["tasks"] = card_tasks
        card_serializer["wip_violations"] = card_wip_violations
        card_serializer["logs"] = card_logs

        return Response(card_serializer, status=status.HTTP_202_ACCEPTED)


class UserGroups(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):
        user_id = kwargs["pk"]
        developer_group = DeveloperGroupMembership.objects.all().filter(user_id=user_id)
        developer_group_set = set()
        for groups in developer_group:
            developer_group_set.add(groups.developer_group_id.id)

        return Response(developer_group_set, status=status.HTTP_202_ACCEPTED)


class WipViolationList(generics.ListCreateAPIView):
    queryset = WipViolation.objects.all()
    serializer_class = WipViolationSerializer


class CopyBoard(generics.RetrieveUpdateDestroyAPIView):

    queryset = Board.objects.all()
    serializer_class = BoardSerializer


    def post(self, request, *args, **kwargs):
        board = Board.objects.get(pk=kwargs["pk"])
        all_columns = Column.objects.all().filter(board_id=kwargs["pk"])
        kopija_parent_columns = Column.objects.all().filter(board_id=kwargs["pk"]).filter(parent_column_id=None)
        kopija_child_columns = Column.objects.all().filter(board_id=kwargs["pk"]).filter(~Q(parent_column_id=None))

        parent_columns = Column.objects.all().filter(board_id=kwargs["pk"]).filter(parent_column_id=None)
        child_columns = Column.objects.all().filter(board_id=kwargs["pk"]).filter(~Q(parent_column_id=None))
        import random

        board.pk = None
        board.title = board.title + "_copy_" + str(random.randint(1, 1000))
        board.save()

        tmp = []
        a = Board.objects.all().order_by("-pk")[0]
        for i in parent_columns:
            i.pk = None
            i.board_id = a
            i.save()
            novi = Column.objects.all().order_by("-pk")[0]
            tmp.append(novi)

        bla = {}
        for x,y in list(zip(kopija_parent_columns, tmp)):
            bla[x.id] = y.id


        tmp2 = []

        for i in child_columns:
            i.pk = None
            i.board_id = a
            i.parent_column_id = Column.objects.get(pk=bla[i.parent_column_id.id])
            i.save()
            novi = Column.objects.all().order_by("-pk")[0]
            tmp2.append(novi)

        for x,y in list(zip(kopija_child_columns, tmp2)):
            bla[x.id] = y.id


        if board.type_priority_column_id is not None:
            board.type_priority_column_id = Column.objects.get(pk=bla[board.type_priority_column_id.id])

        if board.type_acceptance_testing_column_id is not None:
            board.type_acceptance_testing_column_id = Column.objects.get(pk=bla[board.type_acceptance_testing_column_id.id])

        if board.type_left_border_column_id is not None:
            board.type_left_border_column_id = Column.objects.get(pk=bla[board.type_left_border_column_id.id])

        if board.type_right_border_column_id is not None:
            board.type_right_border_column_id = Column.objects.get(pk=bla[board.type_right_border_column_id.id])

        board.save()

        return Response([], status=status.HTTP_202_ACCEPTED)
