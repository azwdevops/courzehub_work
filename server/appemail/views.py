import os

from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.conf import settings

from core.views import generate_encoded_token

if settings.PRODUCTION:
    site_name = os.environ['SITE_NAME']
    site_url = os.environ['SITE_URL']
    email_sentby = os.environ['DEFAULT_SENDER_EMAIL']
else:
    from decouple import config
    site_name = config('SITE_NAME')
    site_url = config('SITE_URL')
    email_sentby = config('DEFAULT_SENDER_EMAIL')


class SendTokenEmail:
    # we use @classmethod to call the method without creating an instance i.e classname.methodname

    def get_encoded_token(self, **user_kwargs):
        # since uuid is not JSON serializable, we get it's value using hex attribute, this removes the dashes from uuid

        activation_token = generate_encoded_token(**user_kwargs)
        return activation_token

    # function to send account activation email
    @classmethod
    def send_user_activation_email(self, **user_kwargs):
        activation_token = self.get_encoded_token(self, **user_kwargs)
        subject = f"Account activation on {site_name}"

        body_text = f'Click this link to activate your account {site_url}/user/activate/{activation_token}/'
        html_content = get_template('appemail/account_activation_email.html')

        context = {
            **user_kwargs,
            'site_name': site_name,
            'site_url': site_url,
            'activation_token': activation_token,
        }

        body_html = html_content.render({**context})

        from_email = email_sentby
        to = user_kwargs['email']

        msg = EmailMultiAlternatives(subject, body_text, from_email, [to])
        msg.attach_alternative(body_html, "text/html")
        msg.send(fail_silently=False)

    # method to send password reset email

    @classmethod
    def send_password_reset_email(self, **user_kwargs):
        password_reset_token = self.get_encoded_token(self, **user_kwargs)
        subject = f"Account password reset on {site_name}"

        body_text = f'Click this link to reset your account password {site_url}/user/password-reset/{password_reset_token}/'
        html_content = get_template('appemail/password_reset_email.html')

        context = {
            **user_kwargs,
            'site_name': site_name,
            'site_url': site_url,
            'password_reset_token': password_reset_token,
        }

        body_html = html_content.render({**context})

        from_email = email_sentby
        to = user_kwargs['email']

        msg = EmailMultiAlternatives(subject, body_text, from_email, [to])
        msg.attach_alternative(body_html, "text/html")
        msg.send(fail_silently=False)
