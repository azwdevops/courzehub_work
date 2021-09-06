# Generated by Django 3.1.7 on 2021-08-31 07:58

import django.contrib.postgres.fields.citext
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0003_auto_20210307_2100'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='account_disabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='date_of_birth',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='gender',
            field=models.CharField(choices=[('', 'Select gender'), ('Male', 'Male'), ('Female', 'Female')], max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='profile_type',
            field=django.contrib.postgres.fields.citext.CICharField(choices=[('', 'select profile'), ('Courzehub Staff', 'Courzehub Staff'), ('Organization Admin', 'Organization Admin'), ('System Admin', 'System Admin'), ('Worker', 'Worker')], default='Student', max_length=100),
        ),
        migrations.AddField(
            model_name='user',
            name='referrer',
            field=models.CharField(choices=[('', 'Select referrer'), ('Facebook', 'Facebook'), ('Friend', 'Friend'), ('Google Search', 'Google Search'), ('Instagram', 'Instagram'), ('LinkedIn', 'LinkedIn'), ('TikTok', 'TikTok'), ('Twitter', 'Twitter')], default='Friend', max_length=200),
        ),
    ]
