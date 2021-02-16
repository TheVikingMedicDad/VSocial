from wagtail.core.blocks import CharBlock, TextBlock


class CustomClassnameBlock(TextBlock):
    element_tag = CharBlock(required=True)
    css_class = CharBlock(required=True)

    class Meta:
        template = 'website/blocks/custom_classname_block.html'

    def __init__(self, element_tag, css_class, **kwargs):
        super().__init__(**kwargs)
        self.element_tag = element_tag
        self.css_class = css_class

    def get_context(self, value, parent_context=None):
        context = super().get_context(value, parent_context=parent_context)
        context['element_tag'] = self.element_tag
        context['css_class'] = self.css_class
        return context
