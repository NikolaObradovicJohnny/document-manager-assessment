# Generated by Django 5.0.1 on 2025-03-11 13:44

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("file_versions", "0004_alter_user_managers"),
    ]

    operations = [
        migrations.AddField(
            model_name="fileversion",
            name="file_hash",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
    ]
