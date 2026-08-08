import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:

    DATABASE_NAME = "placement.db"

    SECRET_KEY = "secret_key_1"

    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'instance', DATABASE_NAME)}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    OFFER_LETTER_FOLDER = "uploads/offer_letters"

    RESUME_UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "resumes")

    LOGO_UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "logos")

    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False

    MAIL_USERNAME = "24f1002369@ds.study.iitm.ac.in"
    MAIL_PASSWORD = "yrgwfxzngknijetg"

    MAIL_DEFAULT_SENDER = "24f1002369@ds.study.iitm.ac.in"