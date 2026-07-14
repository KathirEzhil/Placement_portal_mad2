from flask import Flask

from config import Config
from app.extensions import db

from app.routes.auth import auth_bp
from app.routes.student import student_bp
from app.routes.company import company_bp

def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(company_bp)

    return app