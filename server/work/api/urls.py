from django.urls import path

from work.api import views


urlpatterns = (
    path('maintain-organizations/<uuid:userId>/',
         views.OrganizationView.as_view(), name='maintain_organizations'),
    path('maintain-organization-tasks/<uuid:userId>/',
         views.OrganizationTaskView.as_view(), name='maintain_tasks'),
    path('worker-application/<uuid:userId>/',
         views.WorkerApplicationView.as_view(), name='worker_application'),
    path('worker-get-tasks-available/<uuid:userId>/',
         views.WorkerTasksAvailableView.as_view(), name='worker_get_tasks_available')
)
