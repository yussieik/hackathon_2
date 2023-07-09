from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField


class Word(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_word")
    date_created = models.DateField(auto_now_add=True)
    date_edited = models.DateField(auto_now=True)
    translations = ArrayField(models.CharField(max_length=50))
