from wagtail.core import blocks
from wagtail.core.blocks import CharBlock
from wagtail.images.blocks import ImageChooserBlock

from webapp.website.blocks.base_struct_block import BaseStructBlock
from webapp.website.blocks.bg_color_choice_block import BgColorChoiceBlock
from webapp.website.blocks.button_block import ButtonBlock
from webapp.website.blocks.headline_block import Display4Block, TitleBlock
from webapp.website.utils import RICHTEXT_ALL_FEATURES


class HeroSection(BaseStructBlock):
    background_color = BgColorChoiceBlock(required=False)
    background_image = ImageChooserBlock(required=False)

    css_classes = blocks.CharBlock(required=False)

    primary_content = blocks.StreamBlock(
        [
            ('headline', Display4Block()),
            ('subtitle', TitleBlock()),
            ('richtext', blocks.RichTextBlock(features=RICHTEXT_ALL_FEATURES)),
            ('button', ButtonBlock()),
            ('image', ImageChooserBlock()),
        ],
        required=False,
        block_counts={'headline': {'max_num': 1}, 'subtitle': {'max_num': 1}},
    )

    secondary_content = blocks.StreamBlock(
        [('image', ImageChooserBlock())], required=False, max_num=1
    )

    class Meta:
        icon = 'image'
        template = 'website/sections/hero_section.html'
