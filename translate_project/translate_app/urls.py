from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views
from .views import RegisterView, HomePageView, GamePageView, create_word, stat_view
from .api_views import WordListView, WordDetailView, WordEditView

urlpatterns = [
    path('login/', views.LoginView.as_view(template_name='login.html'), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('home/', HomePageView.as_view(), name='homepage'),
    path('game/', GamePageView, name='game'),
    path('create-word/', create_word, name='create-word'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('api/word-list/', WordListView.as_view(), name='word-list'),
    path('api/word-list/<int:pk>', WordDetailView.as_view(), name='word-detail'),
    path('api/word-list/edit/<int:pk>', WordEditView.as_view(), name='word-edit'),
    path('stats/', stat_view, name='stats')
]