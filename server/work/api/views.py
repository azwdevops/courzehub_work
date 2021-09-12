import random
from decimal import Decimal as D
from random import randint
from datetime import datetime
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.views import get_object_or_none, verify_user, invalid_user, invalid_serializer, permission_denied, invalid_organization,\
    file_size_okay, file_type_okay, enfore_double_entry_rule
from work.api.serializers import OrganizationSerializer, TaskSerializer, WorkerApplicationSerializer, WorkerProfileSerializer,\
    WorkerApplicationViewSerializer, WorkerTaskViewSerializer, WorkerTaskSubmissionViewSerializer,\
    OrganizationAdminTaskSubmissionSerializer
from work.models import Organization, TaskAttachment, Task, TaskSubmission, WorkerApplication, WorkerProfile, \
    TaskSubmissionAttachment
from accounting.models import BaseTransaction, LedgerGroup, Ledger, TransactionItem

User = get_user_model()

# validate worker exists, they are active and not suspended or disabled

# REUSABLE FUNCTIONS


def valid_worker(request, userId):
    user = verify_user(request, userId)

    if not user:
        return False, "Invalid authentication provided"

    worker_profile = get_object_or_none(
        WorkerProfile, user=user, profile_status='active', is_active=True)
    if user.profile_type != 'Worker' or not worker_profile:
        return False, "Permission denied"
    # if successful return user and True
    return True, user, worker_profile

   # method to verify user is an organization admin


def verify_organization_admin(request, userId):
    user = verify_user(request, userId)

    if not user:
        return False, 'Permission denied'
    organization = get_object_or_none(
        Organization, organization_admin=user)
    if not organization:
        return False, 'Permission denied'
    return True, user, organization

# END OF REUSABLE FUNCTIONS

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
        is_organization_admin = verify_organization_admin(
            request, kwargs['userId'])
        if not is_organization_admin[0]:
            return Response({'detail': is_organization_admin[1]}, status=400)

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
            task.created_by = is_organization_admin[1]
            task.is_active = True
            task.organization = is_organization_admin[2]
            task.save()
            # create an entry for the attachment
            TaskAttachment.objects.create(task=task, attachment=attachment)
            new_task = TaskSerializer(task).data

            # generate a random invoice number to use as a merchant reference
            invoice_number = randint(1, 10000000)

            response_data = {
                'detail': 'Task created successfully, proceed to make payment',
                'new_task': new_task,
                'merchant_ref': invoice_number,
                'taskId': task.id,
                'taskAmount': task.amount
            }
            return Response({**response_data}, status=201)

        else:
            return invalid_serializer()
    # get all tasks

    def get(self, request, **kwargs):
        is_organization_admin = verify_organization_admin(
            request, kwargs['userId'])
        if not is_organization_admin[0]:
            return Response({'detail': is_organization_admin[1]}, status=400)

        tasks = Task.objects.filter(organization=is_organization_admin[2])
        tasks_data = TaskSerializer(tasks, many=True).data

        return Response({'detail': 'success', 'tasks_data': tasks_data}, status=200)

    # edit task details
    def patch(self, request, **kwargs):
        is_organization_admin = verify_organization_admin(
            request, kwargs['userId'])
        if not is_organization_admin[0]:
            return Response({'detail': is_organization_admin[1]}, status=400)

        data = request.data
        task = get_object_or_none(Task, id=data['taskId'])
        attachment = request.data['attachment']

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

                # create worker ledger
                """
                    user => this is the one approving the worker application, i.e the System Admin mostly
                    application.user => user applying to become a worker
                """
                self.create_worker_ledger(user, application.user)

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

        # this may be used to make changes in worker profile such as suspending a worker or disabling their account
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

    # method to create worker ledger
    def create_worker_ledger(self, user, worker):
        ledger_kwargs = {
            'ledger_group': get_object_or_none(LedgerGroup, name__iexact='Worker Payables'),
            'name': f'{worker.username} payable ledger',
            'user_ledger': worker,
            'created_by': user,
            'description': 'Worker payable ledger',
            'is_balance_sheet_item': True,
        }
        Ledger.objects.create(**ledger_kwargs)

# worker get available tasks


class WorkerTasksAvailableView(APIView):
    permission_classes = (IsAuthenticated,)

    # method for worker to accept a task and start working on it
    def post(self, request, **kwargs):
        # get valid worker return values
        is_valid_worker = valid_worker(request, kwargs['userId'])
        if not is_valid_worker[0]:
            response_message = is_valid_worker[1]
            return Response({'detail': response_message}, status=400)
        user = is_valid_worker[1]
        data = request.data
        task = get_object_or_none(Task, id=data['taskId'])

        if task.status != 'available':
            return Response({'detail': 'That task is already taken'}, status=400)

        ongoing_tasks = TaskSubmission.objects.filter(
            submitted_by=user, submission_status='draft')
        if len(ongoing_tasks) > 0:
            return Response({'detail': 'You have an ongoing task. You can only work on one task at a time'}, status=400)

        # change task status to taken
        task.status = 'taken'
        task.save()
        # create a draft task submission
        TaskSubmission.objects.create(
            task=task,
            submitted_by=user
        )
        return Response({'detail': 'Task accepted, open attachment to proceed', 'taskId': task.id}, status=200)

    def get(self, request, **kwargs):
        # get valid worker return values
        is_valid_worker = valid_worker(request, kwargs['userId'])
        if not is_valid_worker[0]:
            response_message = is_valid_worker[1]
            return Response({'detail': response_message}, status=400)

        worker_rating = is_valid_worker[2].average_overall_rating
        """
            status - regulates if organization admininstering the task has made it available for workers
            payment_status - This is CourZe Hub Work regulating available tasks to workers based on whether
            the organization that has offered this work has paid for them to be done by workers
        """
        tasks_available = Task.objects.filter(
            is_active=True, status='available', payment_status='paid', user_minimum_rating__lte=worker_rating)

        # for now we load a set of 20 random tasks if tasks are more than 25 else we load all tasks
        if len(tasks_available) > 20:
            random_sample_tasks = random.sample(list(tasks_available), 20)
        else:
            random_sample_tasks = tasks_available
        tasks_available_data = WorkerTaskViewSerializer(
            random_sample_tasks, many=True).data

        return Response({'detail': 'success', 'available_tasks': tasks_available_data}, status=200)

# worker ongoing tasks get and submit work


class WorkerTasksOngoingView(APIView):
    permission_classes = (IsAuthenticated,)

    # post to handle worker task submission
    def post(self, request, **kwargs):
        # get valid worker return values
        is_valid_worker = valid_worker(request, kwargs['userId'])
        if not is_valid_worker[0]:
            response_message = is_valid_worker[1]
            return Response({'detail': response_message}, status=400)
        data = request.data
        task_submission = get_object_or_none(TaskSubmission, id=data['taskId'])
        if not task_submission:
            return Response({'detail': 'Invalid task submitted'}, status=400)
        if task_submission.submission_status != 'draft':
            return Response({'detail': 'Permission to submit task denied'}, status=400)

          # validate attachment details
        attachment = request.FILES['attachment']
        if not attachment:
            return Response({'detail': 'Please upload a valid attachment'}, status=400)
        right_file_type = file_type_okay(attachment)
        right_file_size = file_size_okay(attachment)
        if not right_file_type[1]:
            return Response({'detail': right_file_type[0]}, status=400)
        if not right_file_size[1]:
            return Response({'detail': right_file_size[0]}, status=400)

        # create a submission attachment
        TaskSubmissionAttachment.objects.create(
            task_submission=task_submission,
            attachment=attachment
        )
        # update task submission details
        task_submission.submitted_on = datetime.now()
        task_submission.submission_status = 'submitted'
        task_submission.save()
        return Response({'detail': 'Task submitted successfully', 'taskId': task_submission.id}, status=200)

    def get(self, request, **kwargs):
        # get valid worker return values
        is_valid_worker = valid_worker(request, kwargs['userId'])
        if not is_valid_worker[0]:
            response_message = is_valid_worker[1]
            return Response({'detail': response_message}, status=400)
        user = is_valid_worker[1]
        ongoing_tasks = TaskSubmission.objects.filter(
            submitted_by=user, submission_status='draft')
        ongoing_tasks_data = WorkerTaskSubmissionViewSerializer(
            ongoing_tasks, many=True).data

        return Response({'detail': 'success', 'ongoing_tasks': ongoing_tasks_data}, status=200)

# view for submitted tasks


class WorkerTasksSubmittedView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, **kwargs):
        # get valid worker return values
        is_valid_worker = valid_worker(request, kwargs['userId'])
        if not is_valid_worker[0]:
            response_message = is_valid_worker[1]
            return Response({'detail': response_message}, status=400)
        user = is_valid_worker[1]
        # for now we load 50 until we implement filtering
        # we load all tasks which are not draft
        submitted_tasks = TaskSubmission.objects.filter(
            submitted_by=user).exclude(submission_status='draft')[:50]
        submitted_tasks_data = WorkerTaskSubmissionViewSerializer(
            submitted_tasks, many=True).data

        return Response({'detail': 'success', 'submitted_tasks': submitted_tasks_data}, status=200)

# organization admin maintain tasks submitted by workers


class OrganizationAdminTaskSubmissionsView(APIView):
    permission_classes = (IsAuthenticated,)

    # post method for organization admin to rate task submissions
    def post(self, request, **kwargs):
        is_organization_admin = verify_organization_admin(
            request, kwargs['userId'])

        if not is_organization_admin[0]:
            return Response({'detail': is_organization_admin[1]}, status=400)
        data = request.data
        # note taskId here denotes currentTaskSubmissionId
        task_submission = get_object_or_none(
            TaskSubmission, id=kwargs['taskId'])
        if not task_submission:
            return Response({'detail': 'Invalid task submission'}, status=400)
        serializer = OrganizationAdminTaskSubmissionSerializer(
            task_submission, data=data)

        if serializer.is_valid():
            task_submission = serializer.save()
            task_submission.reviewed_on = datetime.now()
            task_submission.reviewed_by = is_organization_admin[1]
            task_submission.save()

            # update worker rating, this function call may change if we allow requesting work amendment before rating it
            worker_rating_kwargs = {
                'task_submission': task_submission
            }
            self.update_worker_rating(**worker_rating_kwargs)

            # before we post any transaction, first confirm worker exists
            worker_profile = get_object_or_none(
                WorkerProfile, user=task_submission.submitted_by)

            if worker_profile:
                if task_submission.submission_status == 'approved':
                    # make the task complete
                    task_submission.task.status = 'completed'
                    task_submission.task.save()
                    # post worker earnings and CourZe Hub Work commission fees
                    base_transaction_kwargs = {
                        'task_submission': task_submission,
                        'task': task_submission.task,
                        'amount': D(task_submission.task.amount),
                        'worker_profile': worker_profile
                    }
                    self.base_transaction_recognize_worker_earnings_and_courzehub_commission_fees(
                        **base_transaction_kwargs)
                elif task_submission.submission_status == 'rejected':
                    # return task to be available to be done by other workers
                    task_submission.task.status = 'available'
                    task_submission.task.save()

            rated_submission = OrganizationAdminTaskSubmissionSerializer(
                task_submission).data
            return Response({'detail': 'Task submission rated successfully', 'rated_submission': rated_submission}, status=200)

        else:
            return invalid_serializer()

    def get(self, request, **kwargs):
        is_organization_admin = verify_organization_admin(
            request, kwargs['userId'])

        if not is_organization_admin[0]:
            return Response({'detail': is_organization_admin[1]}, status=400)

        task = get_object_or_none(Task, id=kwargs['taskId'])
        if not task:
            return Response({'detail': 'Invalid task specified'}, status=400)
        if is_organization_admin[2] != task.organization:
            return Response({'detail': 'Permission denied'}, status=400)

        task_submissions = TaskSubmission.objects.filter(
            task=task, submission_status='submitted')
        task_submissions_data = OrganizationAdminTaskSubmissionSerializer(
            task_submissions, many=True).data

        return Response({'detail': 'success', 'task_submissions': task_submissions_data}, status=200)

    # method to determine if worker gets paid based on whether submission was accepted by organization that offered the task
    def base_transaction_recognize_worker_earnings_and_courzehub_commission_fees(self, **kwargs):
        base_transaction_kwargs = {
            'transaction_type': 'Journal',
            'task': kwargs['task'],
            'amount': kwargs['amount'],
            'memo': 'Transaction for worker earnings based on their work being accepted'
        }
        base_transaction = BaseTransaction(**base_transaction_kwargs)

        """
            post the transaction items which are, transfer from tasks payment funds ledger, worker earnings, and
            courzehub commission
        """
        transaction_items_kwargs = {
            'base_transaction': base_transaction,
            'worker_profile': kwargs['worker_profile']
        }
        self.transaction_items_worker_earnings_courzehub_commission(
            **transaction_items_kwargs
        )

    # method to post individual transaction items for commission share
    def transaction_items_worker_earnings_courzehub_commission(self, **kwargs):
        total_debits = 0
        total_credits = 0
        base_transaction = kwargs['base_transaction']
        worker_profile = kwargs['worker_profile']

        # post transaction to tasks payment funds ledger as a Debit
        tasks_payment_ledger_kwargs = {
            'base_transaction': base_transaction,
            'ledger': get_object_or_none(Ledger, name__iexact='Tasks Payment Funds'),
            'entry_type': 'Debit',
            'amount': base_transaction.amount,
        }
        tasks_payment_ledger_transaction = TransactionItem(
            **tasks_payment_ledger_kwargs)

        total_debits += tasks_payment_ledger_transaction.amount

        # post earnings to the workers ledger as a Credit
        worker_earnings_kwargs = {
            'base_transaction': base_transaction,
            'ledger': get_object_or_none(Ledger, name__iexact=f'{worker_profile.user.username} payable ledger'),
            'entry_type': 'Credit',
            'amount': (1 - worker_profile.courzehub_commission) * base_transaction.amount
        }
        worker_earnings_transaction = TransactionItem(**worker_earnings_kwargs)

        total_credits += worker_earnings_transaction.amount

        # post courzehub commission as a Credit
        courzehub_commission_kwargs = {
            'base_transaction': base_transaction,
            'ledger': get_object_or_none(Ledger, name__iexact='Tasks Commission Income'),
            'entry_type': 'Credit',
            'amount': (worker_profile.courzehub_commission) * base_transaction.amount
        }
        courzehub_commission_transaction = TransactionItem(
            **courzehub_commission_kwargs)

        total_credits += courzehub_commission_transaction.amount

        # we call the validate double entry and save transactions if the rule is True
        amounts_kwargs = {
            'base_amount': D(base_transaction.amount),
            'total_debits': total_debits,
            'total_credits': total_credits
        }
        # if this is true save the entries
        if enfore_double_entry_rule(**amounts_kwargs):
            base_transaction.save()
            tasks_payment_ledger_transaction.save()
            worker_earnings_transaction.save()
            courzehub_commission_transaction.save()
        # at the moment we are not handling th possible error here
        else:
            pass

    # method to increment worker tasks submitted and update their overall rating

    def update_worker_rating(self, **kwargs):
        task_submission = kwargs['task_submission']
        worker_profile = get_object_or_none(
            WorkerProfile, user=task_submission.submitted_by.id)
        if worker_profile:
            # increment tasks_submitted by 1
            worker_profile.tasks_submitted += 1
            worker_profile.total_cumulative_rating += task_submission.submission_rating
            worker_profile.save()
            worker_profile.average_overall_rating = worker_profile.total_cumulative_rating / \
                worker_profile.tasks_submitted
            worker_profile.save()
