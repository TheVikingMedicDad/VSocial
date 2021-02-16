from django.core.files.images import ImageFile
from django.core.management import BaseCommand
from wagtail.core.models import Page, Site
from wagtail.images.models import Image
from wagtailmenus.models import FlatMenu, FlatMenuItem
from wagtailtrans.models import TranslatableSiteRootPage

from django.conf import settings

from webapp.core.utils.common import clean_url_from_host_port
from webapp.website.models import Footer
from webapp.website.models.flex_page import FlexPage


class Command(BaseCommand):
    help = "Setup example website data"

    def delete_all_pages(self):
        pages_to_delete = []

        for page in Page.objects.exclude(pk=1):
            try:
                page.delete()
            except:
                pages_to_delete.append(page)

        for page in pages_to_delete:
            try:
                page.delete()
            except:
                self.stdout.write(f"couldnt delete {page}")

        Footer.objects.all().delete()

    def handle(self, *args, **options):
        # based on  see https://www.codista.com/de/blog/create-wagtail-pages-programmatically/

        self.delete_all_pages()

        root = Page.get_first_root_node()
        translatable_root_page = TranslatableSiteRootPage(title="Trans Root")
        root.add_child(instance=translatable_root_page)

        first_site = Site.objects.first()
        if not first_site:
            first_site = Site(
                hostname="localhost",
                port=80,
                root_page=translatable_root_page,
                is_default_site=True,
            )
            first_site.save()

        first_site.root_page = translatable_root_page
        first_site.save()

        # language_en = Language.objects.get(code='en')
        # language_de = Language.objects.get(code='de')

        # --- upload images ---

        images = {
            "bg-elements.png": -1,
            "benefit-1.png": -1,
            "benefit-3.png": -1,
            "benefit-2.png": -1,
            "illu-apps.png": -1,
            "feature-bullet.png": -1,
            "placeholder.png": -1,
            "todologo-circle.png": -1,
            "contact.png": -1,
        }

        webapp_url = clean_url_from_host_port(settings.CSD_WEBAPP_HOST, settings.CSD_WEBAPP_PORT)

        for key in images.keys():
            # we don't use the storage class here because we want to access the
            # source code in the file system locally
            file_path = settings.APPS_DIR.path("static_src/images/" + key)
            with open(file_path, "rb") as bg_file:
                image_file = ImageFile(bg_file, name=key)
                image = Image(title="key", file=image_file)
                image.save()
            images[key] = image.pk

        # we need to set is_lazy to tro, so that we can use a plain dict for
        # stream_data otherwise it fails weirdly
        home_page_en = FlexPage(title="Home English", slug="en", show_in_menus=True)
        home_page_en.body.is_lazy = True
        home_page_en.body.stream_data = [
            {
                "type": "hero",
                "value": {
                    "css_classes": "",
                    "background_color": "primary-A200",
                    "background_image": images["bg-elements.png"],
                    "primary_content": [
                        {
                            "type": "headline",
                            "value": "Simply get your stuff done.",
                        },
                        {
                            "type": "subtitle",
                            "value": "Create, check off and delete your tasks and elements. Nothing more. Nothing less. Believe us: You have never got this much stuff done.",
                        },
                        {
                            "type": "button",
                            "value": {
                                "button_text": "Get the app",
                                "link": f"{webapp_url}",
                                "flat_button": True,
                            },
                        },
                    ],
                    "secondary_content": [],
                },
            },
            {
                "type": "layout_3_col",
                "value": {
                    "css_classes": "",
                    "column_1": [
                        {"type": "headline", "value": "Keep track of your stuff."},
                        {"type": "image", "value": images["benefit-1.png"]},
                        {
                            "type": "text",
                            "value": "Write new todos and never forgot a task again. What else would you want from a todo app really?",
                        },
                    ],
                    "column_2": [
                        {"type": "headline", "value": "Actually do the stuff."},
                        {"type": "image", "value": images["benefit-2.png"]},
                        {
                            "type": "text",
                            "value": "Write your tasks down, do the tasks and then check them off. Most satisfying feeling ever.",
                        },
                    ],
                    "column_3": [
                        {"type": "headline", "value": "Have more time for real stuff."},
                        {"type": "image", "value": images["benefit-3.png"]},
                        {
                            "type": "text",
                            "value": "Don’t spend your time with hundreds of options. Spend it on important things instead.",
                        },
                    ],
                },
            },
            {
                "type": "layout_1_col_center",
                "value": {
                    "css_classes": "vsp-remove-padding-bottom",
                    "column": [
                        {
                            "type": "headline",
                            "value": "You never got that much stuff done.",
                        },
                        {
                            "type": "text",
                            "value": "A todo list is perfect for all your tasks. Doing laundry? Going shopping? Cleaning your cat’s litter box? Whatever it is: You will get it done.",
                        },
                    ],
                },
            },
            {
                "type": "layout_1_col_wide",
                "value": {
                    "css_classes": "vsp-remove-padding-top",
                    "align": "center",
                    "column": [
                        {"type": "image", "value": images["illu-apps.png"]},
                        {
                            "type": "richtext",
                            "value": "<h2>Secure from the get go.<br />Scalable into infinity and beyond.<br />Updated within minutes.</h2>",
                        },
                    ],
                },
            },
            {
                "type": "layout_flex",
                "value": {
                    "css_classes": "",
                    "id": "features",
                    "align": "start",
                    "elements": [
                        [
                            {
                                "type": "richtext",
                                "value": "<h5>Features</h5><h1>We&#x27;ve got your stuff covered.</h1><p>You want to write down tasks and keep track of them and – hopefully – check them. Let us help you with that. </p><p></p><p></p>",
                            },
                            {
                                "type": "button",
                                "value": {
                                    "button_text": "Get the app",
                                    "link": f"{webapp_url}",
                                    "flat_button": True,
                                },
                            },
                        ],
                        [
                            {"type": "image", "value": images["placeholder.png"]},
                            {
                                "type": "richtext",
                                "value": "<br><h4>Add new stuff.</h4><p>You can simply add new todos to the app whenever you want. And let’s be honest for a second. What else would really need from it?</p>",
                            },
                        ],
                        [
                            {"type": "image", "value": images["placeholder.png"]},
                            {
                                "type": "richtext",
                                "value": "<br><h4>Keep track of your stuff.</h4><p>Never forget a task ever again. At least as long as it’s in your todo list. If you delete it, it’s not our fault.</p>",
                            },
                        ],
                        [
                            {"type": "image", "value": images["placeholder.png"]},
                            {
                                "type": "richtext",
                                "value": "<br><h4>Search stuff you can’t find.</h4><p>Your list is getting too big? You can’t really keep track of things anymore? Don’t worry. There’s a search bar ready to go.</p>",
                            },
                        ],
                        [
                            {"type": "image", "value": images["placeholder.png"]},
                            {
                                "type": "richtext",
                                "value": "<br><h4>Complete stuff.</h4><p>Make those sweet, sweet checkmarks and get rid of all the todos you have completed. We’re proud of you. And you should be, too!</p>",
                            },
                        ],
                        [
                            {"type": "image", "value": images["placeholder.png"]},
                            {
                                "type": "richtext",
                                "value": "<br><h4>Enjoy your life after the stuff is done.</h4><p>You did it! You succesfully completed your todos. Now go ahead and enjoy your life. But do it quickly. The next todos are already waiting for you.</p>",
                            },
                        ],
                    ],
                },
            },
            {
                "type": "pricing",
                "value": {
                    "css_classes": "",
                    "id": "pricing",
                    "title": "How much all of it even costs?",
                    "column_1": [
                        {"type": "headline", "value": "Basic"},
                        {
                            "type": "feature_list",
                            "value": {
                                "features": [
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "You get a very nice first feature.",
                                    },
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "There’s a second feature as well!",
                                    },
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "And a third one!",
                                    },
                                ]
                            },
                        },
                        {
                            "type": "update_text",
                            "value": "free updates for a year then <b>99€ / month</b> (optional)",
                        },
                        {
                            "type": "price_amount",
                            "value": {
                                "amount": "15€",
                                "duration": "per month",
                                "buy_now": "or one time payment of 1.490,00€",
                                "button": [
                                    {
                                        "type": "button",
                                        "value": {
                                            "button_text": "This is also an option",
                                            "link": f"{webapp_url}",
                                            "flat_button": False,
                                        },
                                    }
                                ],
                            },
                        },
                    ],
                    "column_2": [
                        {"type": "headline", "value": "Premium"},
                        {
                            "type": "feature_list",
                            "value": {
                                "features": [
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "<b>All the Basic features are included already.</b>",
                                    },
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "The first premium feature is just really awesome.",
                                    },
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "And the second one as well!",
                                    },
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "The third one will just make your jaw drop. ",
                                    },
                                ]
                            },
                        },
                        {
                            "type": "update_text",
                            "value": "free updates for a year then <b>99€ / month</b> (optional)",
                        },
                        {
                            "type": "price_amount",
                            "value": {
                                "amount": "49€",
                                "duration": "for 12 months",
                                "buy_now": "or one time payment of 3.990,00€",
                                "button": [
                                    {
                                        "type": "button",
                                        "value": {
                                            "button_text": "Hey Choose this",
                                            "link": f"{webapp_url}",
                                            "flat_button": True,
                                        },
                                    }
                                ],
                            },
                        },
                    ],
                    "column_3": [
                        {"type": "headline", "value": "Enterprise"},
                        {
                            "type": "feature_list",
                            "value": {
                                "features": [
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "<b>Get the basic and premium stuff by default.</b>",
                                    },
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "This is it! The big one. The feature you’ve waited for.",
                                    },
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "The second one is just dreamy.",
                                    },
                                    {
                                        "image": images["feature-bullet.png"],
                                        "title": "And the third one closes the deal for good. ",
                                    },
                                ]
                            },
                        },
                        {
                            "type": "update_text",
                            "value": "free updates for a year then <b>99€ / month</b> (optional)",
                        },
                        {
                            "type": "price_amount",
                            "value": {
                                "amount": "99€",
                                "duration": "per month",
                                "buy_now": "or one time payment of 19.990,00€",
                                "button": [
                                    {
                                        "type": "button",
                                        "value": {
                                            "button_text": "This is also an option",
                                            "link": f"{webapp_url}",
                                            "flat_button": False,
                                        },
                                    }
                                ],
                            },
                        },
                    ],
                    "additional_info": [
                        {
                            "type": "title",
                            "value": "Or maybe you just want to see what this is all about. Try out our preview!",
                        },
                        {
                            "type": "button",
                            "value": {
                                "button_text": "Get the app",
                                "link": f"{webapp_url}",
                                "flat_button": False,
                            },
                        },
                    ],
                },
            },
            {
                "type": "layout_4_col",
                "value": {
                    "css_classes": "",
                    "align": "center",
                    "title": "Everything you could ask for.",
                    "column_1": [
                        {"type": "image", "value": images["todologo-circle.png"]},
                        {
                            "type": "text",
                            "value": "It’s fantastic, as this point makes clear.",
                        },
                    ],
                    "column_2": [
                        {"type": "image", "value": images["todologo-circle.png"]},
                        {
                            "type": "text",
                            "value": "It’s great, tells this point.",
                        },
                    ],
                    "column_3": [
                        {"type": "image", "value": images["todologo-circle.png"]},
                        {
                            "type": "text",
                            "value": "It’s marvelous, whispers the third one.",
                        },
                    ],
                    "column_4": [
                        {"type": "image", "value": images["todologo-circle.png"]},
                        {
                            "type": "text",
                            "value": "It’s ok. The last point isn’t as exited.",
                        },
                    ],
                },
            },
        ]

        translatable_root_page.add_child(instance=home_page_en)

        # -- TOS Page
        tos_page = FlexPage(title="Terms of Services", slug="tos", show_in_menus=True)
        tos_page.body.is_lazy = True
        tos_content_file = open("webapp/website/example_content/terms_of_service.txt", "r")
        tos_content = tos_content_file.read()
        tos_page.body.stream_data = [
            {
                "type": "layout_1_col_wide",
                "value": {
                    "align": "start",
                    "column": [{"type": "richtext", "value": tos_content}],
                },
            }
        ]
        home_page_en.add_child(instance=tos_page)

        # -- Privacy Policy Page
        privacy_page = FlexPage(title="Privacy Policy", slug="privacy", show_in_menus=True)
        privacy_page.body.is_lazy = True
        privacy_policy_content_file = open("webapp/website/example_content/privacy_policy.txt", "r")
        privacy_policy_content = privacy_policy_content_file.read()
        privacy_page.body.stream_data = [
            {
                "type": "layout_1_col_wide",
                "value": {
                    "align": "start",
                    "column": [{"type": "richtext", "value": privacy_policy_content}],
                },
            }
        ]
        home_page_en.add_child(instance=privacy_page)

        # -- Contact Page
        contact_page = FlexPage(title="Contact", slug="contact", show_in_menus=True)
        contact_page.body.is_lazy = True
        contact_page.body.stream_data = [
            {
                "type": "hero",
                "value": {
                    "background_color": "primary-A100",
                    # "background_image": images['bg-elements.png'],
                    "primary_content": [
                        {
                            "type": "headline",
                            "value": "Interested in managing your todos with us?",
                        },
                        {
                            "type": "richtext",
                            "value": "<p><a href='mail:arqdevteam@gmail.com'>arqdevteam@gmail.com</a></p><p><a href='tel:+18505099090'>+18505099090</a></p><p>ARQITEQT<br> 2910 Kerry Forest Pkwy<br>#D4-217<br>32309 Tallahassee<br> </p>",
                        },
                    ],
                    "secondary_content": [
                        {
                            "type": "image",
                            "value": images["contact.png"],
                        }
                    ],
                },
            }
        ]
        home_page_en.add_child(instance=contact_page)

        # -- Jobs Page
        jobs_page = FlexPage(title="Jobs", slug="jobs", show_in_menus=True)
        jobs_page.body.is_lazy = True
        jobs_page.body.stream_data = [
            {
                "type": "hero",
                "value": {
                    "background_color": "primary-A100",
                    # "background_image": images['bg-elements.png'],
                    "primary_content": [
                        {
                            "type": "headline",
                            "value": "We are hiring",
                        },
                        {
                            "type": "subtitle",
                            "value": "At the moment we don't have any vacancies. but you are welcome to write us a few lines about why we absolutely should have you in our team.",
                        },
                    ],
                },
            }
        ]
        home_page_en.add_child(instance=jobs_page)

        # -- Imprint Page
        imprint_page = FlexPage(title="Imprint", slug="imprint", show_in_menus=True)
        imprint_page.body.is_lazy = True
        imprint_page.body.stream_data = [
            {
                "type": "layout_1_col_wide",
                "value": {
                    "align": "start",
                    "column": [
                        {
                            "type": "richtext",
                            "value": "<h1>Imprint</h1><p></br></p><h3>Media owner of the website:</h3><p>ARQITEQT</br>2910 Kerry Forest Pkwy</br>#D4-217</br>32309 Tallahassee</br></br><a href='mail:arqdevteam@gmail.com'>arqdevteam@gmail.com</a></br><a href='+18505099090'>+18505099090</a></br></br>Head Office:  </br>Commercial Register Court: LG für ZRS Graz</br>UID: </br>Place of Jurisdiction: HG Graz</br> <a href='/en/privacy'>Privacy Policy</a> </p>",
                        }
                    ],
                },
            }
        ]
        home_page_en.add_child(instance=imprint_page)

        # -- Footer Snippet
        footer_en = Footer.objects.create(
            column_1="<p>Interested in<br/>working with us?</p>"
            '<p><a href="/en/contact">Get in touch.</a></p>',
            column_2="<p>ARQITEQT<br/>"
            "2910 Kerry Forest Pkwy<br/>"
            "#D4-217<br/>"
            "32309 Tallahassee<br/>"
            "</p><p>"
            '<a href="mail:arqdevteam@gmail.com">arqdevteam@gmail.com</a><br/>'
            '<a href="https://arqiteqt.io">https://arqiteqt.io</a><br/>'
            '<a href="tel:+18505099090">+18505099090</a></p>',
            column_3="<p>Interested in joining our team?"
            "</p><p>"
            '<a href="/en/jobs">'
            "See our job offerings</a></p>",
            copyright_info="ARQITEQT",
            language_code="en",
        )

        # -- add foooter menu

        footer_menu_en = FlatMenu(site=first_site, handle="footer_en", title="footer en")
        footer_menu_en.save()

        footer_menu_en_item_1 = FlatMenuItem.objects.create(
            menu=footer_menu_en, link_text="Imprint", link_page=imprint_page
        )
        footer_menu_en_item_2 = FlatMenuItem.objects.create(
            menu=footer_menu_en, link_text="Terms of Service", link_page=tos_page
        )

        footer_menu_en_item_3 = FlatMenuItem.objects.create(
            menu=footer_menu_en, link_text="Privacy Policy", link_page=privacy_page
        )

        # -- add header main menu

        header_main_menu_en = FlatMenu(
            site=first_site, handle="header_main_en", title="header main en"
        )
        header_main_menu_en.save()

        header_main_menu_en_item_1 = FlatMenuItem.objects.create(
            menu=header_main_menu_en,
            link_text="Contact",
            link_page=home_page_en,
            url_append="contact",
        )
        header_main_menu_en_item_2 = FlatMenuItem.objects.create(
            menu=header_main_menu_en,
            link_text="Pricing",
            link_page=home_page_en,
            url_append="#pricing",
        )
        header_main_menu_en_item_3 = FlatMenuItem.objects.create(
            menu=header_main_menu_en,
            link_text="Features",
            link_page=home_page_en,
            url_append="#features",
        )

        # -- add header secondary menu

        header_secondary_menu_en = FlatMenu(
            site=first_site, handle="header_secondary_en", title="header secondary en"
        )
        header_secondary_menu_en.save()

        header_secondary_menu_en_item_1 = FlatMenuItem.objects.create(
            menu=header_secondary_menu_en,
            link_text="Login",
            link_url=f"{webapp_url}/login",
        )
        header_secondary_menu_en_item_2 = FlatMenuItem.objects.create(
            menu=header_secondary_menu_en,
            link_text="Sign Up",
            link_url=f"{webapp_url}/signup",
        )

        self.stdout.write(self.style.SUCCESS("Successfully added example data"))
