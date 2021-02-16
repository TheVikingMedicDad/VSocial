from enum import Enum

from wagtail.core import blocks


class HeadlineSize(Enum):
    DISPLAY_4 = 1
    DISPLAY_3 = 2
    DISPLAY_2 = 3
    DISPLAY_1 = 4
    HEADLINE = 5
    TITLE = 6
    SUBTITLE_2 = 7
    SUBTITLE_1 = 8


class BaseHeadlineBlock(blocks.TextBlock):
    size = HeadlineSize.HEADLINE  # default
    headline_map = {
        HeadlineSize.DISPLAY_4: 'h1',
        HeadlineSize.DISPLAY_3: 'h2',
        HeadlineSize.DISPLAY_2: 'h3',
        HeadlineSize.DISPLAY_1: 'h4',
        HeadlineSize.HEADLINE: 'h5',
        HeadlineSize.TITLE: 'h6',
        HeadlineSize.SUBTITLE_2: 'h6',
        HeadlineSize.SUBTITLE_1: 'h6',
    }

    css_typo_map = {
        HeadlineSize.DISPLAY_4: 'display-4',
        HeadlineSize.DISPLAY_3: 'display-3',
        HeadlineSize.DISPLAY_2: 'display-2',
        HeadlineSize.DISPLAY_1: 'display-1',
        HeadlineSize.HEADLINE: 'headline',
        HeadlineSize.TITLE: 'title',
        HeadlineSize.SUBTITLE_2: 'subtitle-2',
        HeadlineSize.SUBTITLE_1: 'subtitle-1',
    }

    class Meta:
        template = 'website/blocks/headline_block.html'

    def __init__(self, size: HeadlineSize = None, **kwargs):
        super().__init__(**kwargs)
        if size:
            self.size = size

    def get_context(self, value, parent_context=None):
        context = super().get_context(value, parent_context=parent_context)
        context['css_class'] = f'csd-typo-{self.css_typo_map[self.size]}'
        context['h_size'] = self.headline_map[self.size]
        return context


class Display4Block(BaseHeadlineBlock):
    size = HeadlineSize.DISPLAY_4


class Display3Block(BaseHeadlineBlock):
    size = HeadlineSize.DISPLAY_3


class Display2Block(BaseHeadlineBlock):
    size = HeadlineSize.DISPLAY_2


class Display1Block(BaseHeadlineBlock):
    size = HeadlineSize.DISPLAY_1


class HeadlineBlock(BaseHeadlineBlock):
    size = HeadlineSize.HEADLINE


class TitleBlock(BaseHeadlineBlock):
    size = HeadlineSize.TITLE


class Subtitle2Block(BaseHeadlineBlock):
    size = HeadlineSize.SUBTITLE_2


class Subtitle1Block(BaseHeadlineBlock):
    size = HeadlineSize.SUBTITLE_1
