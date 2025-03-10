from django.core.management.base import BaseCommand, CommandError
from propylon_document_manager.file_versions.models import FileVersion
from django.contrib.auth import get_user_model

file_versions = [
    'bill_document',
    'amendment_document',
    'act_document',
    'statute_document',
]

class Command(BaseCommand):
    help = "Load basic file version fixtures"

    def handle(self, *args, **options):
        User = get_user_model()
        superuser = User.objects.filter(email="obradovic.nix@gmail.com").first()
        for file_name in file_versions:
            FileVersion.objects.create(
                file_name=file_name,
                file_owner=superuser,
                version_number=1
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully created %s file versions' % len(file_versions))
        )
