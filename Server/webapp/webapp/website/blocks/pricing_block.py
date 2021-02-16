from wagtail.core.blocks import StructBlock, CharBlock, BooleanBlock, StreamBlock

from webapp.website.blocks.button_block import ButtonBlock

pricing_block_choices = [
    ('button', ButtonBlock()),
]

class PricingBlock(StructBlock):
    amount = CharBlock(required=True)
    duration = CharBlock(required=True)
    buy_now = CharBlock(required=True)
    button = StreamBlock(pricing_block_choices, required=True)

    class Meta:
        template = 'website/blocks/pricing_block.html'
