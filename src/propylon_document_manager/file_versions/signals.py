from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.conf import settings


@receiver(post_migrate)
def create_default_superuser(sender, **kwargs):
    User = get_user_model()

    if not User.objects.filter(email=settings.SUPERUSER_EMAIL).exists():
        User.objects.create_superuser(email=settings.SUPERUSER_EMAIL, password=settings.SUPERUSER_PASSWORD)
        print("Superuser created with email:", settings.SUPERUSER_EMAIL)
