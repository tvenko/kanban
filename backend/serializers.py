from rest_framework import serializers
from . models import User, Role, AllowedRole, DeveloperGroup, DeveloperGroupMembership, Project, Column, Board, Card


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == 'password':
                if value != getattr(instance, "password"):
                    instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance


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


class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = '__all__'


class ColumnSerializer(serializers.ModelSerializer):

    class Meta:
        model = Column
        fields = '__all__'


class BoardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Board
        fields = '__all__'

class CardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Card
        fields = '__all__'
