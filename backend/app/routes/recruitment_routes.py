from datetime import datetime
import os

from flask import Blueprint
from flask import jsonify, session, send_file
from app.models.company import Company
from app.models.application import Application
from app.models.placement_drive import PlacementDrive
from app.extensions import db
from app.utils.decorators import login_required, role_required
from app.utils.pdf_generator import generate_offer_letter_pdf
from app.utils.activity_logger import log_activity

from app.utils.mail import send_email

BACKEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

recruitment_bp = Blueprint("recruitment",__name__,url_prefix="/company")

@recruitment_bp.route("/applications/<int:application_id>/generate-offer",methods=["PATCH"])
@login_required
@role_required("company")
def generate_offer_letter(application_id):

    company = Company.query.filter_by(user_id=session["user_id"]).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found"
        }), 404

    application = Application.query.join(PlacementDrive).filter(
        Application.id == application_id,
        PlacementDrive.company_id == company.id
    ).first()

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found"
        }), 404

    student = application.student

    
    if application.status != "selected":
        return jsonify({
            "success": False,
            "message": "Offer letter can only be generated for selected students"
        }), 400

    recruitment = application.recruitment_process

    if not recruitment:
        return jsonify({
            "success": False,
            "message": "Recruitment process not found"
        }), 404

    if recruitment.recruitment_status != "completed":
        return jsonify({
            "success": False,
            "message": "Recruitment process is not yet completed."
        }), 400

    if recruitment.offer_letter_generated:
        return jsonify({
            "success": False,
            "message": "Offer letter has already been generated."
        }), 409

    log_activity(
        user_id=session["user_id"],
        role="company",
        action="Offer Generated",
        entity_type="Recruitment",
        entity_id=recruitment.id,
        description=f"Offer generated for {student.full_name}"

    )

    try:

        filepath = generate_offer_letter_pdf(application)

        recruitment.offer_letter_generated = True
        recruitment.offer_letter_path = filepath

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Offer letter generated successfully.",
            "offer_letter_path": filepath,
            "recruitment": recruitment.to_dict()
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to generate offer letter.",
            "error": str(e)
        }), 500
    

# for testing mail sent 
@recruitment_bp.route("/test-email", methods=["GET"])
def test_email():

    try:

        send_email(
            subject="Placement Portal Test Email",
            recipients=["24f1002369@ds.study.iitm.ac.in","kathirezhil2310288@ssn.edu.in"],  
            body="Congratulations! Your Flask-Mail configuration is working successfully."
        )

        return jsonify({
            "success": True,
            "message": "Email sent successfully."
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@recruitment_bp.route("/applications/<int:application_id>/send-offer", methods=["PATCH"])
@login_required
@role_required("company")
def send_offer_letter(application_id):

    company = Company.query.filter_by(user_id=session["user_id"]).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found."
        }), 404

    application = (
        Application.query
        .join(PlacementDrive)
        .filter(
            Application.id == application_id,
            PlacementDrive.company_id == company.id
        )
        .first()
    )

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found."
        }), 404

    if application.status != "selected":
        return jsonify({
            "success": False,
            "message": "Offer letter can only be sent to selected students."
        }), 400

    recruitment = application.recruitment_process

    if not recruitment:
        return jsonify({
            "success": False,
            "message": "Recruitment process not found."
        }), 404

    if not recruitment.offer_letter_generated:
        return jsonify({
            "success": False,
            "message": "Generate the offer letter before sending it."
        }), 400

    if recruitment.offer_letter_sent:
        return jsonify({
            "success": False,
            "message": "Offer letter has already been sent."
        }), 409

    if not os.path.exists(recruitment.offer_letter_path):
        return jsonify({
            "success": False,
            "message": "Offer letter file not found. Please generate it again."
        }), 404

    student = application.student

    log_activity(
        user_id=session["user_id"],
        role="company",
        action="Offer Sent",
        entity_type="Recruitment",
        entity_id=recruitment.id,
        description=f"Offer emailed to {student.full_name}"
    )

    try:
        print("OFFER EMAIL RECIPIENT:", student.college_email)
        send_email(subject="Placement Portal - Offer Letter",recipients=[student.college_email],
            body=f"""
Dear {student.full_name},

Congratulations!

We are pleased to inform you that you have been selected for the position of
{application.drive.title} at {company.company_name}.

Your offer letter is attached with this email.

We wish you all the best for your future.

Regards,
{company.company_name}
""",
            attachments=[
                {
                    "filename": os.path.basename(recruitment.offer_letter_path),
                    "path": recruitment.offer_letter_path,
                    "content_type": "application/pdf"
                }
            ]
        )

        recruitment.offer_letter_sent = True
        recruitment.offer_letter_sent_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Offer letter sent successfully.",
            "recruitment": recruitment.to_dict()
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to send offer letter.",
            "error": str(e)
        }), 500


@recruitment_bp.route("/applications/<int:application_id>/recruitment",methods=["GET"])
@login_required
@role_required("company")
def get_company_recruitment_details(application_id):

    company = Company.query.filter_by(user_id=session["user_id"]).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found."
        }), 404

    application = (Application.query.join(PlacementDrive).filter(
            Application.id == application_id,
            PlacementDrive.company_id == company.id
        )
        .first()
    )

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found."
        }), 404

    recruitment = application.recruitment_process

    if not recruitment:
        return jsonify({
            "success": False,
            "message": "Recruitment process has not started."
        }), 404

    drive = application.drive

    return jsonify({
        "success": True,
        "application": application.to_dict_company(),
        "student": application.to_dict_student(),
        "placement_drive": {
            "id": drive.id,
            "title": drive.title,
            "job_type": drive.job_type,
            "location": drive.location,
            "compensation": drive.compensation,

            "round1_required": drive.round1_required,
            "round1_name": drive.round1_name,

            "round2_required": drive.round2_required,
            "round2_name": drive.round2_name,

            "round3_required": drive.round3_required,
            "round3_name": drive.round3_name,

            "round4_required": drive.round4_required,
            "round4_name": drive.round4_name
        },
        "recruitment": recruitment.to_dict()
    }), 200


@recruitment_bp.route("/applications/<int:application_id>/offer-letter",methods=["GET"])
@login_required
@role_required("company")
def download_offer_letter_company(application_id):

    company = Company.query.filter_by(
        user_id=session["user_id"]
    ).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found."
        }), 404

    application = Application.query.join(PlacementDrive).filter(
        Application.id == application_id,
        PlacementDrive.company_id == company.id
    ).first()


    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found."
        }), 404

    recruitment = application.recruitment_process

    if not recruitment:
        return jsonify({
            "success": False,
            "message": "Recruitment process not found."
        }), 404

    if not recruitment.offer_letter_generated:
        return jsonify({
            "success": False,
            "message": "Offer letter has not been generated yet."
        }), 400

    offer_path = recruitment.offer_letter_path

    # First check whether the stored path is already valid
    if not os.path.isabs(offer_path):
        offer_path = os.path.abspath(offer_path)


    if not os.path.exists(offer_path):
        return jsonify({
            "success": False,
            "message": "Offer letter file not found."
        }), 404

    return send_file(
        offer_path,
        as_attachment=True,
        download_name=os.path.basename(offer_path),
        mimetype="application/pdf"
    )