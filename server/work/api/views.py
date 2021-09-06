from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.views import get_object_or_none, verify_user, invalid_user, invalid_serializer, permission_denied, invalid_organization,\
    file_size_okay, file_type_okay
from work.api.serializers import OrganizationSerializer, TaskSerializer, WorkerApplicationSerializer, WorkerProfileSerializer,\
    WorkerApplicationViewSerializer, WorkerTaskViewSerializer
from work.models import Organization, TaskAttachment, Task, WorkerApplication, WorkerProfile

User = get_user_model()


# view for organization
class OrganizationView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, **kwargs):
        userId = kwargs['userId']
        user = verify_user(request, userId)

        if not user:
            return invalid_user()

        data = request.data
        # check if organization name and initials are unique
        name_taken = get_object_or_none(
            Organization, name__iexact=data['name'])
        initials_taken = get_object_or_none(
            Organization, initials__iexact=data['initials'])

        if name_taken:
            return Response({'detail': 'Organization with that name exists'}, status=400)
        if initials_taken:
            return Response({'detail': 'Organization with those initials exists'}, status=400)

        serializer = OrganizationSerializer(data=data)

        if serializer.is_valid():
            organization = serializer.save()
            organization.created_by = user
            organization.save()
            organization_data = OrganizationSerializer(organization).data
            return Response({'detail': 'Organization created successfully', 'organization_data': organization_data}, status=201)
        else:
            return invalid_serializer()

    def get(self, request, **kwargs):
        userId = kwargs['userId']
        user = verify_user(request, userId)

        if not user:
            return invalid_user()
        organizations = Organization.objects.all()
        organizations_data = OrganizationSerializer(
            organizations, many=True).data

        return Response({'detail': 'success', 'organizations_data': organizations_data})

    def patch(self, request, **kwargs):
        userId = kwargs['userId']
        user = verify_user(request, userId)

        if not user:
            return invalid_user()

        if user.profile_type != 'System Admin':
            return permission_denied()

        data = request.data
        organization = get_object_or_none(
            Organization, id=data['organizationId'])
        if not organization:
            return invalid_organization()
        action_type = data['actionType']

        # add organization admin here
        if action_type == 'add_organization_admin':
            data_kwargs = {
                'organization': organization,
                'userEmail': data['userEmail']
            }
            return self.add_organization_admin(**data_kwargs)
        elif action_type == 'remove_organization_admin':
            data_kwargs = {
                'organization': organization
            }
            return self.remove_organization_admin(**data_kwargs)
        elif action_type == 'edit_organization':
            pass

    # method to add organization admin in the patch method
    def add_organization_admin(self, **kwargs):
        organization = kwargs['organization']

        if organization.organization_admin:
            return Response({'detail': 'Admin already exists for this organization'}, status=400)

        admin_to_add = get_object_or_none(
            User, email__iexact=kwargs['userEmail'])
        if not admin_to_add:
            return Response({'detail': 'Invalid email specified'}, status=400)
        already_admin = get_object_or_none(
            Organization, organization_admin=admin_to_add)
        if already_admin:
            return Response({'detail': 'That user is already an organization admin'}, status=400)
        organization.organization_admin = admin_to_add
        organization.save()
        organization.organization_admin.profile_type = 'Organization Admin'
        organization.organization_admin.save()

        updated_organization = OrganizationSerializer(
            kwargs['organization']).data
        return Response({'detail': 'Organization admin added successfully', 'updated_organization': updated_organization}, status=200)

    # method to remove organization admin in the patch method
    def remove_organization_admin(self, **kwargs):
        organization = kwargs['organization']
        if not organization.organization_admin:
            return Response({'detail': 'This organization has no admin'}, status=400)
        organization.organization_admin.profile_type = None
        organization.organization_admin.save()

        organization.organization_admin = None
        organization.save()
        updated_organization = OrganizationSerializer(
            organization).data

        return Response({'detail': 'Organization admin removed', 'updated_organization': updated_organization}, status=200)


# view for organization admin task related issues
class OrganizationTaskView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, **kwargs):
        is_organization_admin = self.verify_organization_admin(
            request, kwargs['userId'])
        if not is_organization_admin[1]:
            return Response({'detail': is_organization_admin[0]}, status=400)

        attachment = request.FILES['attachment']
        if not attachment:
            return Response({'detail': 'Please upload a valid attachment'}, status=400)
        right_file_type = file_type_okay(attachment)
        right_file_size = file_size_okay(attachment)
        if not right_file_type[1]:
            return Response({'detail': right_file_type[0]}, status=400)
        if not right_file_size[1]:
            return Response({'detail': right_file_size[0]}, status=400)

        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save()
            task.created_by = is_organization_admin[0]
            task.is_active = True
            task.organization = is_organization_admin[1]
            task.save()
            # create an entry for the attachment
            TaskAttachment.objects.create(task=task, attachment=attachment)
            new_task = TaskSerializer(task).data
            return Response({'detail': 'Task created successfully', 'new_task': new_task}, status=201)

        else:
            return invalid_serializer()
    # get all tasks

    def get(self, request, **kwargs):
        is_organization_admin = self.verify_organization_admin(
            request, kwargs['userId'])
        if not is_organization_admin[1]:
            return Response({'detail': is_organization_admin[0]}, status=400)

        tasks = Task.objects.filter(organization=is_organization_admin[1])
        tasks_data = TaskSerializer(tasks, many=True).data

        return Response({'detail': 'success', 'tasks_data': tasks_data}, status=200)

    # edit task details
    def patch(self, request, **kwargs):
        is_organization_admin = self.verify_organization_admin(
            request, kwargs['userId'])
        if not is_organization_admin[1]:
            return Response({'detail': is_organization_admin[0]}, status=400)

        data = request.data
        task = get_object_or_none(Task, id=data['taskId'])
        attachment = request.data['attachment']
        print(data)

        # check if user is changing attachment
        if attachment != '':
            right_file_type = file_type_okay(attachment)
            right_file_size = file_size_okay(attachment)
            if not right_file_type[1]:
                return Response({'detail': right_file_type[0]}, status=400)
            if not right_file_size[1]:
                return Response({'detail': right_file_size[0]}, status=400)
            serializer = TaskSerializer(task, data=data)
            if serializer.is_valid():
                task = serializer.save()
                # delete the current attachment first, at this point we only have one attachment
                current_attachment = TaskAttachment.objects.filter(task=task)[
                    0]
                current_attachment.attachment.delete()
                current_attachment.attachment = attachment
                current_attachment.save()

            else:
                return invalid_serializer()
        else:
            serializer = TaskSerializer(task, data=data)
            if serializer.is_valid():
                task = serializer.save()
        # now serialize the update task
        updated_task = TaskSerializer(task).data
        return Response({'detail': 'Task updated successfully', 'updated_task': updated_task}, status=200)

    # method to verify user is an organization admin

    def verify_organization_admin(self, request, userId):
        user = verify_user(request, userId)

        if not user:
            return 'Permission denied', False
        organization = get_object_or_none(
            Organization, organization_admin=user)
        if not organization:
            return 'Permission denied', False
        return user, organization


# worker application view
class WorkerApplicationView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, **kwargs):
        userId = kwargs['userId']
        user = verify_user(request, userId)

        if not user:
            return invalid_user()
        application_exists = get_object_or_none(WorkerApplication, user=user)
        if application_exists:
            return Response({'detail': 'You already have an ongoing worker application being reviewed'}, status=400)
        data = request.data
        serializer = WorkerApplicationSerializer(data=data)
        if serializer.is_valid():
            worker_application = serializer.save()
            worker_application.user = user
            worker_application.save()
            return Response({'detail': 'Application successfully submitted'}, status=201)
        else:
            return invalid_serializer()

    def get(self, request, **kwargs):
        userId = kwargs['userId']
        user = verify_user(request, userId)

        if not user:
            return invalid_user()
        if user.profile_type != 'System Admin':
            return Response({'detail': 'Permission denied'}, status=400)
        workers = WorkerProfile.objects.all()
        workers_applications = WorkerApplication.objects.all()

        workers_data = WorkerProfileSerializer(workers, many=True).data
        workers_applications_data = WorkerApplicationViewSerializer(
            workers_applications, many=True).data

        response_data = {
            'workers': workers_data,
            'workers_applications': workers_applications_data
        }
        return Response({'detail': 'success', **response_data}, status=200)

    def patch(self, request, **kwargs):
        userId = kwargs['userId']
        user = verify_user(request, userId)

        if not user:
            return invalid_user()
        if user.profile_type != 'System Admin':
            return Response({'detail': 'Permission denied'}, status=400)
        data = request.data

        # check if it's application or worker being edited

        if data['worker_or_application'] == 'application':
            application = get_object_or_none(
                WorkerApplication, id=data['applicationId'])
            if not application:
                return Response({'detail': 'Invalid worker application'}, status=400)
            application.rejection_reason = data['rejection_reason']
            application.status = data['status']
            application.save()
            application_data = WorkerApplicationViewSerializer(
                application).data

            # create worker profile if application approved
            if application.status == 'approved':
                worker_profile = self.create_worker_profile(application.user)
                worker_data = WorkerProfileSerializer(worker_profile).data
                # where both worker and application are being edited
                updated_application = {
                    **application_data,
                    'worker_data': worker_data,
                    'action_type': 'worker_and_application'
                }
            else:
                # where only application is being edited
                updated_application = {
                    **application_data,
                    'action_type': 'worker_application'
                }
            return Response({'detail': 'Application edited successfully', 'updated_application': updated_application}, status=200)
        elif data['worker_or_application'] == 'worker':
            pass
    # method to create worker profile if approved

    def create_worker_profile(self, user):
        worker_profile = get_object_or_none(WorkerProfile, user=user)
        if not worker_profile:
            worker_profile = WorkerProfile.objects.create(
                user=user
            )
            user.profile_type = 'Worker'
            user.save()
        return worker_profile

# worker get available tasks


class WorkerTasksAvailableView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, **kwargs):
        userId = kwargs['userId']
        user = verify_user(request, userId)

        if not user:
            return invalid_user()

        worker_profile = get_object_or_none(WorkerProfile, user=user)
        if user.profile_type != 'Worker' or not worker_profile:
            return Response({'detail': 'Permission denied'}, status=400)

        tasks_available = Task.objects.filter(
            is_active=True, status='available', user_minimum_rating__lte=worker_profile.overall_rating)
        tasks_available_data = WorkerTaskViewSerializer(
            tasks_available, many=True).data

        return Response({'detail': 'success', 'available_tasks': tasks_available_data}, status=200)
