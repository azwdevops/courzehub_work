from django.contrib.admin import ModelAdmin, register

from work.models import Organization, TaskAttachment, WorkerApplication, WorkerProfile, Task


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
    list_display = ('user',)


@register(Task)
class TaskAdmin(ModelAdmin):
    list_display = ('title',)
