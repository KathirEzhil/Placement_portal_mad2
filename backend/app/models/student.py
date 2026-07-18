from datetime import datetime

from app.extensions import db

class Student(db.Model):

    __tablename__ = "students"

    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey("users.id"),unique=True,nullable=False)
    college_email = db.Column(db.String(100),unique=True,nullable=False)
    personal_email = db.Column(db.String(100),unique=True)
    roll_number = db.Column(db.String(20),unique=True,nullable=False)
    graduation_year = db.Column(db.Integer,nullable=False)
    skills = db.Column(db.Text)
    linkedin_url = db.Column(db.String(255))
    github_url = db.Column(db.String(255))
    portfolio_url = db.Column(db.String(255))
    permanent_address = db.Column(db.Text,nullable=False)
    college_name = db.Column(db.String(100),nullable=False)
    stream = db.Column(db.String(100),nullable=False)
    branch = db.Column(db.String(150),nullable=False)
    cgpa = db.Column(db.Float,nullable=False)
    phone = db.Column(db.String(15),unique=True,nullable=False)
    year = db.Column(db.Integer,nullable=False)
    resume = db.Column(db.String(255))
    created_at = db.Column(db.DateTime,default=datetime.utcnow,nullable=False)

    # adding relationship to users table
    user = db.relationship("User",back_populates="student")

    applications = db.relationship("Application",back_populates="student",cascade="all, delete-orphan")