from datetime import datetime

from app.extensions import db

class PlacementDrive(db.Model):

    __tablename__ = "placement_drives"

    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer,db.ForeignKey("companies.id"),nullable=False)
    title = db.Column(db.String(150),nullable=False)
    description = db.Column(db.Text,nullable=False)
    job_type = db.Column(db.String(100),nullable=False)
    compensation = db.Column(db.String(100),nullable=False)
    location = db.Column(db.String(150),nullable=False)
    required_skills = db.Column(db.Text,nullable=False)
    selection_process = db.Column(db.Text,nullable=False)
    eligibility_cgpa = db.Column(db.Float,nullable=False)
    drive_date = db.Column(db.Date,nullable=False)
    last_date_to_apply = db.Column(db.Date,nullable=False)
    status = db.Column(db.String(50),nullable=False,default="pending")
    rejection_reason = db.Column(db.Text,nullable=True)
    created_at = db.Column(db.DateTime,nullable=False,default=datetime.utcnow)

    applications = db.relationship("Application",back_populates="drive",cascade="all, delete-orphan")

    __table_args__ = (
        db.CheckConstraint(
            "status IN ('pending', 'approved', 'rejected', 'closed')",
            name="check_drive_status"
        ),
        db.CheckConstraint(
            "job_type IN ('Internship', 'Full-Time', 'Full-Time + Internship')",
            name="check_job_type"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "job_type": self.job_type,
            "compensation": self.compensation,
            "location": self.location,
            "required_skills": self.required_skills,
            "selection_process": self.selection_process,
            "eligibility_cgpa": self.eligibility_cgpa,
            "drive_date": self.drive_date.isoformat(),
            "last_date_to_apply": self.last_date_to_apply.isoformat(),
            "status": self.status,
            "rejection_reason": self.rejection_reason,
            "created_at": self.created_at.isoformat(),
        }