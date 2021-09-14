from django.contrib.admin import ModelAdmin, register

from work.models import Organization, TaskAttachment, WorkerApplication, WorkerProfile, Task, TaskSubmission,\
    TaskSubmissionAttachment


@register(Organization)
class OrganizationAdmin(ModelAdmin):
    list_display = ('name', 'organization_admin')
    list_editable = ('organization_admin',)


@register(TaskAttachment)
class TaskAttachmentAdmin(ModelAdmin):
    list_display = ('task', 'attachment')


@register(WorkerApplication)
class WorkApplicationAdmin(ModelAdmin):
    list_display = ('user', 'status')


@register(WorkerProfile)
class WorkerProfileAdmin(ModelAdmin):
    list_display = ('user', 'is_active', 'profile_status')
    list_editable = ('is_active',)


@register(Task)
class TaskAdmin(ModelAdmin):
    list_display = ('id', 'title', 'status', 'amount', 'payment_status')
    list_editable = ('status', 'amount', 'payment_status')


@register(TaskSubmission)
class TaskSubmissionAdmin(ModelAdmin):
    list_display = ('task', 'submission_status')
    list_editable = ('submission_status',)


@register(TaskSubmissionAttachment)
class TaskSubmissionAttachmentAdmin(ModelAdmin):
    list_display = ('task_submission', 'is_active')
