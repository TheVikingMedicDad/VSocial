from wagtail.core import blocks


def get_color_choices():
    choices = [('', 'None'), ('primary', 'primary'), ('accent', 'accent')]
    color_steps = [
        '50',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
        'A100',
        'A200',
        'A400',
        'A700',
    ]

    for i in color_steps:
        choices.append((f'primary-{i}', f'primary-{i}'))

    for i in color_steps:
        choices.append((f'accent-{i}', f'accent-{i}'))
    return choices


class BgColorChoiceBlock(blocks.ChoiceBlock):
    choices = get_color_choices()

    class Meta:
        icon = 'cup'
