# Generated by Django 3.1.7 on 2021-08-30 03:31

from django.conf import settings
import django.contrib.postgres.fields.citext
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', django.contrib.postgres.fields.citext.CICharField(max_length=150, unique=True)),
                ('initials', django.contrib.postgres.fields.citext.CICharField(max_length=50, unique=True)),
                ('is_active', models.BooleanField(default=True)),
                ('slug', django.contrib.postgres.fields.citext.CICharField(max_length=150, unique=True)),
                ('courzehub_commission', models.DecimalField(decimal_places=2, default=0.3, max_digits=10)),
                ('created_on', models.DateTimeField(auto_now_add=True, null=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='organization_created_by', to=settings.AUTH_USER_MODEL)),
                ('organization_admin', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='organization_admin', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=500)),
                ('created_on', models.DateTimeField(auto_now_add=True)),
                ('user_minimum_rating', models.DecimalField(decimal_places=2, max_digits=3)),
                ('is_active', models.BooleanField(default=False)),
                ('status', models.CharField(choices=[('', 'select status'), ('available', 'available'), ('completed', 'completed'), ('draft', 'draft'), ('submitted', 'submitted'), ('suspended', 'suspended')], max_length=100)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
                ('organization', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='organization_tasks', to='work.organization')),
            ],
        ),
        migrations.CreateModel(
            name='WorkerProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('is_active', models.BooleanField(default=True)),
                ('profile_status', models.CharField(choices=[('', 'select status'), ('active', 'active'), ('suspended', 'suspended'), ('disabled', 'disabled')], default='active', max_length=100)),
                ('suspension_notes', models.CharField(blank=True, max_length=800, null=True)),
                ('suspended_on', models.DateTimeField(blank=True, null=True)),
                ('disabled_notes', models.CharField(blank=True, max_length=800, null=True)),
                ('disabled_on', models.DateTimeField(blank=True, null=True)),
                ('overall_rating', models.DecimalField(decimal_places=2, default=5.0, max_digits=3)),
                ('tasks_submitted', models.PositiveIntegerField(default=1)),
                ('disabled_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='profile_disabled_by', to=settings.AUTH_USER_MODEL)),
                ('suspended_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='profile_suspended_by', to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='WorkerApplication',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('is_active', models.BooleanField(default=True)),
                ('status', models.CharField(choices=[('', 'select status'), ('approved', 'approved'), ('pending', 'pending'), ('rejected', 'rejected')], default='pending', max_length=150)),
                ('applied_on', models.DateTimeField(auto_now_add=True)),
                ('approved_on', models.DateTimeField(blank=True, null=True)),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='application_approved_by', to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TaskSubmissionAttachment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attachment', models.FileField(upload_to='task_submission_attachments/%Y/%m/%d')),
                ('task_submission', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='work.task')),
            ],
        ),
        migrations.CreateModel(
            name='TaskSubmission',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('submitted_on', models.DateTimeField(auto_now_add=True)),
                ('submission_rating', models.DecimalField(blank=True, decimal_places=2, max_digits=3, null=True)),
                ('reviewed_on', models.DateTimeField(blank=True, null=True)),
                ('review_notes', models.CharField(blank=True, max_length=500, null=True)),
                ('submission_status', models.CharField(choices=[('', 'select status'), ('approved', 'approved'), ('draft', 'draft'), ('rejected', 'rejected'), ('submitted', 'submitted')], default='draft', max_length=100)),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='task_reviewed_by', to=settings.AUTH_USER_MODEL)),
                ('submitted_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='task_submitted_by', to=settings.AUTH_USER_MODEL)),
                ('task', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='task_submissions', to='work.task')),
            ],
        ),
        migrations.CreateModel(
            name='TaskAttachment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attachment', models.FileField(upload_to='task_attachments/%Y/%m/%d')),
                ('task', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='work.task')),
            ],
        ),
    ]
