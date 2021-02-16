from wagtail.core import blocks
from wagtail.core.blocks import RichTextBlock, StreamBlock
from webapp.website.blocks.base_struct_block import BaseStructBlock
from webapp.website.blocks.button_block import ButtonBlock
from webapp.website.blocks.custom_classname_block import CustomClassnameBlock
from webapp.website.blocks.feature_list_block import FeatureListBlock
from webapp.website.blocks.headline_block import Display1Block, Display4Block
from webapp.website.blocks.pricing_block import PricingBlock
from webapp.website.utils import RICHTEXT_ALL_FEATURES

column_block_choices = [
    ('headline', Display1Block()),
    ('update_text', RichTextBlock(features=RICHTEXT_ALL_FEATURES)),
    ('feature_list', FeatureListBlock()),
    ('price_amount', PricingBlock()),
]

additional_block_choices = [
    ('title', CustomClassnameBlock(element_tag='div', css_class='csd-additional-title')),
    ('button', ButtonBlock()),
]


class PricingSection(BaseStructBlock):
    title = Display4Block(required=True)
    column_1 = StreamBlock(column_block_choices, required=True)
    column_2 = StreamBlock(column_block_choices, required=True)
    column_3 = StreamBlock(column_block_choices, required=True)
    additional_info = StreamBlock(additional_block_choices)
    id = blocks.CharBlock()

    css_classes = blocks.CharBlock(required=False)

    class Meta:
        template = 'website/sections/pricing_section.html'
