from rest_framework import serializers
from . models import User, Role, AllowedRole, DeveloperGroup, DeveloperGroupMembership


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'


class RoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Role
        fields = '__all__'


class AllowedRoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = AllowedRole
        fields = '__all__'


class DeveloperGroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = DeveloperGroup
        fields = '__all__'

class DeveloperGroupMembershipSerializer(serializers.ModelSerializer):

    class Meta:
        model = DeveloperGroupMembership
        fields = '__all__'