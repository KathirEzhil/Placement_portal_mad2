from datetime import datetime

from app.extensions import db

class Application(db.Model):

    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer,db.ForeignKey("students.id"),nullable=False)
    drive_id = db.Column(db.Integer,db.ForeignKey("placement_drives.id"),nullable=False)
    resume_used = db.Column(db.String(255),nullable=False)
    cover_letter = db.Column(db.Text)
    status = db.Column(db.String(40),nullable=False,default="applied")
    # current_round = db.Column(db.Integer,nullable=False,default=0)
    company_notes = db.Column(db.Text)
    rejection_reason = db.Column(db.Text)
    last_status_updated_by = db.Column(db.String(40),nullable=False,default="system")
    applied_at = db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    updated_at = db.Column(db.DateTime,nullable=False,default=datetime.utcnow,onupdate=datetime.utcnow)

    student = db.relationship("Student",back_populates="applications")

    drive = db.relationship("PlacementDrive",back_populates="applications")

    recruitment_process = db.relationship("RecruitmentProcess",back_populates="application",uselist=False,cascade="all, delete-orphan")

    __table_args__ = (
        db.UniqueConstraint("student_id","drive_id",name="unique_student_drive_application"),
        db.CheckConstraint("status IN ('applied','shortlisted','selected','rejected','withdrawn')",name="check_application_status"),
    )

    def to_dict_student(self):
        return {
            "id": self.id,

            "student_id": self.student_id,

            "drive": {
                "id": self.drive.id,
                "title": self.drive.title,
                "company_name": self.drive.company.company_name,
                "location": self.drive.location
            },

            "resume_used": self.resume_used,
            "cover_letter": self.cover_letter,

            "status": self.status,

            "recruitment": {
                "status": self.recruitment_process.recruitment_status,
                "current_round": self.recruitment_process.current_round
            },

            "rejection_reason": (
                self.rejection_reason
                if self.status == "rejected"
                else None
            ),

            "applied_at": self.applied_at.isoformat() if self.applied_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def to_dict_company(self):
        return {
            "id": self.id,

            "student": {
                "id": self.student.id,
                "name": self.student.full_name,
                "roll_number": self.student.roll_number,
                "branch": self.student.branch,
                "cgpa": self.student.cgpa
            },

            "student_id": self.student_id,
            "drive_id": self.drive_id,

            "resume_used": self.resume_used,
            "cover_letter": self.cover_letter,

            "status": self.status,

            "company_notes": self.company_notes,
            "rejection_reason": self.rejection_reason,

            "recruitment": {
                "status": self.recruitment_process.recruitment_status,
                "current_round": self.recruitment_process.current_round
            },

            "last_status_updated_by": self.last_status_updated_by,

            "applied_at": self.applied_at.isoformat() if self.applied_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
    

