from rest_framework import serializers
from . models import User, Role, AllowedRole, DeveloperGroup


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