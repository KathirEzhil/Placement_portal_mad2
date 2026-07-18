from app.extensions import db
from datetime import  datetime

class Company(db.Model):

    __tablename__ = "companies"

    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey("users.id"),unique=True,nullable=False)
    company_name = db.Column(db.String(100),unique=True,nullable=False)
    industry_type = db.Column(db.String(100),nullable=False)
    company_domain = db.Column(db.String(100),nullable=False)
    website = db.Column(db.String(255),unique=True,nullable=False)
    hr_email = db.Column(db.String(250),nullable=False)
    hr_contact = db.Column(db.String(15))
    company_size = db.Column(db.Integer,nullable=False)
    logo = db.Column(db.String(255))
    location = db.Column(db.String(250),nullable=False)
    govt_verification_id = db.Column(db.String(100),unique=True)
    description = db.Column(db.Text)
    rejection_reason = db.Column(db.Text,nullable=True)
    approval_status = db.Column(db.String(20),default="pending",nullable=False)
    created_at = db.Column(db.DateTime,default=datetime.utcnow,nullable=False)

    user = db.relationship("User",back_populates = "company")

    drives = db.relationship("PlacementDrive",backref="company",lazy=True,cascade="all, delete-orphan")
