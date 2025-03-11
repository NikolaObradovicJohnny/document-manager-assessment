import os
import hashlib
from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage
from propylon_document_manager.file_versions.models import FileVersion

def generate_file_hash(file_path):
    """Generate a SHA256 hash for a file."""
    hasher = hashlib.sha256()
    if default_storage.exists(file_path):
        with default_storage.open(file_path, 'rb') as file:
            for chunk in iter(lambda: file.read(4096), b""):
                hasher.update(chunk)
    return hasher.hexdigest()

class Command(BaseCommand):
    help = "Populate missing file_hash values for existing FileVersion records"

    def handle(self, *args, **kwargs):
        files_updated = 0
        for file_version in FileVersion.objects.filter(file_hash__isnull=True):
            file_path = file_version.file.path

            if default_storage.exists(file_path):
                file_hash = generate_file_hash(file_path)
                file_version.file_hash = file_hash

                # Rename file using the hash
                file_extension = os.path.splitext(file_version.file.name)[-1]
                new_filename = f"{file_hash}{file_extension}"
                new_file_path = os.path.join('documents/', new_filename)

                if not default_storage.exists(new_file_path):  # Avoid overwriting
                    default_storage.save(new_file_path, default_storage.open(file_version.file.name))

                file_version.file.name = new_file_path
                file_version.save()
                files_updated += 1
                self.stdout.write(self.style.SUCCESS(f"Updated {file_version.file_name} with hash {file_hash}"))

        if files_updated == 0:
            self.stdout.write(self.style.WARNING("No missing file_hash values found"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Successfully updated {files_updated} files"))
