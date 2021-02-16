from django import template
from django.utils.translation import get_language

from webapp.website.models.footer import Footer

register = template.Library()


@register.inclusion_tag('website/tags/footer.html', takes_context=True)
def footer(context):
    return {
        # get the first footer with the current language
        'footer': Footer.objects.filter(language_code=get_language()).first(),
        'request': context['request'],
    }


@register.inclusion_tag('website/tags/header.html', takes_context=True)
def header(context):
    return {'request': context['request']}

@register.simple_tag(name='raw')
def raw(*args, **kwargs):
    pass

@register.simple_tag(name='endraw')
def endraw(*args, **kwargs):
    pass
