from flask import Flask
import os
from config import Config
from app.extensions import db,mail

from app.routes.auth import auth_bp
from app.routes.student import student_bp
from app.routes.company import company_bp
from app.routes.admin import admin_bp
from app.routes.recruitment_routes import recruitment_bp
from app.routes.frontend import frontend_bp
from app.routes.analytics import analytics_bp
from app.routes.export_routes import export_bp

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def create_app():

    app = Flask(
        __name__,
        template_folder=os.path.join(BASE_DIR, "frontend"),
        static_folder=os.path.join(BASE_DIR, "frontend", "assets"))
    
    app.config.from_object(Config)
    app.config["RESUME_UPLOAD_FOLDER"] = Config.RESUME_UPLOAD_FOLDER

    os.makedirs(app.config["RESUME_UPLOAD_FOLDER"], exist_ok=True)

    app.config["LOGO_UPLOAD_FOLDER"] = Config.LOGO_UPLOAD_FOLDER

    os.makedirs(app.config["LOGO_UPLOAD_FOLDER"], exist_ok=True)        

    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(company_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(recruitment_bp)
    app.register_blueprint(frontend_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(export_bp)

    

    return app