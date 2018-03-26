from django.db.models import *


class User(Model):
    id_user = AutoField(primary_key=True)
    name = CharField(max_length=100)
    surname = CharField(max_length=100)
    email = CharField(max_length=100)
    password = CharField(max_length=100)
    activate = BooleanField(default=False)
    display_critical_cards_n_days = IntegerField()


class Task(Model):
    id_task = AutoField(primary_key=True)
    id_card = ForeignKey('Card', on_delete=CASCADE)
    id_assigned_user = ForeignKey('User', on_delete=CASCADE)
    estimated_hours = IntegerField()
    description = CharField(max_length=400)
    done = BooleanField(default=False)


class WipViolation(Model):
    id_wip_violation = AutoField(primary_key=True)
    id_card = ForeignKey('Card', on_delete=CASCADE)
    id_column = ForeignKey('Column', on_delete=CASCADE)
    id_user = ForeignKey('User', on_delete=CASCADE)
    id_wip_violation_reason = ForeignKey('WipViolationReason', on_delete=CASCADE)
    date = DateTimeField()


class WipViolationReason(Model):
    id_wip_violation_reason = AutoField(primary_key=True)
    description = CharField(max_length=500)


class Card(Model):
    id_card = AutoField(primary_key=True)
    id_assigned_user = ForeignKey('User', on_delete=CASCADE)
    id_delete_reason = ForeignKey('DeleteReason', on_delete=CASCADE)
    id_column = ForeignKey('Column', on_delete=CASCADE)
    id_project = ForeignKey('Project', on_delete=CASCADE)
    id_card_priority = ForeignKey('CardPriority', on_delete=CASCADE)
    active = BooleanField(default=False)
    title = CharField(max_length=100)
    description = CharField(max_length=1024)
    size = FloatField()
    number = IntegerField()
    type_silver = BooleanField(default=False)
    type_rejected = BooleanField(default=False)
    created_at = DateTimeField()
    completed_at = DateTimeField()
    started_at = DateTimeField()
    deadline = DateField()
    display_offset = IntegerField()


class CardLog(Model):
    id_card_log = AutoField(primary_key=True)
    id_card = ForeignKey('Card', on_delete=CASCADE)
    id_from_column = ForeignKey('Column', related_name='card_log_from_column', on_delete=CASCADE)
    id_to_column = ForeignKey('Column', related_name='card_log_to_column', on_delete=CASCADE)
    date = DateTimeField()


class DeleteReason(Model):
    id_delete_reason = AutoField(primary_key=True)
    description = CharField(max_length=1024)


class CardPriority(Model):
    id_card_priority = AutoField(primary_key=True)
    value = IntegerField()
    title = CharField(max_length=50)


class DeveloperGroup(Model):
    id_developer_group = AutoField(primary_key=True)
    title = CharField(max_length=100)


class DeveloperGroupMembership(Model):
    id_developer_group_membership = AutoField(primary_key=True)
    id_user = ForeignKey('User', on_delete=CASCADE)
    id_developer_group = ForeignKey('DeveloperGroup', on_delete=CASCADE)
    created_at = DateTimeField()
    deleted_at = DateTimeField()
    active = BooleanField(default=False)


class Role(Model):
    id_role = AutoField(primary_key=True)
    title = CharField(max_length=100)


class AllowedRole(Model):
    class Meta:
        unique_together = (('id_user', 'id_role'),)

    id_user = ForeignKey('User', on_delete=CASCADE)
    id_role = ForeignKey('Role', on_delete=CASCADE)


class GroupRole(Model):
    id_group_role = AutoField(primary_key=True)
    id_developer_group_membership = ForeignKey('DeveloperGroupMembership', on_delete=CASCADE)
    id_role = ForeignKey('Role', on_delete=CASCADE)


class Board(Model):
    id_board = AutoField(primary_key=True)
    title = CharField(max_length=100)
    id_type_priority_column = ForeignKey('Column', related_name='type_priority_column', on_delete=CASCADE)
    id_type_acceptance_testing_column = ForeignKey('Column', related_name='type_acceptance_testing_column', on_delete=CASCADE)
    id_type_left_border_column = ForeignKey('Column', related_name='type_left_border_column', on_delete=CASCADE)
    id_type_right_border_column = ForeignKey('Column', related_name='type_right_border_column', on_delete=CASCADE)
    notify_overdue_n_days = IntegerField()
    display_priority = BooleanField(default=False)
    display_size = BooleanField(default=False)
    display_deadline = BooleanField(default=False)


class Column(Model):
    id_column = AutoField(primary_key=True)
    id_parent_column = ForeignKey('self', on_delete=CASCADE)
    id_board = ForeignKey(Board, on_delete=CASCADE)
    wip_restriction = FloatField()
    display_offset = IntegerField()
    title = CharField(max_length=100)


class ColumnPermissions(Model):
    id_column_permissions = AutoField(primary_key=True)
    id_from_column = ForeignKey('Column', related_name='column_permissions_from_column', on_delete=CASCADE)
    id_to_column = ForeignKey('Column', related_name='column_permission_to_column', on_delete=CASCADE)
    id_role = ForeignKey('Role', on_delete=CASCADE)
    allow = BooleanField(default=False)


class Project(Model):
    id_project = CharField(max_length=500, primary_key=True)
    id_developer_group = ForeignKey('DeveloperGroup', on_delete=CASCADE)
    id_board = ForeignKey('Board', on_delete=CASCADE)
    title = CharField(max_length=300)
    started_at = DateField()
    ended_at = DateField()
    active = BooleanField(default=False)






