import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:

    DATABASE_NAME = "placement.db"

    SECRET_KEY = "secret_key_1"

    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'instance', DATABASE_NAME)}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False