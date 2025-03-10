from django.contrib import admin
from .models import User, FileVersion

# Register your models here.


admin.site.register(User)
admin.site.register(FileVersion)