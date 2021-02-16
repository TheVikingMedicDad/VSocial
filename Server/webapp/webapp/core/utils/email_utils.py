import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, EmailMessage, mail_admins
from django.template import TemplateDoesNotExist
from django.template.loader import render_to_string
from django.utils import translation
from django.contrib.auth import get_user_model

from webapp.core.utils.color import generate_mat_color_palette
from webapp.core.utils.common import clean_url_from_host_port
from webapp.core.utils.testing_email_backend import TestingEmailBackend

User = get_user_model()
log = logging.getLogger("cnc." + __name__)

a = TestingEmailBackend


def render_mail(template_prefix, email, context):
    """
    Renders an e-mail to `email`.  `template_prefix` identifies the
    e-mail that is to be sent, e.g. "account/email/email_confirmation"
    """
    subject = render_to_string("{0}_subject.txt".format(template_prefix), context)
    # remove superfluous line breaks
    subject = " ".join(subject.splitlines()).strip()
    # subject = self.format_email_subject(subject)

    bodies = {}
    for ext in ["html", "txt"]:
        try:
            template_name = "{0}_message.{1}".format(template_prefix, ext)
            bodies[ext] = render_to_string(template_name, context).strip()
        except TemplateDoesNotExist:
            if ext == "txt" and not bodies:
                # We need at least one body
                raise
    if "txt" in bodies:
        msg = EmailMultiAlternatives(subject, bodies["txt"], settings.DEFAULT_FROM_EMAIL, [email])
        if "html" in bodies:
            msg.attach_alternative(bodies["html"], "text/html")
    else:
        msg = EmailMessage(subject, bodies["html"], settings.DEFAULT_FROM_EMAIL, [email])
        msg.content_subtype = "html"  # Main content is now text/html
    return msg


def base_template_context():
    context = {}
    website_url = f"https://{settings.CSD_WEBSITE_DOMAIN_NAME}"
    webapp_url = f"https://{settings.CSD_PUBLIC_HOST}"
    context["project"] = {
        "colors": {
            "primary": generate_mat_color_palette(settings.CSD_COLOR_PRIMARY),
            "accent": generate_mat_color_palette(settings.CSD_COLOR_ACCENT),
            "warn": generate_mat_color_palette(settings.CSD_COLOR_WARN),
        },
        "domain": settings.CSD_DOMAIN_NAME,
        "cdn_domain": settings.CSD_WEBAPP_CDN_DOMAIN_NAME,
        "contact_email": settings.CSD_EMAIL_TRANSACTIONAL,
        "name": settings.CSD_DISPLAY_NAME,
        "company_address": settings.CSD_COMPANY_ADDRESS,
        "webapp": {"url": webapp_url},
        "website": {
            "domain": settings.CSD_WEBSITE_DOMAIN_NAME,
            "url": website_url,
            "terms_url": f"{website_url}/{settings.CSD_WEBSITE_TERMS_PATH}",
            "privacy_url": f"{website_url}/{settings.CSD_WEBSITE_PRIVACY_PATH}",
            "contact_url": f"{website_url}/{settings.CSD_WEBSITE_CONTACT_PATH}",
        },
    }
    return context


def send_mail(template_prefix, to, context=None, lang=None):
    if not context:
        context = {}
    context.update(base_template_context())

    language_code = translation.get_language()
    try:
        if lang:
            translation.activate(lang)
        else:
            try:
                user = User.objects.get(email=to)
                translation.activate(user.language)
            except User.DoesNotExist:
                # do not change language
                pass
        msg = render_mail(template_prefix, to, context)
        msg.send()
    finally:
        translation.activate(language_code)


def send_mail_admins(template_prefix, context):
    context["current_site"] = {"domain": settings.CSD_PUBLIC_HOST}
    try:
        subject = render_to_string("{0}_subject.txt".format(template_prefix), context)
        # remove superfluous line breaks
        subject = " ".join(subject.splitlines()).strip()
        msg = render_to_string("{0}_message.txt".format(template_prefix), context)
        log.debug("Send mail to admins: {}".format(msg))
        mail_admins(subject, message=msg)
    except Exception as e:
        log.exception(e)


def send_need_email_confirmation(user, key, to=None, signup=False):
    if not to:
        to = user.email

    confirmation_path_name = (
        settings.CSD_CONFIRM_REGISTRATION_PATH_NAME
        if signup
        else settings.CSD_CONFIRM_EMAIL_PATH_NAME
    )

    context = {
        "user": user,
        "key": key,
        "root_url": get_base_url(),
        "confirm_path_name": confirmation_path_name,
    }
    if signup:
        email_template = "users/email/need_signup_email_confirmation"
    else:
        email_template = "users/email/need_email_confirmation"
    send_mail(email_template, to, context, lang=user.language)


def send_password_reset_request(user, key):
    context = {
        "user": user,
        "key": key,
        "root_url": get_base_url(),
        "reset_password_path_name": settings.CSD_RESET_PASSWORD_PATH_NAME,
    }
    email_template = "users/email/password_reset_request"
    send_mail(email_template, user.email, context)


def get_base_url():
    return clean_url_from_host_port(settings.CSD_PUBLIC_HOST, settings.CSD_PUBLIC_HTTPS_PORT)
