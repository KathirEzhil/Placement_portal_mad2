from flask import Blueprint, request, jsonify, session
from datetime import datetime,date

import os
from werkzeug.utils import secure_filename

from flask import current_app
from flask import send_from_directory

from app.extensions import db
from app.models.user import User
from app.models.company import Company
from app.models.placement_drive import PlacementDrive
from app.models.application import Application
from app.models.recruitment_process import RecruitmentProcess

from app.utils.decorators import login_required, role_required
from app.utils.activity_logger import log_activity

company_bp = Blueprint("company",__name__,url_prefix="/company")

VALID_APPLICATION_STATUSES = {"shortlisted","rejected"}

ALLOWED_LOGO_EXTENSIONS = {"png","jpg","jpeg"}

def allowed_logo(filename):

    return (
        "." in filename and
        filename.rsplit(".",1)[1].lower() in ALLOWED_LOGO_EXTENSIONS
    )


@company_bp.route("/profile",methods=["GET"])
@login_required
@role_required("company")
def get_profile():

    user = db.session.get(User, session["user_id"])
    company = user.company

    if company is None:
        return jsonify({
            "success": False,
            "profile_exists": False,
            "message": "company profile not found"
        }), 404
    
    return jsonify({
        "success": True,
        "profile_exists":True,
        "data":{
            "email": user.email,
            "company_name": company.company_name,
            "industry_type": company.industry_type,
            "company_domain": company.company_domain,
            "website": company.website,
            "hr_email": company.hr_email,
            "hr_contact": company.hr_contact,
            "company_size": company.company_size,
            "logo": company.logo,
            "location": company.location,
            "govt_verification_id": company.govt_verification_id,
            "description": company.description,
            "approval_status": company.approval_status
        }
    }), 200



@company_bp.route("/profile",methods=["PUT"])
@login_required
@role_required("company")
def update_profile():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body must be in JSON format"
        }), 400
    
    company_name = data.get("company_name","").strip()
    industry_type = data.get("industry_type")
    company_domain = data.get("company_domain")
    website = data.get("website","").strip()
    company_size = data.get("company_size")
    logo = data.get("logo")
    hr_email = data.get("hr_email")
    hr_contact = data.get("hr_contact")
    location = data.get("location","").strip()
    govt_verification_id = data.get("govt_verification_id")
    description = data.get("description", "").strip()

    if not company_name:
        return jsonify({
            "success": False,
            "message": "Company name is required"
        }), 400

    if not location:
        return jsonify({
            "success": False,
            "message": "Location is required"
        }), 400
    
    if not website:
        return jsonify({
            "success": False,
            "message": "Website url is required"
        }), 400
    
    if not industry_type or not company_domain:
        return jsonify({
            "success": False,
            "message": "Both insutry type and company_domain are required"
        }), 400
    
    if not hr_email or not company_size:
        return jsonify({
            "success": False,
            "message": "Both company_size and HR email id is required."
        }), 400

    user = db.session.get(User, session["user_id"])
    company = user.company

    existing_company = Company.query.filter_by(company_name=company_name).first()

    if existing_company and existing_company.user_id != user.id:
        return jsonify({
            "success": False,
            "message": "Company name already exists"
        }), 409
    
    if len(company_name) < 3:
        return jsonify({
            "success": False,
            "message": "Company name must be at least 3 characters long."
        }), 400
    
    if len(location) < 2:
        return jsonify({
            "success": False,
            "message": "Location is too short."
        }), 400
    
    if not (website.startswith("http://") or website.startswith("https://")):
        return jsonify({
            "success": False,
            "message": "Website must start with http:// or https://"
        }), 400
    
    if company_size < 100:
        return jsonify({
            "success": False,
            "message": "Company should be well established with more than 100 members."
        }), 400
    
    if company is None:
        
        company = Company(
            user_id = user.id,
            company_name = company_name,
            industry_type = industry_type,
            company_domain = company_domain,
            company_size = company_size,
            logo = logo,
            website = website,
            hr_email = hr_email,
            hr_contact = hr_contact,
            location = location,
            govt_verification_id = govt_verification_id,
            description = description
        )

        db.session.add(company)
    
    else:

        company.company_name = company_name
        company.industry_type = industry_type
        company.company_domain = company_domain
        company.company_size = company_size
        company.logo = logo
        company.website = website
        company.hr_email = hr_email
        company.hr_contact = hr_contact
        company.location = location
        company.govt_verification_id = govt_verification_id
        company.description = description

    try:

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Company profile updated successfully"
        }), 200
    
    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to update company profile",
            "error": str(e)
        }), 500
    

@company_bp.route("/drive", methods=["POST"])
@login_required
@role_required("company")
def create_drive():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No input data provided"
        }), 400
    
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    job_type = data.get("job_type", "").strip()
    compensation = data.get("compensation", "").strip()
    location = data.get("location", "").strip()
    required_skills = data.get("required_skills", "").strip()
    selection_process = data.get("selection_process", "").strip()
    round1_required = data.get("round1_required", False)
    round1_name = data.get("round1_name", "").strip()

    round2_required = data.get("round2_required", False)
    round2_name = data.get("round2_name", "").strip()

    round3_required = data.get("round3_required", False)
    round3_name = data.get("round3_name", "").strip()

    round4_required = data.get("round4_required", False)
    round4_name = data.get("round4_name", "").strip()
    eligibility_cgpa = data.get("eligibility_cgpa")
    drive_date = data.get("drive_date")
    last_date_to_apply = data.get("last_date_to_apply")

    required_fields = {
        "title": title,
        "description": description,
        "job_type": job_type,
        "compensation": compensation,
        "location": location,
        "required_skills": required_skills,
        "selection_process": selection_process,
        "eligibility_cgpa": eligibility_cgpa,
        "drive_date": drive_date,
        "last_date_to_apply": last_date_to_apply
    }

    missing_fields = [field for field, value in required_fields.items() if value in [None, ""]]

    if missing_fields:
        return jsonify({
            "success": False,
            "message": f"Missing required fields: {', '.join(missing_fields)}"
        }), 400

    rounds = [
        (1, round1_required, round1_name),
        (2, round2_required, round2_name),
        (3, round3_required, round3_name),
        (4, round4_required, round4_name),
    ]

    required_round_count = 0

    for number, required, name in rounds:

        if required:
            required_round_count += 1

            if not name:
                return jsonify({
                    "success": False,
                    "message": f"Round {number} name is required."
                }), 400

    if required_round_count == 0:
        return jsonify({
            "success": False,
            "message": "At least one recruitment round must be selected."
        }), 400

    if round2_required and not round1_required:
        return jsonify({
            "success": False,
            "message": "Round 1 must be enabled before Round 2."
        }), 400

    if round3_required and not round2_required:
        return jsonify({
            "success": False,
            "message": "Round 2 must be enabled before Round 3."
        }), 400

    if round4_required and not round3_required:
        return jsonify({
            "success": False,
            "message": "Round 3 must be enabled before Round 4."
        }), 400
    
    user_id = session["user_id"]
    company = Company.query.filter_by(user_id=user_id).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found"
        }), 404
    
    if company.approval_status != "approved":
        return jsonify({
            "success": False,
            "message": "Your company is not approved to create placement drives"
        }), 403
    
    # job_type validation
    allowed_job_types = ["Internship","Full-Time","Full-Time + Internship"]
    if job_type not in allowed_job_types:
        return jsonify({
            "success": False,
            "message": "Invalid job type"
        }), 400
    
    # cgpa requirement validation
    try:
        eligibility_cgpa = float(eligibility_cgpa)
    
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Eligibility cgpa must be a valid number"
        }), 400
    if eligibility_cgpa < 0 or eligibility_cgpa > 10:
        return jsonify({
            "success": False,
            "message": "Eligibility CGPA must be between 0 and 10."
        }), 400
    
    # date validation
    try:
        drive_date = datetime.strptime(drive_date,"%Y-%m-%d").date()
        last_date_to_apply = datetime.strptime(last_date_to_apply,"%Y-%m-%d").date()

    except ValueError:
        return jsonify({
            "success": False,
            "message": "Dates must be in YYYY-MM-DD format"
        }), 400
    
    # validate application deadline - deadline be before drive date
    if last_date_to_apply > drive_date:
        return jsonify({
            "success": False,
            "message": "Last date to apply cannot be after the drive date"
        }), 400
    
    # check past dates
    today = date.today()
    if drive_date < today:
        return jsonify({
            "success": False,
            "message": "Drive date cannot be in the past."
        }), 400
    if last_date_to_apply < today:
        return jsonify({
            "success": False,
            "message": "Last date to apply cannot be in the past."
        }), 400
    
    new_drive = PlacementDrive(
        company_id=company.id,
        title=title,
        description=description,
        job_type=job_type,
        compensation=compensation,
        location=location,
        required_skills=required_skills,
        selection_process=selection_process,
        round1_required=round1_required,
        round1_name=round1_name,

        round2_required=round2_required,
        round2_name=round2_name,

        round3_required=round3_required,
        round3_name=round3_name,

        round4_required=round4_required,
        round4_name=round4_name,
        eligibility_cgpa=eligibility_cgpa,
        drive_date=drive_date,
        last_date_to_apply=last_date_to_apply,
        status="pending"
    )


    try:
        db.session.add(new_drive)
        db.session.commit()

        log_activity(
            user_id=session["user_id"],
            role="company",
            action="Created Drive",
            entity_type="PlacementDrive",
            entity_id=new_drive.id,
            description=f"{company.company_name} created {new_drive.title}")
    
    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to create placement drive",
            "error": str(e)
        }), 500
    
    return jsonify({
        "success": True,
        "message": "Placement drive created successfully, waiting for admin approval",
        "drive_id": new_drive.id
    }), 201


@company_bp.route("/drives",methods=["GET"])
@login_required
@role_required("company")
def get_company_drives():

    user_id = session.get("user_id")
    company = Company.query.filter_by(user_id=user_id).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found."
        }), 404
    
    drives = PlacementDrive.query.filter_by(company_id = company.id).all()

    drives_data = []
    for drive in drives:
        drives_data.append({
            "id": drive.id,
            "title": drive.title,
            "job_type": drive.job_type,
            "location": drive.location,
            "compensation": drive.compensation,
            "eligibility_cgpa": drive.eligibility_cgpa,
            "drive_date": drive.drive_date.isoformat(),
            "last_date_to_apply": drive.last_date_to_apply.isoformat(),
            "status": drive.status,
            "created_at": drive.created_at.isoformat()
        })

    return jsonify({
        "success": True,
        "drives": drives_data
    }), 200


@company_bp.route("/drives/<int:drive_id>",methods=["GET"])
@login_required
@role_required("company")
def get_company_drive(drive_id):

    user_id = session.get("user_id")
    company = Company.query.filter_by(user_id = user_id).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found"
        }), 404
    
    drive = db.session.get(PlacementDrive, drive_id)

    if not drive:
        return jsonify({
            "success": False,
            "message": "Placement drive not found."
        }), 404
    
    if drive.company_id != company.id:
        return jsonify({
            "success": False,
            "message": "You are not authorized to view this placement drive."
        }), 403
    
    return jsonify({
        "success": True,
        "drive": drive.to_dict()
    }), 200

@company_bp.route("/drive/<int:drive_id>",methods=["PUT"])
@login_required
@role_required("company")
def update_drive(drive_id):

    user_id = session.get("user_id")
    company = Company.query.filter_by(user_id=user_id).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found"
        }), 404
    
    drive = db.session.get(PlacementDrive,drive_id)

    if not drive:
        return jsonify({
            "success": False,
            "message": "Placement drive not found"
        }), 404
    
    if drive.company_id != company.id:
        return jsonify({
            "success": False,
            "message": "You are not authenticated to update this placement drive"
        }), 403
    
    if drive.status != "pending":
        return jsonify({
            "success": False,
            "message": "Only pending placement drives can be updated"
        }), 403

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No input data provided"
        }), 400


    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    job_type = data.get("job_type", "").strip()
    compensation = data.get("compensation", "").strip()
    location = data.get("location", "").strip()
    required_skills = data.get("required_skills", "").strip()
    selection_process = data.get("selection_process", "").strip()
    eligibility_cgpa = data.get("eligibility_cgpa")
    drive_date = data.get("drive_date")
    last_date_to_apply = data.get("last_date_to_apply")
    round1_required = data.get("round1_required", False)
    round1_name = data.get("round1_name", "").strip()

    round2_required = data.get("round2_required", False)
    round2_name = data.get("round2_name", "").strip()

    round3_required = data.get("round3_required", False)
    round3_name = data.get("round3_name", "").strip()

    round4_required = data.get("round4_required", False)
    round4_name = data.get("round4_name", "").strip()

    # again valiidate all the fields(okay to repeat the same for now)

    # job_type validation
    allowed_job_types = ["Internship","Full-Time","Full-Time + Internship"]
    if job_type not in allowed_job_types:
        return jsonify({
            "success": False,
            "message": "Invalid job type"
        }), 400
    
    # cgpa requirement validation
    try:
        eligibility_cgpa = float(eligibility_cgpa)
    
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Eligibility cgpa must be a valid number"
        }), 400
    if eligibility_cgpa < 0 or eligibility_cgpa > 10:
        return jsonify({
            "success": False,
            "message": "Eligibility CGPA must be between 0 and 10."
        }), 400
    
    # date validation
    try:
        drive_date = datetime.strptime(drive_date,"%Y-%m-%d").date()
        last_date_to_apply = datetime.strptime(last_date_to_apply,"%Y-%m-%d").date()

    except ValueError:
        return jsonify({
            "success": False,
            "message": "Dates must be in YYYY-MM-DD format"
        }), 400

    rounds = [
        (1, round1_required, round1_name),
        (2, round2_required, round2_name),
        (3, round3_required, round3_name),
        (4, round4_required, round4_name),
    ]

    required_round_count = 0

    for number, required, name in rounds:

        if required:
            required_round_count += 1

            if not name:
                return jsonify({
                    "success": False,
                    "message": f"Round {number} name is required."
                }), 400

    if required_round_count == 0:
        return jsonify({
            "success": False,
            "message": "At least one recruitment round must be selected."
        }), 400

    if round2_required and not round1_required:
        return jsonify({
            "success": False,
            "message": "Round 1 must be enabled before Round 2."
        }), 400

    if round3_required and not round2_required:
        return jsonify({
            "success": False,
            "message": "Round 2 must be enabled before Round 3."
        }), 400

    if round4_required and not round3_required:
        return jsonify({
            "success": False,
            "message": "Round 3 must be enabled before Round 4."
        }), 400
    
    # validate application deadline - deadline be before drive date
    if last_date_to_apply > drive_date:
        return jsonify({
            "success": False,
            "message": "Last date to apply cannot be after the drive date"
        }), 400
    
    # check past dates
    today = date.today()
    if drive_date < today:
        return jsonify({
            "success": False,
            "message": "Drive date cannot be in the past."
        }), 400
    if last_date_to_apply < today:
        return jsonify({
            "success": False,
            "message": "Last date to apply cannot be in the past."
        }), 400
    
    drive.title = title
    drive.description = description
    drive.job_type = job_type
    drive.compensation = compensation
    drive.location = location
    drive.required_skills = required_skills
    drive.selection_process = selection_process
    drive.round1_required = round1_required
    drive.round1_name = round1_name

    drive.round2_required = round2_required
    drive.round2_name = round2_name

    drive.round3_required = round3_required
    drive.round3_name = round3_name

    drive.round4_required = round4_required
    drive.round4_name = round4_name
    drive.eligibility_cgpa = eligibility_cgpa
    drive.drive_date = drive_date
    drive.last_date_to_apply = last_date_to_apply

    try:
        db.session.commit()
        log_activity(
        user_id=session["user_id"],
        role="company",
        action="Updated Drive",
        entity_type="PlacementDrive",
        entity_id=drive.id,
        description=f"{company.company_name} updated {drive.title}"
)

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to update placement drive",
            "error": str(e)
        }), 500
    
    return jsonify({
        "success":True,
        "message": "Placement drive updated successfully",
        "drive": drive.to_dict()
    }), 200


@company_bp.route("/drives/<int:drive_id>/applications", methods=["GET"])
@login_required
@role_required("company")
def get_drive_applications(drive_id):

    company = Company.query.filter_by(user_id=session["user_id"]).first()

    if not company:
        return jsonify({
            "success" : False,
            "message": "Company profile not found"
        }), 404
    
    drive = PlacementDrive.query.filter_by(id=drive_id,company_id=company.id).first()

    if not drive:
        return jsonify({
            "success": False,
            "message": "Placement drive not found"
        }), 404
    
    applications = Application.query.filter_by(drive_id=drive.id).order_by(Application.applied_at.desc()).all()

    return jsonify({
        "success": True,
       "applications": [application.to_dict_company() for application in applications]
    }), 200


@company_bp.route("/applications/<int:application_id>", methods=["GET"])
@login_required
@role_required("company")
def get_application(application_id):

    company = Company.query.filter_by(user_id=session["user_id"]).first()

    application = Application.query.join(PlacementDrive).filter(
        Application.id == application_id,
        PlacementDrive.company_id == company.id
    ).first()

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found"
        }), 404

    return jsonify({
        "success": True,
        "application": application.to_dict_company()
    }), 200


@company_bp.route("/applications/<int:application_id>/status",methods=["PUT"])
@login_required
@role_required("company")
def update_application_status(application_id):

    company = Company.query.filter_by(user_id=session["user_id"]).first()

    if not company:
        return jsonify({
            "success" : False,
            "message": "Company profile not found"
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

    data = request.get_json()
    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required."
        }), 400

    status = data.get("status")
    rejection_reason = data.get("rejection_reason")

    if status not in VALID_APPLICATION_STATUSES:
        return jsonify({
            "success": False,
            "message": "Invalid application status"
        }), 400

    if status == "rejected" and not rejection_reason:
        return jsonify({
            "success":False,
            "message":"Rejection reason is required."
        }),400

    if application.status == status:
        return jsonify({
            "success": False,
            "message": f"Application already has this status {status}"
        }), 409

    if application.status in ["withdrawn", "selected"]:
        return jsonify({
            "success": False,
            "message": f"Cannot update a {application.status} application."
        }), 400

    application.status = status

    application.last_status_updated_by = "company"

    if status == "rejected":
        application.rejection_reason = rejection_reason
    else:
        application.rejection_reason = None

    if status == "shortlisted":

        if application.recruitment_process is None:

            application.recruitment_process = RecruitmentProcess(
                application_id=application.id,
                recruitment_status="not_started",
                current_round=0
            )

            

    elif status == "rejected":
        if application.recruitment_process:
            application.recruitment_process.recruitment_status = "completed"

    try:
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Application status updated to {status} successfully.",
            "application": application.to_dict_company()
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "status update failed",
            "error": str(e)
        })


@company_bp.route("/applications/<int:application_id>/schedule-round", methods=["PATCH"])
@login_required
@role_required("company")
def schedule_recruitment_round(application_id):

    company = Company.query.filter_by(user_id=session["user_id"]).first()

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

    if application.status != "shortlisted":
        return jsonify({
            "success": False,
            "message": "Recruitment can only be started for shortlisted applications."
        }), 400

    recruitment = application.recruitment_process

    if not recruitment:
        return jsonify({
            "success": False,
            "message": "Recruitment process not found."
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required."
        }), 400

    round_number = data.get("round")
    
    scheduled_at = data.get("scheduled_at")

    if not scheduled_at:
        return jsonify({
            "success": False,
            "message": "Scheduled date and time are required."
        }), 400

    try:
        scheduled_at = datetime.fromisoformat(scheduled_at)
    except ValueError:
        return jsonify({
            "success": False,
            "message": "Invalid scheduled date and time format."
        }), 400
    
    meeting_details = data.get("meeting_details")

    test_link = data.get("test_link")

    if round_number not in [1, 2, 3, 4]:
        return jsonify({
            "success": False,
            "message": "Invalid round number."
        }), 400

    if not meeting_details and not test_link:
        return jsonify({
            "success": False,
            "message": "Provide either meeting_details or test_link."
        }), 400

    if not scheduled_at:
        return jsonify({
            "success": False,
            "message": "scheduled_at is required."
        }), 400

    is_required = getattr(application.drive,f"round{round_number}_required")

    if not is_required:
        return jsonify({
            "success": False,
            "message": f"Round {round_number} is not required for this placement drive."
        }), 400

    if getattr(recruitment, f"round{round_number}_completed"):
        return jsonify({
            "success": False,
            "message": f"Round {round_number} has already been completed."
        }), 409

    if recruitment.current_round > round_number:
        return jsonify({
            "success": False,
            "message": "Cannot schedule a previous round."
        }), 409

    if round_number > 1:

        previous_required = getattr(application.drive,f"round{round_number - 1}_required")

        previous_completed = getattr(recruitment,f"round{round_number - 1}_completed")

        if previous_required and not previous_completed:
            return jsonify({
                "success": False,
                "message": f"Complete Round {round_number - 1} before scheduling Round {round_number}."
            }), 409

    setattr(recruitment,f"round{round_number}_scheduled_at",scheduled_at)
    setattr(recruitment,f"round{round_number}_meeting_details",meeting_details)
    setattr(recruitment,f"round{round_number}_test_link",test_link)
    setattr(recruitment,f"round{round_number}_email_sent",False)

    recruitment.current_round = round_number
    recruitment.recruitment_status = "in_progress"

    try:
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Round {round_number} scheduled successfully.",
            "recruitment": recruitment.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to schedule round.",
            "error": str(e)
        }), 500


@company_bp.route("/applications/<int:application_id>/round-result",methods=["PATCH"])
@login_required
@role_required("company")
def update_round_result(application_id):

    company = Company.query.filter_by(user_id=session["user_id"]).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found"
        }), 404

    application = Application.query.join(PlacementDrive).filter(
        Application.id == application_id,
        PlacementDrive.company_id == company.id).first()

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found"
        }), 404

    student = application.student
    drive = application.drive

    

    if application.status != "shortlisted":
        return jsonify({
            "success": False,
            "message": "Only shortlisted applications can update round results"
        }), 400

    recruitment = application.recruitment_process

    if not recruitment:
        return jsonify({
            "success": False,
            "message": "Recruitment process not found."
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required."
        }), 400

    round_number = data.get("round")
    status = data.get("status")
    company_notes = data.get("company_notes")

    if round_number not in [1, 2, 3, 4]:
        return jsonify({
            "success": False,
            "message": "Invalid round number."
        }), 400

    if round_number > 1:

        previous_required = getattr(
            application.drive,
            f"round{round_number-1}_required"
        )

        previous_completed = getattr(
            recruitment,
            f"round{round_number-1}_completed"
        )

        if previous_required and not previous_completed:
            return jsonify({
                "success": False,
                "message": f"Round {round_number-1} must be completed first."
            }), 409

    if status not in ["passed","failed","skipped"]:
        return jsonify({
            "success": False,
            "message": "not a valid status"
        }), 400

    required = getattr(application.drive,f"round{round_number}_required")

    if not required:
        return jsonify({
            "success": False,
            "message": f"Round {round_number} is not required for this placement drive."
        }), 400

    scheduled_at = getattr(recruitment,f"round{round_number}_scheduled_at")

    if scheduled_at is None:
        return jsonify({
            "success": False,
            "message": f"Round {round_number} has not been scheduled"
        }), 400

    completed = getattr(recruitment,f"round{round_number}_completed")

    if completed:
        return jsonify({
            "success": False,
            "message": "this round has already been updated"
        }), 409

    setattr(recruitment,f"round{round_number}_status",status)
    setattr(recruitment,f"round{round_number}_completed",True)
    setattr(recruitment,f"round{round_number}_completed_at",datetime.utcnow())

    if company_notes:
        application.company_notes = company_notes

    if  status == "failed":

        application.status = "rejected"
        application.last_status_updated_by = "company"
        recruitment.recruitment_status = "completed"

        application.rejection_reason = (
            f"Rejected in Round {round_number}"
        )

        log_activity(
            user_id=session["user_id"],
            role="company",
            action="Rejected",
            entity_type="Application",
            entity_id=application.id,
            description=f"{student.full_name} rejected in Round {round_number} for {drive.title}"
        )

    elif status == "skipped":
        pass

    elif status == "passed":

        last_required_round = 0
        for i in range(1,5):
            if getattr(application.drive, f"round{i}_required"):
                last_required_round = i

        if round_number == last_required_round:
            application.status = "selected"
            application.last_status_updated_by = "company"
            recruitment.recruitment_status = "completed"
            recruitment.offer_letter_generated = False

            log_activity(
                user_id=session["user_id"],
                role="company",
                action="Shortlisted",
                entity_type="Application",
                entity_id=application.id,
                description=f"{student.full_name} Selected for {drive.title}"
            )

        else:
            application.status = "shortlisted"

    
        

    application.last_status_updated_by = "company"

    try:
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Round {round_number} updated successfully.",
            "application": application.to_dict_company(),
            "recruitment": recruitment.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to update round.",
            "error": str(e)
        }), 500


print("Dashboard route loaded")

# @company_bp.route("/dashboard", methods=["GET"])
# def company_dashboard():
#     return jsonify({
#         "success": True,
#         "message": "Dashboard working"
#     })

@company_bp.route("/dashboard", methods=["GET"])
@login_required
@role_required("company")
def company_dashboard():

    
    company = Company.query.filter_by(user_id=session["user_id"]).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found.",
            "profile_exists": False
        }), 404

    # Statistics
    total_drives = PlacementDrive.query.filter_by(company_id=company.id).count()

    pending_drives = PlacementDrive.query.filter_by(
        company_id=company.id,
        status="pending"
    ).count()

    approved_drives = PlacementDrive.query.filter_by(
        company_id=company.id,
        status="approved"
    ).count()

    total_applications = (
        db.session.query(Application)
        .join(PlacementDrive)
        .filter(PlacementDrive.company_id == company.id)
        .count()
    )

    shortlisted = (
        db.session.query(Application)
        .join(PlacementDrive)
        .filter(
            PlacementDrive.company_id == company.id,
            Application.status == "shortlisted"
        )
        .count()
    )

    selected = (
        db.session.query(Application)
        .join(PlacementDrive)
        .filter(
            PlacementDrive.company_id == company.id,
            Application.status == "selected"
        )
        .count()
    )

    recent_drives = (
        PlacementDrive.query
        .filter_by(company_id=company.id)
        .order_by(PlacementDrive.created_at.desc())
        .limit(5)
        .all()
    )

    return jsonify({

        "success": True,
        "profile_exists": True,

        "company": {
            "company_name": company.company_name,
            "approval_status": company.approval_status,
            "logo": company.logo
        },

        "stats": {
            "total_drives": total_drives,
            "pending_drives": pending_drives,
            "approved_drives": approved_drives,
            "total_applications": total_applications,
            "shortlisted": shortlisted,
            "selected": selected
        },

        "recent_drives": [
            drive.to_dict() for drive in recent_drives
        ]

    }), 200


@company_bp.route("/upload-logo", methods=["POST"])
@login_required
@role_required("company")
def upload_logo():

    company = Company.query.filter_by(user_id=session["user_id"]).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found."
        }),404

    if "logo" not in request.files:
        return jsonify({
            "success": False,
            "message": "No logo received."
        }),400

    file = request.files["logo"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "message": "No file selected."
        }),400

    if not allowed_logo(file.filename):
        return jsonify({
            "success": False,
            "message": "Only PNG, JPG and JPEG files are allowed."
        }),400

    # Delete old logo
    if company.logo:

        old_logo = os.path.join(
            current_app.config["LOGO_UPLOAD_FOLDER"],
            company.logo
        )

        if os.path.exists(old_logo):
            os.remove(old_logo)

    filename = secure_filename(file.filename)

    extension = filename.rsplit(".",1)[1].lower()

    new_filename = f"company_{company.id}_logo.{extension}"

    file.save(
        os.path.join(
            current_app.config["LOGO_UPLOAD_FOLDER"],
            new_filename
        )
    )

    company.logo = new_filename

    db.session.commit()

    return jsonify({

        "success": True,
        "message": "Logo uploaded successfully.",
        "filename": new_filename

    }),200


@company_bp.route("/view-logo", methods=["GET"])
@login_required
@role_required("company")
def view_logo():

    company = Company.query.filter_by(user_id=session["user_id"]).first()

    if not company or not company.logo:

        return jsonify({
            "success": False,
            "message": "Logo not found."
        }),404

    return send_from_directory(

        current_app.config["LOGO_UPLOAD_FOLDER"],

        company.logo,

        as_attachment=False

    )



@company_bp.route(
    "/applications/<int:application_id>/resume",
    methods=["GET"]
)
@login_required
@role_required("company")
def view_application_resume(application_id):

    application = Application.query.get(application_id)

    if not application:

        return jsonify({
            "success": False,
            "message": "Application not found."
        }), 404

    drive = PlacementDrive.query.get(application.drive_id)

    if not drive:

        return jsonify({
            "success": False,
            "message": "Placement drive not found."
        }), 404

    company = Company.query.filter_by(
        user_id=session["user_id"]
    ).first()

    if not company or drive.company_id != company.id:

        return jsonify({
            "success": False,
            "message": "You are not authorized to view this resume."
        }), 403

    if not application.resume_used:

        return jsonify({
            "success": False,
            "message": "Resume not found."
        }), 404

    resume_path = os.path.join(
        current_app.config["RESUME_UPLOAD_FOLDER"],
        application.resume_used
    )

    if not os.path.exists(resume_path):

        return jsonify({
            "success": False,
            "message": "Resume file not found."
        }), 404

    return send_from_directory(
        current_app.config["RESUME_UPLOAD_FOLDER"],
        application.resume_used,
        as_attachment=False
    )

