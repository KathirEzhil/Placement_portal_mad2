from flask import Blueprint, request, jsonify, session

from app.extensions import db
from app.models.student import Student
from app.models.user import User
from app.models.placement_drive import PlacementDrive
from app.models.application import Application
from app.models.recruitment_process import RecruitmentProcess

from app.utils.decorators import login_required, role_required

student_bp = Blueprint("student",__name__,url_prefix="/student")


@student_bp.route("/profile",methods=["GET"])
@login_required
@role_required("student")
def get_profile():

    user = User.query.get(session["user_id"])
    student = user.student

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found"
        }), 404
    return jsonify({
        "success": True,
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
    resume = data.get("resume")

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
            resume = resume
        )
        db.session.add(student)

    else:
        student.college_email = college_email
        student.personal_email = personal_email
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
        student.resume = resume

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
    
    if not student.resume:
        return jsonify({
            "success": False,
            "message": "Please upload your resume before applying"
        }), 400
    
    existing_application = Application.query.filter_by(student_id=student.id,drive_id=drive.id).first()

    if existing_application:
        return jsonify({
            "message": "You have already applied for this placement drive"
        }), 409

    try:
        cover_letter = request.json.get("cover_letter")

        application = Application(
            student_id=student.id,
            drive_id=drive.id,
            resume_used=student.resume,
            cover_letter=cover_letter
        )

        db.session.add(application)

        db.session.flush()

        recruitmentprocess = RecruitmentProcess(application_id=application.id)

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
            "message": "Application submitted successfully",
            "application": application.to_dict_student()
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

    application_list = [application.to_dict_student for application in applications]

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