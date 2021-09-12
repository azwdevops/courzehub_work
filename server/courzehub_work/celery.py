from __future__ import absolute_import, unicode_literals

import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'courzehub_work.settings')

BASE_REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')


app = Celery('courzehub_work')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

app.conf.broker_url = BASE_REDIS_URL


# celery -A courzehub_work worker -l info                    ==== START CELERY IN LINUX
# celery -A courzehub_work worker -l info --pool=solo        ==== START CELERY IN WINDOWS
