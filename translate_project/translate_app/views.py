from django.shortcuts import render
from django.views.generic.edit import CreateView
from django.views.generic import View, TemplateView
from django.contrib.auth.models import User
from .forms import RegisterForm
from django.urls import reverse_lazy
from django.http import JsonResponse
from .models import Word
from .forms import WordForm
import json
from django.middleware.csrf import get_token
from .serializers import WordSerializer
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.db.models import Min




class RegisterView(CreateView):
    form_class = RegisterForm
    model = User
    template_name = 'register.html'
    success_url = reverse_lazy('login')


class HomePageView(TemplateView):
    template_name = 'homepage.html'


def GamePageView(request):
    csrf_token = get_token(request)
    word_form = WordForm() 
    return render(request, "game.html", {"csrf_token": csrf_token, "word_form": word_form})


def stat_view(request):
    if request.method == "GET":
        all_words = Word.objects.filter(user=request.user)
        all_qlanguages = [i['qlanguage'] for i in list(all_words.values('qlanguage').distinct())]
        all_alanguages = [i['alanguage'] for i in list(all_words.values('alanguage').distinct())]
        all_languages = set(all_alanguages + all_qlanguages) # {'he', 'en', 'ru'}

        # overall score
        correct_words = len(list(all_words.filter(correct=True)))
        total_score = round(correct_words / len(all_words) * 100)

        # create from_to
        old_from_to = {}
        for from_lang in all_languages:
            old_from_to[from_lang] = []
            for to_lang in all_languages:
                if len(all_words.filter(qlanguage=from_lang, alanguage=to_lang)) > 0:
                    old_from_to[from_lang].append(to_lang)

        # conversion to full words
        conversion = {'en': 'English', 'he': 'Hebrew', 'fr': 'French', 'ru': 'Russian', 'ar': 'Arabic'}
        from_to = {}

        for key, values in old_from_to.items():
            updated_values = [conversion[val] if val in conversion else val for val in values]
            from_to[conversion[key] if key in conversion else key] = updated_values

        from_langs = {key for key, value in old_from_to.items()}
        to_langs = {val for values in old_from_to.values() for val in values}

        # create scores dictionary
        scores = {}
        print("from", from_langs)
        for from_lang in from_langs:
            scores[from_lang] = {}  # {'en': {}, 'he': {}, 'ru': {}}

            for to_lang in to_langs:
                if len(all_words.filter(qlanguage=from_lang, alanguage=to_lang)) > 0:
                    scores[from_lang][to_lang] = {}  # {'en': {'he': {}, 'ru': {}}, 'he':...}
                    # known words
                    scores[from_lang][to_lang]['known_words'] = list(all_words.filter(qlanguage=from_lang, alanguage=to_lang, correct=True))

                    # unknown words
                    scores[from_lang][to_lang]['unknown_words'] = list(all_words.filter(qlanguage=from_lang, alanguage=to_lang, correct=False))

                    # percentage
                    known_count = len(list(scores[from_lang][to_lang]['known_words']))
                    unknown_count = len(list(scores[from_lang][to_lang]['unknown_words']))
                    scores[from_lang][to_lang]['percentage'] = round(known_count / (known_count + unknown_count) * 100)

                    # difficulty
                    hardest_num = all_words.filter(qlanguage=from_lang, alanguage=to_lang).aggregate(min_value=Min('difficulty'))['min_value']
                    hardest_word = convert_difficulty(str(hardest_num))
                    print(from_lang, to_lang, hardest_word)
                    scores[from_lang][to_lang]['hardest'] = hardest_word

        scores = replace_keys_and_values(scores, conversion)
        
        
        context = {"all_words": all_words,
                   "from_to": from_to,
                   "from_langs": from_langs,
                   "scores": scores,
                   "total_score": total_score,
                }
        return render(request, "stats.html", context)

# convert scores to full words:
def replace_keys_and_values(data, conversion):
    if isinstance(data, dict):
        return {conversion.get(k, k): replace_keys_and_values(v, conversion) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_keys_and_values(item, conversion) for item in data]
    else:
        return conversion.get(data, data)

# convert number difficulty to words:
def convert_difficulty(number):
    number_conversion = {
    "8": "Super Easy",
    "7": "Easy",
    "6": "Medium",
    "5": "Tough",
    "4": "Hard",
    "3": "Expert",
    "2": "Insane",
    "1": "Word Master"
}
    return number_conversion[number]

def create_word(request):
    if request.method == "POST":
        form = WordForm(request.POST)
        if form.is_valid():
            word_data = json.loads(request.body)
            word_data['user'] = request.user
            word = form.save(commit=False)
            word.user = word_data['user']
            word.word = word_data['word']
            word.translation = word_data['translation']
            word.user_guess = word_data['user_guess']
            word.qlanguage = word_data['qlanguage']
            word.alanguage = word_data['alanguage']
            word.correct = word_data['correct']
            word.difficulty = word_data['difficulty']
            word.save()

            # create API Word object
            word_object = Word()
            word_object.user = word_data['user']
            word_object.word = word_data['word']
            word_object.translation = word_data['translation']
            word_object.user_guess = word_data['user_guess']
            word_object.qlanguage = word_data['qlanguage']
            word_object.alanguage = word_data['alanguage']
            word_object.correct = word_data['correct']
            word_object.difficulty = word_data['difficulty']
            return JsonResponse({'message': 'Word created successfully.'}, status=201)
        else:
            return JsonResponse(status=400)

