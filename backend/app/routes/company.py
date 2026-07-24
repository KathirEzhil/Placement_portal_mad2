from flask import Blueprint, request, jsonify, session
from datetime import datetime,date

from app.extensions import db
from app.models.user import User
from app.models.company import Company
from app.models.placement_drive import PlacementDrive
from app.models.application import Application

from app.utils.decorators import login_required, role_required

company_bp = Blueprint("company",__name__,url_prefix="/company")


@company_bp.route("/profile",methods=["GET"])
@login_required
@role_required("company")
def get_profile():

    user = db.session.get(User, session["user_id"])
    company = user.company

    if company is None:
        return jsonify({
            "success": False,
            "message": "company profile not found"
        }), 404
    
    return jsonify({
        "success": True,
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
    company_domain = data.get("company_name")
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
    
    if not (industry_type or company_domain):
        return jsonify({
            "success": False,
            "message": "Both insutry type and company_domain are required"
        }), 400
    
    if not (hr_email or company_size):
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
        eligibility_cgpa=eligibility_cgpa,
        drive_date=drive_date,
        last_date_to_apply=last_date_to_apply,
        status="pending"
    )

    try:
        db.session.add(new_drive)
        db.session.commit()
    
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
    
    drive = db,session.get(PlacementDrive,drive_id)

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
        })


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
    drive.eligibility_cgpa = eligibility_cgpa
    drive.drive_date = drive_date
    drive.last_date_to_apply = last_date_to_apply

    try:
        db.session.commmit()

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to update placement drive",
            "error": str(e)
        })
    
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