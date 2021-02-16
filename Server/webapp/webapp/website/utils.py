import re

RICHTEXT_ALL_FEATURES = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'bold',
    'italic',
    'ol',
    'ul',
    'hr',
    'link',
    'document-link',
    'image',
    'embed',
    'code',
    'superscript',
    'subscript',
    'strikethrough',
    'blockquote',
]

# based on https://stackoverflow.com/a/1176023/2160733
def camel_to_dash(name):
    name = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1-\2', name).lower()
