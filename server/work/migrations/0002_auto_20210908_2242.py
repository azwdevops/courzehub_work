# Generated by Django 3.1.7 on 2021-09-08 19:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('work', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='status',
            field=models.CharField(choices=[('', 'select status'), ('available', 'available'), ('completed', 'completed'), ('draft', 'draft'), ('submitted', 'submitted'), ('suspended', 'suspended'), ('taken', 'taken')], max_length=100),
        ),
    ]
