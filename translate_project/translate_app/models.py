from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField


class Word(models.Model):
    word = models.CharField(max_length=20, null=True, blank=True)
    translation = models.CharField(max_length=20, null=True, blank=True)
    user_guess = models.CharField(max_length=20, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_word", null=True, blank=True)
    date_created = models.DateField(auto_now_add=True, null=True, blank=True)
    qlanguage = models.CharField(max_length=5, null=True, blank=True)
    alanguage = models.CharField(max_length=5, null=True, blank=True)
    correct = models.BooleanField(null=True, blank=True)
    difficulty = models.IntegerField(null=True, blank=True)
