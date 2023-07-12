from django import template

register = template.Library()

@register.simple_tag
def get_env_variable(variable_name):
    try:
        from django.conf import settings
        return getattr(settings, variable_name, '')
    except ImportError:
        return ''