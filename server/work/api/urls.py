from django.urls import path

from work.api import views


urlpatterns = (
    path('maintain-organizations/<uuid:userId>/',
         views.OrganizationView.as_view(), name='maintain_organizations'),
    path('maintain-organization-tasks/<uuid:userId>/',
         views.OrganizationTaskView.as_view(), name='maintain_tasks'),
    path('worker-application/<uuid:userId>/',
         views.WorkerApplicationView.as_view(), name='worker_application'),
    path('worker-tasks-available/<uuid:userId>/',
         views.WorkerTasksAvailableView.as_view(), name='worker_tasks_available'),
    path('worker-tasks-ongoing/<uuid:userId>/',
         views.WorkerTasksOngoingView.as_view(), name='worker_tasks_ongoing'),
    path('worker-tasks-submitted/<uuid:userId>/',
         views.WorkerTasksSubmittedView.as_view(), name='worker_tasks_submitted'),
    path('organization-admin-maintain-task-submissions/<uuid:userId>/<uuid:taskId>/',
         views.OrganizationAdminTaskSubmissionsView.as_view(), name='organization_admin_tasks_submissions')
)
