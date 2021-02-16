from wagtail.admin.edit_handlers import StreamFieldPanel
from wagtail.core import blocks
from wagtail.core.fields import StreamField
from wagtail.core.models import Page
from wagtail.images.blocks import ImageChooserBlock
from wagtailtrans.models import TranslatablePage

from webapp.website.sections.hero_section import HeroSection
from webapp.website.sections.layout_1_col_center_section import Layout1ColCenterSection
from webapp.website.sections.layout_1_col_wide_section import Layout1ColWideSection
from webapp.website.sections.layout_3_col_section import Layout3ColSection
from webapp.website.sections.layout_4_col_section import Layout4ColSection
from webapp.website.sections.layout_flex_section import LayoutFlexSection
from webapp.website.sections.pricing_section import PricingSection


class FlexPage(TranslatablePage):
    body = StreamField(
        [
            ('hero', HeroSection()),
            ('layout_4_col', Layout4ColSection()),
            ('layout_3_col', Layout3ColSection()),
            ('layout_1_col_center', Layout1ColCenterSection()),
            ('layout_1_col_wide', Layout1ColWideSection()),
            ('layout_flex', LayoutFlexSection()),
            ('pricing', PricingSection()),
        ]
    )

    content_panels = Page.content_panels + [StreamFieldPanel('body')]
