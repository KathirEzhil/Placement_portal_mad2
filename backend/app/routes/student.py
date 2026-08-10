from flask import Blueprint, request, jsonify, session, send_file
from flask import current_app
from flask import send_from_directory
from datetime import datetime, date

import os
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.student import Student
from app.models.user import User
from app.models.placement_drive import PlacementDrive
from app.models.application import Application
from app.models.recruitment_process import RecruitmentProcess

from app.utils.decorators import login_required, role_required
from app.utils.activity_logger import log_activity
from app.utils.cache import get_cache, delete_cache, set_cache


ALLOWED_EXTENSIONS = {"pdf","docx","doc"}

def allowed_file(filename):
    return (
        "." in filename and
        filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


student_bp = Blueprint("student",__name__,url_prefix="/student")


@student_bp.before_request
def check_student_account_status():

    user_id = session.get("user_id")

    if not user_id:
        return None

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User account not found"
        }), 404

    if not user.is_active:

        # Allow dashboard request so frontend
        # can display the deactivated screen
        if request.path == "analytics/student/dashboard":
            return None

        return jsonify({
            "success": False,
            "message": (
                "Your student account has been "
                "deactivated by the administrator."
            ),
            "account_active": False
        }), 403

    return None


@student_bp.route("/profile",methods=["GET"])
@login_required
@role_required("student")
def get_profile():

    user = User.query.get(session["user_id"])
    student = user.student

    if not student:
        return jsonify({
            "success": True,
            "profile_exists": False,
            "data":{
                "email": user.email,
                "college_email":"",
                "personal_email":"",
                "full_name":"",
                "roll_number":"",
                "graduation_year":"",
                "skills":"",
                "linkedin_url":"",
                "github_url":"",
                "portfolio_url":"",
                "permanent_address":"",
                "college_name":"",
                "stream":"",
                "branch":"",
                "cgpa":"",
                "phone":"",
                "year":"",
                "resume":""
            }
        }), 404
    
    return jsonify({
        "success": True,
        "profile_exists": True,
        "data":{
            "email": user.email,
            "college_email": student.college_email,
            "personal_email": student.personal_email,
            "full_name": student.full_name,
            "roll_number": student.roll_number,
            "graduation_year": student.graduation_year,
            "skills": student.skills,
            "linkedin_url": student.linkedin_url,
            "github_url": student.github_url,
            "portfolio_url": student.portfolio_url,
            "permanent_address": student.permanent_address,
            "college_name": student.college_name,
            "stream": student.stream,
            "branch": student.branch,
            "cgpa": student.cgpa,
            "phone": student.phone,
            "year": student.year,
            "resume": student.resume
        }
    })


@student_bp.route("/profile", methods=["PUT"])
@login_required
@role_required("student")
def update_profile():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body must be in JSON format"
        }), 400
    
    college_email = data.get("college_email")
    personal_email = data.get("personal_email")
    full_name = data.get("full_name")
    roll_number = data.get("roll_number")
    graduation_year = data.get("graduation_year")
    skills = data.get("skills")
    linkedin_url = data.get("linkedin_url")
    github_url = data.get("github_url")
    portfolio_url = data.get("portfolio_url")
    permanent_address = data.get("permanent_address")
    college_name = data.get("college_name")
    stream = data.get("stream")
    branch = data.get("branch")
    cgpa = data.get("cgpa")
    phone = data.get("phone")
    year = data.get("year")
    # resume = data.get("resume")

    if not all([college_email,roll_number,full_name,college_name,stream,branch,cgpa,phone,year]):
        return jsonify({
            "success": False,
            "message": "Some required fields are missing, all fields except personal mail and resume are required"
        }), 400
    
    if not graduation_year:
        return jsonify({
            "success": False,
            "message": "graduation year is a required field"
        }), 400

    if not permanent_address:
        return jsonify({
            "success": False,
            "message": "Permanent address is a required field"
        }), 400

    college_name = college_name.strip()
    
    if cgpa < 0 or cgpa > 10:
        return jsonify({
            "success": False,
            "message": "CGPA must be between 0 and 10."
        }), 400

    # logic for - create if  no profile exists, else update
    user = User.query.get(session["user_id"])
    student = user.student

    existing_student = Student.query.filter_by(roll_number = roll_number).first()
    
    if existing_student and existing_student.user_id != user.id:
        return jsonify({
            "success": False,
            "message": "Roll number already exists."
        }), 409

    existing_student_with_same_mobile_no = Student.query.filter_by(phone = phone).first()

    if existing_student_with_same_mobile_no and existing_student_with_same_mobile_no.user_id != user.id:
        return jsonify({
            "success": False,
            "message": "Mobile phone number already exists for a different person"
        }), 409

    if student is None:
        student = Student(
            user_id = user.id,
            roll_number = roll_number,
            college_email = college_email,
            personal_email = personal_email,
            full_name=full_name,
            graduation_year = graduation_year,
            skills = skills,
            linkedin_url = linkedin_url,
            github_url = github_url,
            portfolio_url = portfolio_url,
            permanent_address = permanent_address,
            college_name = college_name,
            stream = stream,
            branch = branch,
            cgpa = cgpa,
            phone = phone,
            year = year,
            # resume = resume
        )
        db.session.add(student)

    else:
        student.college_email = college_email
        student.personal_email = personal_email
        student.roll_number = roll_number
        student.college_name = college_name
        student.full_name = full_name
        student.graduation_year = graduation_year
        student.skills = skills
        student.linkedin_url = linkedin_url
        student.github_url = github_url
        student.portfolio_url = portfolio_url
        student.permanent_address = permanent_address
        student.stream = stream
        student.branch = branch
        student.cgpa = cgpa
        student.phone = phone
        student.year = year
        # student.resume = resume

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Profile updated successfully."
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to update profile.",
            "error": str(e)
        }), 500


@student_bp.route("/upload-resume", methods=["POST"])
@login_required
@role_required("student")
def upload_resume():

    student = Student.query.filter_by(user_id=session["user_id"]).first()
    user = User.query.get(session["user_id"])

    if not user:
        return jsonify({
            "success": False,
            "message": "Student profile not found"
        }),404


    if "resume" not in request.files:
        return jsonify({
            "success": False,
            "message": "No file received."
        }),400


    file = request.files["resume"]


    if file.filename == "":

        return jsonify({
            "success": False,
            "message": "No file selected."
        }),400


    if not allowed_file(file.filename):

        return jsonify({
            "success": False,
            "message": "Only PDF and docx files are allowed."
        }),400

    # Delete old resume if it exists
    
    if student and student.resume:
        old_file = os.path.join(current_app.config["RESUME_UPLOAD_FOLDER"],student.resume)
        if os.path.exists(old_file):
            os.remove(old_file)

    filename = secure_filename(file.filename)

    extension = filename.rsplit(".",1)[1]

    new_filename = f"student_{student.id}_resume.{extension}"

    file_path = os.path.join(current_app.config["RESUME_UPLOAD_FOLDER"],new_filename)

    file.save(file_path)

    student.resume = new_filename
    db.session.commit()
    print("Resume in DB:", student.resume)

    return jsonify({
        "success": True,
        "message": "Resume uploaded successfully.",
        "filename": new_filename
    }),200


@student_bp.route("/view-resume", methods=["GET"])
@login_required
@role_required("student")
def view_resume():

    student = Student.query.filter_by(user_id=session["user_id"]).first()

    if not student or not student.resume:

        return jsonify({
            "success": False,
            "message": "Resume not found."
        }),404

    file_path = os.path.join(
        current_app.config["RESUME_UPLOAD_FOLDER"],
        student.resume
    )

    print(file_path)
    print(os.path.exists(file_path))

    if not os.path.exists(file_path):
        return jsonify({
            "success": False,
            "message": "Resume file missing.",
            "path": file_path
        }),404

    return send_file(
        file_path,
        mimetype="application/pdf",
        as_attachment=False
    )


@student_bp.route("/drives", methods=["GET"])
@login_required
@role_required("student")
def get_all_drives():

    student = Student.query.filter_by(
        user_id=session["user_id"]
    ).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found."
        }), 404

    cache_key = "student_approved_drives"

    cached_drives = get_cache(cache_key)

    if cached_drives is not None:

        return jsonify({
            "success": True,
            "count": len(cached_drives),
            "drives": cached_drives,
            "cached": True
        }), 200

    drives = PlacementDrive.query.filter_by(
        status="approved"
    ).order_by(
        PlacementDrive.last_date_to_apply.asc()
    ).all()

    drive_data = [
        drive.to_dict()
        for drive in drives
    ]

    set_cache(
        cache_key,
        drive_data,
        timeout=300
    )

    return jsonify({
        "success": True,
        "count": len(drive_data),
        "drives": drive_data,
        "cached": False
    }), 200



@student_bp.route("/drives/<int:drive_id>", methods=["GET"])
@login_required
@role_required("student")
def get_drive(drive_id):

    student = Student.query.filter_by(user_id=session["user_id"]).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found."
        }), 404

    drive = PlacementDrive.query.get(drive_id)

    if not drive:
        return jsonify({
            "success": False,
            "message": "Placement drive not found."
        }), 404

    if drive.status != "approved":
        return jsonify({
            "success": False,
            "message": "This placement drive is not available."
        }), 400

    return jsonify({
        "success": True,
        "drive": drive.to_dict()
    }), 200
        

@student_bp.route("/drives/<int:drive_id>/apply",methods=["POST"])
@login_required
@role_required("student")
def apply_to_drive(drive_id):

    student = Student.query.filter_by(user_id=session["user_id"]).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found"
        }), 404
    
    drive = PlacementDrive.query.get(drive_id)

    if not drive:
        return jsonify({
            "success": False,
            "message": "Placement drive not found"
        }), 404
    
    if drive.status != "approved":
        return jsonify({
            "success": False,
            "message": "This placement drive is not open for applications"
        }), 400

    # Check application deadline

    if drive.last_date_to_apply:

        if date.today() > drive.last_date_to_apply:

            return jsonify({
                "success": False,
                "message": "The application deadline has passed."
            }), 400


    # Check CGPA eligibility

    if (
        drive.eligibility_cgpa is not None
        and (
            student.cgpa is None
            or student.cgpa < drive.eligibility_cgpa
        )
    ):

        return jsonify({
            "success": False,
            "message": (
                f"You are not eligible for this placement drive. "
                f"Minimum CGPA required is "
                f"{drive.eligibility_cgpa}."
            )
        }), 400
    
    if not student.resume:
        return jsonify({
            "success": False,
            "message": "Please upload your resume before applying"
        }), 400
    
    existing_application = Application.query.filter_by(student_id=student.id,drive_id=drive.id).first()

    if existing_application:

        if existing_application.status != "withdrawn":
            return jsonify({
                "success": False,
                "message": "You have already applied for this placement drive"
            }), 409

        recruitment_process = existing_application.recruitment_process

        if not recruitment_process:

            return jsonify({
                "success": False,
                "message": "Recruitment process not found."
            }), 404


        if recruitment_process.recruitment_status != "not_started":

            return jsonify({
                "success": False,
                "message": "You cannot reapply because the recruitment process has already started."
            }), 400

    try:
        cover_letter = request.json.get("cover_letter")

        if existing_application:

            application = existing_application

            application.status = "applied"

            application.cover_letter = cover_letter

            application.resume_used = student.resume

            application.last_status_updated_by = "student"

        else:
            application = Application(
                student_id=student.id,
                drive_id=drive.id,
                resume_used=student.resume,
                cover_letter=cover_letter
            )

            db.session.add(application)

            db.session.flush()

            log_activity(
                user_id=session["user_id"],
                role="student",
                action="Applied",
                entity_type="Application",
                entity_id=application.id,
                description=f"{student.full_name} applied to {drive.title}"
            )

            recruitmentprocess = RecruitmentProcess(
                application_id=application.id
            )

            db.session.add(recruitmentprocess)

        db.session.commit()

        
    
    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to submit application",
            "error": str(e)
        }), 500
    
    return jsonify({
            "success": True,
            "message": ("Application reapplied successfully" if existing_application
                        else "Application submitted successfully"),
            "application": application.to_dict_student(),
            "application_id": application.id
        }), 201
    

@student_bp.route("/applications", methods=["GET"])
@login_required
@role_required("student")
def get_student_applications():

    student = Student.query.filter_by(user_id=session["user_id"]).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found"
        }), 404
    
    applications = Application.query.filter_by(student_id=student.id).order_by(Application.applied_at.desc()).all()

    application_list = [application.to_dict_student() for application in applications]

    return jsonify({
        "success": True,
        "application_list": application_list
    }), 200


@student_bp.route("/applications/<int:application_id>", methods=["GET"])
@login_required
@role_required("student")
def get_student_application(application_id):

    student = Student.query.filter_by(user_id=session["user_id"]).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found."
        }), 404
    
    application = Application.query.filter_by(id=application_id,student_id=student.id).first()

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found"
        }), 404
    
    return jsonify({
        "success": True,
        "application": application.to_dict_student()
    }), 200


@student_bp.route("/applications/<int:application_id>/withdraw", methods=["PUT"])
@login_required
@role_required("student")
def withdraw_application(application_id):

    student = Student.query.filter_by(
        user_id=session["user_id"]
    ).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found."
        }), 404
    
    application = Application.query.filter_by(
        id=application_id,
        student_id=student.id
    ).first()

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found."
        }), 404
    
    recruitment_process = application.recruitment_process

    if not recruitment_process:
        return jsonify({
            "success": False,
            "message": "Recruitment process not found."
        }), 404
    
    if recruitment_process.recruitment_status != "not_started":
        return jsonify({
            "success": False,
            "message": "You cannot withdraw after the recruitment process has started."
        }), 400
    
    if application.status in ("selected", "rejected"):
        return jsonify({
            "success": False,
            "message": "This application can no longer be withdrawn."
        }), 400
    
    if application.status == "withdrawn":
        return jsonify({
            "success": False,
            "message": "Application has already been withdrawn."
        }), 400
    
    try:
        application.status = "withdrawn"
        application.last_status_updated_by = "student"

        db.session.commit()
    
    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to withdraw application"
        }), 500
    
    return jsonify({
            "success": True,
            "message": "Application withdrawn successfully",
            "application": application.to_dict_student()
        }), 200


@student_bp.route("/applications/<int:application_id>/recruitment",methods=["GET"])
@login_required
@role_required("student")
def get_recruitment_details(application_id):

    student = Student.query.filter_by(user_id=session["user_id"]).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found."
        }), 404

    application = Application.query.filter_by(id=application_id,student_id=student.id).first()

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
        "application": application.to_dict_student(),
        "placement_drive": {
            "id": drive.id,
            "title": drive.title,
            "company_name": drive.company.company_name,
            "job_type": drive.job_type,
            "location": drive.location,
            "compensation": drive.compensation
        },
        "recruitment": recruitment.to_dict()
    }), 200


@student_bp.route("/applications/<int:application_id>/offer-letter", methods=["GET"])
@login_required
@role_required("student")
def download_offer_letter(application_id):

    student = Student.query.filter_by(user_id=session["user_id"]).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found"
        }), 404

    application = Application.query.filter_by(
        id=application_id,
        student_id=student.id
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

    if not recruitment.offer_letter_path:
        return jsonify({
            "success": False,
            "message": "Offer letter path not found."
        }), 404

    print("========== OFFER LETTER DEBUG ==========")
    print("STORED PATH:", recruitment.offer_letter_path)
    print("CONFIG FOLDER:", current_app.config["OFFER_LETTER_FOLDER"])
    print(
        "NEW PATH:",
        os.path.join(
            current_app.config["OFFER_LETTER_FOLDER"],
            os.path.basename(recruitment.offer_letter_path)
        )
    )
    print(
        "OLD PATH EXISTS:",
        os.path.exists(recruitment.offer_letter_path)
    )
    print(
        "NEW PATH EXISTS:",
        os.path.exists(
            os.path.join(
                current_app.config["OFFER_LETTER_FOLDER"],
                os.path.basename(recruitment.offer_letter_path)
            )
        )
    )
    print("========================================")

    filename = os.path.basename(
        recruitment.offer_letter_path
    )

    offer_letter_path = os.path.join(
        current_app.config["OFFER_LETTER_FOLDER"],
        filename
    )

    if not os.path.isfile(offer_letter_path):

        return jsonify({
            "success": False,
            "message": "Offer letter file not found."
        }), 404


    return send_file(
        offer_letter_path,
        as_attachment=True,
        download_name=filename,
        mimetype="application/pdf"
    )