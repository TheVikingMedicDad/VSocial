from wagtail.core import blocks

from webapp.website.utils import camel_to_dash


class BaseStructBlock(blocks.StructBlock):
    def get_context(self, value, parent_context=None):
        context = super().get_context(value, parent_context=parent_context)
        context['cls_class'] = f'csd-{camel_to_dash(type(self).__name__)}'
        return context
