from flask_mail import Message
from app.extensions import mail
from flask import current_app


def send_email(subject, recipients, body, html=None, attachments=None):

    message = Message(subject=subject,recipients=recipients,sender=current_app.config["MAIL_DEFAULT_SENDER"])

    message.body = body

    if html:
        message.html = html

    if attachments:
        for attachment in attachments:
            with open(attachment["path"], "rb") as file:
                message.attach(
                    filename=attachment["filename"],
                    content_type=attachment["content_type"],
                    data=file.read()
                )

    mail.send(message)