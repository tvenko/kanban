from django.db.models import *


class User(Model):
    name = CharField(max_length=100)
    surname = CharField(max_length=100)
    email = CharField(max_length=100)
    password = CharField(max_length=100)
    activate = BooleanField(default=False)
    display_critical_cards_n_days = IntegerField()


class Task(Model):
    card_id = ForeignKey('Card', on_delete=CASCADE)
    assigned_user_id = ForeignKey('User', on_delete=CASCADE)
    estimated_hours = IntegerField()
    description = CharField(max_length=400)
    done = BooleanField(default=False)


class WipViolation(Model):
    card_id = ForeignKey('Card', on_delete=CASCADE)
    column_id = ForeignKey('Column', on_delete=CASCADE)
    user_id = ForeignKey('User', on_delete=CASCADE)
    wip_violation_reason_id = ForeignKey('WipViolationReason', on_delete=CASCADE)
    date = DateTimeField()


class WipViolationReason(Model):
    description = CharField(max_length=500)


class Card(Model):
    card_id = AutoField(primary_key=True)
    assigned_user_id = ForeignKey('User', on_delete=CASCADE)
    delete_reason_id = ForeignKey('DeleteReason', on_delete=CASCADE)
    column_id = ForeignKey('Column', on_delete=CASCADE)
    project_id = ForeignKey('Project', on_delete=CASCADE)
    card_priority_id = ForeignKey('CardPriority', on_delete=CASCADE)
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
    card_id = ForeignKey('Card', on_delete=CASCADE)
    from_column_id = ForeignKey('Column', related_name='card_log_from_column', on_delete=CASCADE)
    to_column_id = ForeignKey('Column', related_name='card_log_to_column', on_delete=CASCADE)
    date = DateTimeField()


class DeleteReason(Model):
    description = CharField(max_length=1024)


class CardPriority(Model):
    value = IntegerField()
    title = CharField(max_length=50)


class DeveloperGroup(Model):
    title = CharField(max_length=100)


class DeveloperGroupMembership(Model):
    user_id = ForeignKey('User', on_delete=CASCADE)
    developer_group_id = ForeignKey('DeveloperGroup', on_delete=CASCADE)
    created_at = DateTimeField()
    deleted_at = DateTimeField()
    active = BooleanField(default=False)


class Role(Model):
    title = CharField(max_length=100)


class AllowedRole(Model):
    class Meta:
        unique_together = (('user_id', 'role_id'),)

    user_id = ForeignKey('User', on_delete=CASCADE)
    role_id = ForeignKey('Role', on_delete=CASCADE)


class GroupRole(Model):
    developer_group_membership_id = ForeignKey('DeveloperGroupMembership', on_delete=CASCADE)
    role_id = ForeignKey('Role', on_delete=CASCADE)


class Board(Model):
    title = CharField(max_length=100)
    type_priority_column_id = ForeignKey('Column', related_name='type_priority_column', on_delete=CASCADE)
    type_acceptance_testing_column_id = ForeignKey('Column', related_name='type_acceptance_testing_column', on_delete=CASCADE)
    type_left_border_column_id = ForeignKey('Column', related_name='type_left_border_column', on_delete=CASCADE)
    type_right_border_column_id = ForeignKey('Column', related_name='type_right_border_column', on_delete=CASCADE)
    notify_overdue_n_days = IntegerField()
    display_priority = BooleanField(default=False)
    display_size = BooleanField(default=False)
    display_deadline = BooleanField(default=False)


class Column(Model):
    parent_column_id = ForeignKey('self', on_delete=CASCADE)
    board_id = ForeignKey(Board, on_delete=CASCADE)
    wip_restriction = FloatField()
    display_offset = IntegerField()
    title = CharField(max_length=100)


class ColumnPermissions(Model):
    from_column_id = ForeignKey('Column', related_name='column_permissions_from_column', on_delete=CASCADE)
    to_column_id = ForeignKey('Column', related_name='column_permission_to_column', on_delete=CASCADE)
    role_id = ForeignKey('Role', on_delete=CASCADE)
    allow = BooleanField(default=False)


class Project(Model):
    id_project = CharField(max_length=500, primary_key=True)
    developer_group_id = ForeignKey('DeveloperGroup', on_delete=CASCADE)
    board_id = ForeignKey('Board', on_delete=CASCADE)
    title = CharField(max_length=300)
    started_at = DateField()
    ended_at = DateField()
    active = BooleanField(default=False)






