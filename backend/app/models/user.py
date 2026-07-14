from app.extensions import db
from datetime import datetime
class User(db.Model):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # adding relationship to students table
    student = db.relationship("Student",back_populates="user",uselist=False,cascade='all, delete-orphan')

    company = db.relationship("Company",back_populates="user",uselist=False,cascade='all, delete-orphan')