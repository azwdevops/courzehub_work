# Generated by Django 3.1.7 on 2021-09-09 04:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('work', '0002_auto_20210908_2242'),
    ]

    operations = [
        migrations.AddField(
            model_name='tasksubmission',
            name='taken_on',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AlterField(
            model_name='tasksubmission',
            name='submitted_on',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
