from wagtail.core.blocks import StructBlock, ListBlock, RichTextBlock
from wagtail.images.blocks import ImageChooserBlock

from webapp.website.utils import RICHTEXT_ALL_FEATURES


class FeatureListBlock(StructBlock):
    features = ListBlock(
        StructBlock(
            [
                ("image", ImageChooserBlock(required=True)),
                ("title", RichTextBlock(features=RICHTEXT_ALL_FEATURES, required=True))
            ]
        )
    )

    class Meta:
        template = 'website/blocks/feature_list_block.html'
