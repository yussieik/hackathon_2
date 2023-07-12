from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django import forms
from .models import Word

class RegisterForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username', 'password1', 'password2']


class WordForm(forms.ModelForm):
    class Meta:
        model = Word
        fields = '__all__'
        widgets = {
            'user': forms.HiddenInput(),
            'date_created': forms.HiddenInput(),
            'qlanguage': forms.HiddenInput(),
            'alanguage': forms.HiddenInput(),
            'correct': forms.HiddenInput(),
            'difficulty': forms.HiddenInput(),
            'word': forms.HiddenInput(),
            'translation': forms.HiddenInput(),
            'user_guess': forms.HiddenInput(),
        }