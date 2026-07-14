from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models.user import User
from app.models.student import Student
from app.models.company import Company

def create_database(app):
    with app.app_context():
        db.create_all()

        # to check if already admin exists
        admin = User.query.filter_by(role="admin").first()
        if not admin:
            admin = User(
                email="admin@placementportal.com",
                password_hash=generate_password_hash("admin123"),
                role="admin"
            )
            db.session.add(admin)
            db.session.commit()