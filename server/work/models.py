from uuid import uuid4

from django.utils.text import slugify
from django.db.models import Model, UUIDField, DecimalField, OneToOneField, PROTECT, ForeignKey, DateTimeField, CharField, \
    BooleanField, PositiveIntegerField, FileField, TextField
from django.contrib.postgres.fields import CICharField
from django.contrib.auth import get_user_model

from work.choices import task_status, submission_status, worker_profile_status, worker_application_status, course_payment_status

User = get_user_model()

# model for organizations that are signed up by CourZe Hub work


class Organization(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    name = CICharField(max_length=150, unique=True)
    initials = CICharField(max_length=50, unique=True)
    is_active = BooleanField(default=True)
    slug = CICharField(max_length=150, unique=True)
    # defines the share that goes to courzehub
    courzehub_commission = DecimalField(
        max_digits=10, decimal_places=2, default=0.3)
    organization_admin = OneToOneField(
        User, null=True, on_delete=PROTECT, related_name='organization_admin', blank=True)
    created_by = ForeignKey(
        User, null=True, on_delete=PROTECT, related_name='organization_created_by')
    created_on = DateTimeField(auto_now_add=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super(Organization, self).save(*args, **kwargs)

    def __str__(self):
        return self.name


# model for the work created by organizations
class Task(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    organization = ForeignKey(
        Organization, null=True, on_delete=PROTECT, related_name='organization_tasks')
    title = CharField(max_length=500)
    created_on = DateTimeField(auto_now_add=True)
    created_by = ForeignKey(User, on_delete=PROTECT, null=True)
    # minimum rating required for user to do this task
    user_minimum_rating = DecimalField(max_digits=3, decimal_places=2)
    is_active = BooleanField(default=False)
    amount = DecimalField(max_digits=20, decimal_places=2, null=True)
    status = CharField(max_length=100, choices=task_status)
    payment_status = CICharField(
        max_length=20, choices=course_payment_status, null=True)
    instructions = TextField(null=True, blank=True)

    def __str__(self):
        return self.title

# model for documents attachment for tasks


class TaskAttachment(Model):
    task = ForeignKey(Task, null=True, on_delete=PROTECT,
                      related_name='task_attachments')
    attachment = FileField(upload_to='task_attachments/%Y/%m/%d')
    created_on = DateTimeField(auto_now_add=True)
    is_active = BooleanField(default=True)

    def __str__(self):
        return self.task.title

# model to hold worker application
# 8041291


class WorkerApplication(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    user = OneToOneField(User, on_delete=PROTECT, null=True)
    is_active = BooleanField(default=True)
    status = CharField(
        max_length=150, choices=worker_application_status, default='pending')
    mpesa_number = CICharField(
        max_length=50, unique=True, null=True, blank=True)
    national_id = CICharField(
        max_length=50, unique=True, null=True, blank=True)
    applied_on = DateTimeField(auto_now_add=True)
    approved_by = ForeignKey(User, on_delete=PROTECT,
                             null=True, related_name='application_approved_by', blank=True)
    approved_on = DateTimeField(null=True, blank=True)
    about_worker = TextField(null=True, blank=True)
    rejection_reason = CharField(max_length=800, null=True, blank=True)
    occupation = CICharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.user.username

# model for worker profile


class WorkerProfile(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    user = OneToOneField(User, on_delete=PROTECT, null=True)
    is_active = BooleanField(default=True)
    profile_status = CharField(
        max_length=100, choices=worker_profile_status, default='active')
    suspended_by = ForeignKey(User, on_delete=PROTECT,
                              null=True, related_name='profile_suspended_by', blank=True)
    suspension_notes = CharField(max_length=800, null=True, blank=True)
    suspended_on = DateTimeField(null=True, blank=True)
    disabled_by = ForeignKey(User, on_delete=PROTECT,
                             null=True, related_name='profile_disabled_by', blank=True)
    disabled_notes = CharField(max_length=800, null=True, blank=True)
    disabled_on = DateTimeField(null=True, blank=True)
    average_overall_rating = DecimalField(
        max_digits=3, decimal_places=2, default=5.0)
    # to avoid rating going beyond 5.0, we assume the user has completed once task and give them a rating of 5.0
    tasks_submitted = PositiveIntegerField(default=1)
    total_cumulative_rating = DecimalField(
        max_digits=50, decimal_places=2, default=5.0)
    # defines the share that goes to courzehub
    courzehub_commission = DecimalField(
        max_digits=10, decimal_places=2, default=0.3)

    def __str__(self):
        return self.user.username


# model for the work submission
class TaskSubmission(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    task = ForeignKey(Task, on_delete=PROTECT, null=True,
                      related_name='task_submissions')
    submitted_by = ForeignKey(User, on_delete=PROTECT,
                              null=True, related_name='task_submitted_by')
    taken_on = DateTimeField(auto_now_add=True, null=True)
    submitted_on = DateTimeField(null=True, blank=True)
    submission_rating = DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True)
    reviewed_by = ForeignKey(User, on_delete=PROTECT,
                             null=True, related_name='task_reviewed_by', blank=True)
    reviewed_on = DateTimeField(null=True, blank=True)
    review_notes = CharField(max_length=500, null=True, blank=True)
    submission_status = CharField(
        max_length=100, choices=submission_status, default='draft')

    def __str__(self):
        return self.task.title

# model for documents attachment for task submissions


class TaskSubmissionAttachment(Model):
    task_submission = ForeignKey(
        TaskSubmission, null=True, on_delete=PROTECT, related_name='task_submission_attachments')
    attachment = FileField(upload_to='task_submission_attachments/%Y/%m/%d')
    created_on = DateTimeField(auto_now_add=True)
    is_active = BooleanField(default=True)

    def __str__(self):
        return self.task_submission.task.title
