from rest_framework.serializers import ModelSerializer, SerializerMethodField, SlugRelatedField

from work.models import Organization, Task, WorkerApplication, WorkerProfile, TaskSubmission


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

# organization admin create task serializer


class TaskSerializer(ModelSerializer):
    pesapal_transaction = SerializerMethodField('get_pesapal_details')

    class Meta:
        model = Task
        fields = ('id', 'title', 'user_minimum_rating',
                  'status', 'instructions', 'amount', 'payment_status', 'pesapal_transaction')

    # get pesapal details
    def get_pesapal_details(self, obj):
        # get all pesapal transactions that may be related to this task
        task_pesapals = (
            obj.task_pesapal_transaction.all().order_by('created'))
        if len(task_pesapals) > 0:
            return {
                'pesapal_transaction_tracking_id': task_pesapals[0].pesapal_transaction,
                'pesapal_merchant_reference': task_pesapals[0].merchant_reference
            }
        # if no pesapal transaction exists
        return None

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
        attachments = obj.task_attachments.filter(
            is_active=True).order_by('created_on')
        # for now we just picked the first attachment
        return attachments[0].attachment.url

# worker ongoing tasks serializer


class WorkerTaskSubmissionViewSerializer(ModelSerializer):
    task = SlugRelatedField(slug_field='title', read_only=True)
    attachment = SerializerMethodField('get_attachment_url')

    class Meta:
        model = TaskSubmission
        fields = ('id', 'task', 'attachment', 'taken_on',
                  'submission_status', 'submitted_on', 'submission_rating', 'review_notes')

    def get_attachment_url(self, obj):
        # task attachment defined by organization offering the task
        attachments = obj.task.task_attachments.filter(
            is_active=True).order_by('created_on')
        # for now we just picked the first attachment
        return attachments[0].attachment.url

# organization admin task submission serializer


class OrganizationAdminTaskSubmissionSerializer(ModelSerializer):
    task = SlugRelatedField(slug_field='title', read_only=True)
    attachment = SerializerMethodField('get_submission_attachment_url')

    class Meta:
        model = TaskSubmission
        fields = ('id', 'task', 'submitted_on',
                  'attachment', 'submission_rating', 'review_notes', 'submission_status')

    def get_submission_attachment_url(self, obj):
        attachments = obj.task_submission_attachments.filter(
            is_active=True).order_by('created_on')
        return attachments[0].attachment.url
