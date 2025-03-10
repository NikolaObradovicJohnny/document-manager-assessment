from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model

@receiver(post_migrate)
def create_default_superuser(sender, **kwargs):
    User = get_user_model()
    if not User.objects.filter(email="obradovic.nix@gmail.com").exists():
        User.objects.create_superuser(email="obradovic.nix@gmail.com", password="admin1234")
        print("Superuser created with email: obradovic.nix@gmail.com")
