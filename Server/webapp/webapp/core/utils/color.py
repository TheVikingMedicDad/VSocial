import colorsys
import logging

log = logging.getLogger(__name__)


def generate_mat_color_palette(
    default_color_hex, contrast_dark_hex="#000000", contrast_light_hex="#ffffff"
):
    palette = {
        "50": generate_new_mat_rgb_color(default_color_hex, 1, 1.4, 1.8),
        "100": generate_new_mat_rgb_color(default_color_hex, 1, 1.4, 1.6),
        "200": generate_new_mat_rgb_color(default_color_hex, 1, 1.2, 1.4),
        "300": generate_new_mat_rgb_color(default_color_hex, 1, 1.1, 1.1),
        "400": generate_new_mat_rgb_color(default_color_hex, 1, 1.07, 1.07),
        "500": default_color_hex,
        "600": generate_new_mat_rgb_color(default_color_hex, 1, 0.93, 0.95),
        "700": generate_new_mat_rgb_color(default_color_hex, 1, 0.86, 0.80),
        "800": generate_new_mat_rgb_color(default_color_hex, 1, 0.79, 0.65),
        "900": generate_new_mat_rgb_color(default_color_hex, 1, 0.8, 0.50),
        "A100": generate_new_mat_rgb_color(default_color_hex, 1, 1.2, 1.2),
        "A200": generate_new_mat_rgb_color(default_color_hex, 1, 1.1, 1.07),
        "A400": generate_new_mat_rgb_color(default_color_hex, 1, 0.96, 0.95),
        "A700": generate_new_mat_rgb_color(default_color_hex, 1, 0.79, 0.79),
        "contrast": {
            "50": contrast_dark_hex,
            "100": contrast_dark_hex,
            "200": contrast_dark_hex,
            "300": contrast_dark_hex,
            "400": contrast_dark_hex,
            "500": contrast_light_hex,
            "600": contrast_light_hex,
            "700": contrast_light_hex,
            "800": contrast_light_hex,
            "900": contrast_light_hex,
            "A100": contrast_light_hex,
            "A200": contrast_light_hex,
            "A400": contrast_light_hex,
            "A700": contrast_light_hex,
        },
    }
    return palette


def color_hex_to_rgb(hex_color: str):
    # based on https://stackoverflow.com/a/29643643
    clean_hex = hex_color.lstrip("#")
    rgb = tuple(int(clean_hex[i : i + 2], 16) for i in (0, 2, 4))
    normalized_rgb = [el / 255 for el in rgb]
    return normalized_rgb


def color_rgb_to_hex(r, g, b):
    normalized_rgb = (r, g, b)
    int_rgb = [el * 255 for el in normalized_rgb]

    def clamp(x):
        return int(max(0, min(x, 255)))

    return f"#{clamp(int_rgb[0]):02x}{clamp(int_rgb[1]):02x}{clamp(int_rgb[2]):02x}"


def generate_new_mat_rgb_color(
    base_color_hex: str, mult_hue: float, mult_sat: float, mult_light: float
):
    base_rgb = color_hex_to_rgb(base_color_hex)
    base_hls = colorsys.rgb_to_hls(*base_rgb)
    new_hls = (base_hls[0] * mult_hue, base_hls[1] * mult_light, base_hls[2] * mult_sat)
    new_rgb = colorsys.hls_to_rgb(*new_hls)
    return color_rgb_to_hex(*new_rgb)
