# we need to create CourZe Hub organization from the onset

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from work.models import Organization
from core.views import get_object_or_none

User = get_user_model()


class Command(BaseCommand):
    def handle(self, **options):
        self.create_system_admin()

    # create system admin
    def create_system_admin(self):
        try:
            User.objects.create(
                email='azwdevops@gmail.com',
                username='zachary',
                first_name='Zachary',
                last_name='Waweru',
                profile_type='System Admin',
                is_admin=True,
                is_active=True,
                is_staff=True,
                is_superuser=True
            )
        except:
            pass
