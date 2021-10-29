from __future__ import absolute_import, unicode_literals

import os

from celery import Celery
from kombu import Queue, Exchange

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'courzehub_work.settings')

BASE_REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/1')


app = Celery('courzehub_work')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

app.conf.broker_url = BASE_REDIS_URL

# configure task queues
app.conf.task_queues = (
    # Queue('queue_name', Exchange('queue_name'), routing_key='queue_name')
    # refer to https://docs.celeryproject.org/en/stable/userguide/routing.html
    Queue('courzehub_work', Exchange('courzehub_work', type='direct'),
          routing_key='courzehub_work'),
)


# celery -A courzehub_work worker -l info -n courzehub_work -Q courzehub                   ==== START CELERY IN LINUX
# celery -A courzehub_work worker -l info --pool=solo -name courzehub_work -Q courzehub        ==== START CELERY IN WINDOWS
