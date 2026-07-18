from datetime import datetime

from app import db


class RecruitmentProcess(db.Model):
    __tablename__ = "recruitment_processes"

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer,db.ForeignKey("applications.id"),nullable=False,unique=True)
    recruitment_status = db.Column(db.String(20),nullable=False,default="not_started")
    round1_required = db.Column(db.Boolean, default=False)
    round1_name = db.Column(db.String(100))
    round1_completed = db.Column(db.Boolean, default=False)
    round1_status = db.Column(db.String(20), default="pending")
    round1_completed_at = db.Column(db.DateTime)
    round2_required = db.Column(db.Boolean, default=False)
    round2_name = db.Column(db.String(100))
    round2_completed = db.Column(db.Boolean, default=False)
    round2_status = db.Column(db.String(20), default="pending")
    round2_completed_at = db.Column(db.DateTime)
    round3_required = db.Column(db.Boolean, default=False)
    round3_name = db.Column(db.String(100))
    round3_completed = db.Column(db.Boolean, default=False)
    round3_status = db.Column(db.String(20), default="pending")
    round3_completed_at = db.Column(db.DateTime)
    round4_required = db.Column(db.Boolean, default=False)
    round4_name = db.Column(db.String(100))
    round4_completed = db.Column(db.Boolean, default=False)
    round4_status = db.Column(db.String(20), default="pending")
    round4_completed_at = db.Column(db.DateTime)
    current_round = db.Column(db.Integer,nullable=False,default=0)
    offer_letter_generated = db.Column(db.Boolean,default=False)
    offer_letter_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    updated_at = db.Column(db.DateTime,nullable=False,default=datetime.utcnow,onupdate=datetime.utcnow)


    application = db.relationship("Application",back_populates="recruitment_process")

    __table_args__ = (
        db.CheckConstraint(
            "recruitment_status IN ('not_started','in_progress','completed','cancelled')",
            name="check_recruitment_status"
        ),
        db.CheckConstraint(
            "round1_status IN ('pending','passed','failed','skipped')",
            name="check_round1_status"
        ),
        db.CheckConstraint(
            "round2_status IN ('pending','passed','failed','skipped')",
            name="check_round2_status"
        ),
        db.CheckConstraint(
            "round3_status IN ('pending','passed','failed','skipped')",
            name="check_round3_status"
        ),
        db.CheckConstraint(
            "round4_status IN ('pending','passed','failed','skipped')",
            name="check_round4_status"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "recruitment_status": self.recruitment_status,
            "round1_required": self.round1_required,
            "round1_name": self.round1_name,
            "round1_completed": self.round1_completed,
            "round1_status": self.round1_status,
            "round1_completed_at": self.round1_completed_at.isoformat() if self.round1_completed_at else None,
            "round2_required": self.round2_required,
            "round2_name": self.round2_name,
            "round2_completed": self.round2_completed,
            "round2_status": self.round2_status,
            "round2_completed_at": self.round2_completed_at.isoformat() if self.round2_completed_at else None,
            "round3_required": self.round3_required,
            "round3_name": self.round3_name,
            "round3_completed": self.round3_completed,
            "round3_status": self.round3_status,
            "round3_completed_at": self.round3_completed_at.isoformat() if self.round3_completed_at else None,
            "round4_required": self.round4_required,
            "round4_name": self.round4_name,
            "round4_completed": self.round4_completed,
            "round4_status": self.round4_status,
            "round4_completed_at": self.round4_completed_at.isoformat() if self.round4_completed_at else None,
            "current_round": self.current_round,
            "offer_letter_generated": self.offer_letter_generated,
            "offer_letter_path": self.offer_letter_path,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }