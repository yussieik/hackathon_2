from django.shortcuts import render
from .models import Word
from .serializers import WordSerializer
from rest_framework import generics

class WordListView(generics.ListAPIView):
    queryset = Word.objects.all()
    serializer_class = WordSerializer

class WordDetailView(generics.RetrieveAPIView):
   queryset = Word.objects.all()
   serializer_class = WordSerializer


class WordEditView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Word.objects.all()
    serializer_class = WordSerializer