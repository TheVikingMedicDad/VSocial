from wagtail.core import blocks
from wagtail.images.blocks import ImageChooserBlock

from webapp.website.blocks.base_struct_block import BaseStructBlock
from webapp.website.blocks.bg_color_choice_block import BgColorChoiceBlock
from webapp.website.blocks.headline_block import Display4Block, Display1Block, TitleBlock
from webapp.website.blocks.text_block import TextBlock
from webapp.website.utils import RICHTEXT_ALL_FEATURES

stream_block_choices = [
    ('headline', Display4Block()),
    ('text', TitleBlock()),
    ('image', ImageChooserBlock()),
    ('richtext', blocks.RichTextBlock(features=RICHTEXT_ALL_FEATURES)),
]


class Layout1ColCenterSection(BaseStructBlock):
    background_color = BgColorChoiceBlock(required=False)
    background_image = ImageChooserBlock(required=False)

    column = blocks.StreamBlock(stream_block_choices, required=True)

    css_classes = blocks.CharBlock(required=False)

    class Meta:
        template = 'website/sections/layout_1_col_center_section.html'
