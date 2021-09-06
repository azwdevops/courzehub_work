# Generated by Django 3.1.7 on 2021-09-01 02:52

import django.contrib.postgres.fields.citext
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0005_auto_20210831_1059'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='profile_type',
            field=django.contrib.postgres.fields.citext.CICharField(blank=True, choices=[('', 'select profile'), ('Courzehub Staff', 'Courzehub Staff'), ('Organization Admin', 'Organization Admin'), ('System Admin', 'System Admin'), ('Worker', 'Worker')], max_length=100, null=True),
        ),
    ]