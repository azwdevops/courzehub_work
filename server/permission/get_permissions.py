from rest_framework.permissions import BasePermission
from django.contrib.auth.models import Permission
from django.db.models import Q

from django.contrib.contenttypes.models import ContentType


from core.views import get_object_or_none

# has_permission check function
# we use the user, permission codename and model name to check if user has permission on model


def check_permission(app_name, model, codename, user):
    # test if user has permission directly
    user_permission = get_object_or_none(
        Permission, user=user, codename=codename, content_type__model=model, content_type__app_label=app_name)
    if user_permission:
        return True
    groups = user.groups.all()
    # if user has no direct permission, test if user has group permission
    for group in groups:
        group_permission = user_permission = get_object_or_none(
            Permission, group=group, codename=codename, content_type__model=model, content_type__app_label=app_name)
        if group_permission:
            return True
    # at this point the user has neither group nor individual permission
    return False
