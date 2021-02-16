from wagtail.core import blocks
from wagtail.core.blocks import CharBlock
from wagtail.images.blocks import ImageChooserBlock

from webapp.website.blocks.base_struct_block import BaseStructBlock
from webapp.website.blocks.bg_color_choice_block import BgColorChoiceBlock
from webapp.website.blocks.button_block import ButtonBlock
from webapp.website.blocks.headline_block import Display4Block, Display1Block, TitleBlock
from webapp.website.blocks.text_block import TextBlock
from webapp.website.utils import RICHTEXT_ALL_FEATURES

stream_block_choices = [
    ('headline', Display4Block()),
    ('text', TitleBlock()),
    ('image', ImageChooserBlock()),
    ('richtext', blocks.RichTextBlock(features=RICHTEXT_ALL_FEATURES)),
    ('button', ButtonBlock()),
]


class LayoutFlexSection(BaseStructBlock):
    background_color = BgColorChoiceBlock(required=False)
    background_image = ImageChooserBlock(required=False)
    align = blocks.ChoiceBlock(choices=[('start', 'Start'), ('center', 'Center')])
    id = CharBlock()

    css_classes = blocks.CharBlock(required=False)

    elements = blocks.ListBlock(blocks.StreamBlock(stream_block_choices, required=True))

    class Meta:
        template = 'website/sections/layout_flex_section.html'
