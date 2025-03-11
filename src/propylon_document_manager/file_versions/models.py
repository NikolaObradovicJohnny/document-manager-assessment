import hashlib
import os
from django.db import models
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.db.models import CharField, EmailField
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Creates and returns a regular user with the given email and password."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Creates and returns a superuser with the given email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    """
    Default custom user model for Propylon Document Manager.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    # First and last name do not cover name patterns around the globe
    name = CharField(_("Name of User"), blank=True, max_length=255)
    first_name = None  # type: ignore
    last_name = None  # type: ignore
    email = EmailField(_("email address"), unique=True)
    username = None  # type: ignore

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()  # Use custom manager

    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"pk": self.id})

def generate_file_hash(file):
    """Generate SHA-256 hash for a file."""
    hasher = hashlib.sha256()
    for chunk in file.chunks():
        hasher.update(chunk)
    return hasher.hexdigest()

def get_default_user():
    return User.objects.filter(is_superuser=True).first() or User.objects.first()

class FileVersion(models.Model):
    file_name = models.CharField(max_length=512)
    file_owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="documents", default=get_default_user)
    version_number = models.fields.IntegerField()
    file_hash = models.CharField(max_length=64, unique=False, blank=True, null=True)
    file = models.FileField(upload_to="documents/", default="documents/default.pdf")
    uploaded_at = models.DateTimeField(default=timezone.now)
        
    class Meta:
        unique_together = ("file_name", "file_owner", "version_number")  # Ensures unique version per document

    def save(self, *args, **kwargs):
        """Override save to use hash-based file storage."""
        if not self.file_hash:
            self.file_hash = generate_file_hash(self.file)
        
        # Rename file based on its hash
        file_extension = os.path.splitext(self.file.name)[-1]
        new_filename = f"{self.file_hash}{file_extension}"
        file_path = os.path.join('documents/', new_filename)

        # Store file using hash-based naming
        if not default_storage.exists(file_path):  # Avoid overwriting
            default_storage.save(file_path, ContentFile(self.file.read()))
        
        self.file.name = file_path  # Set new file name
        super().save(*args, **kwargs)