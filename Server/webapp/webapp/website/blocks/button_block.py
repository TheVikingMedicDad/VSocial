from wagtail.core.blocks import StructBlock, CharBlock, BooleanBlock


class ButtonBlock(StructBlock):
    button_text = CharBlock(required=True)
    link = CharBlock(required=True)
    flat_button = BooleanBlock(required=False, default=False)

    class Meta:
        template = 'website/blocks/button_block.html'
