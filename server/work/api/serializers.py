from re import L
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from work.models import Organization, Task, WorkerApplication, WorkerProfile


# create organization serializer
class OrganizationSerializer(ModelSerializer):
    organization_admin_email = SerializerMethodField('organization_admin')

    class Meta:
        model = Organization
        fields = ('id', 'name', 'initials', 'organization_admin_email')

    def organization_admin(self, obj):
        if obj.organization_admin:
            return obj.organization_admin.email
        else:
            return None

# create task serializer


class TaskSerializer(ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'title', 'user_minimum_rating',
                  'status', 'instructions')

# worker application serializer


class WorkerApplicationSerializer(ModelSerializer):
    class Meta:
        model = WorkerApplication
        fields = ('id', 'status', 'mpesa_number',
                  'national_id', 'about_worker', 'occupation')

# worker application view serializer


class WorkerApplicationViewSerializer(ModelSerializer):
    full_name = SerializerMethodField('get_name')

    class Meta:
        model = WorkerApplication
        fields = ('id', 'status', 'mpesa_number',
                  'national_id', 'about_worker', 'occupation', 'full_name', 'applied_on', 'rejection_reason')

    def get_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'


class WorkerProfileSerializer(ModelSerializer):
    full_name = SerializerMethodField('get_name')

    class Meta:
        model = WorkerProfile
        fields = ('id', 'full_name')

    def get_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'

# worker task view serializer


class WorkerTaskViewSerializer(ModelSerializer):
    attachment = SerializerMethodField('get_attachment_url')

    class Meta:
        model = Task
        fields = ('id', 'title', 'instructions', 'attachment')

    def get_attachment_url(self, obj):
        attachments = obj.task_attachments.all()
        # for now we just picked the first attachment
        return attachments[0].attachment.url
