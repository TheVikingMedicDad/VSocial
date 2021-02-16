from enum import Enum

from django.db import models
from wagtail.core import blocks


class TextBlock(blocks.RichTextBlock):
    features = []

    class Meta:
        template = 'website/blocks/text_block.html'

    def __init__(self, *args, **kwargs):
        kwargs['features'] = []
        super().__init__(*args, **kwargs)
