from flask import Blueprint, request, jsonify, session

from app.extensions import db
from app.models.student import Student
from app.models.user import User

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
            "roll_number": student.roll_number,
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
    roll_number = data.get("roll_number")
    college_name = data.get("college_name")
    stream = data.get("stream")
    branch = data.get("branch")
    cgpa = data.get("cgpa")
    phone = data.get("phone")
    year = data.get("year")
    resume = data.get("resume")

    if not all([college_email,roll_number,college_name,stream,branch,cgpa,phone,year]):
        return jsonify({
            "success": False,
            "message": "Some required fields are missing, all fields except personal mail and resume are required"
        }), 400
    
    college_name = college_name.split()
    
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
        college_email = college_email
        personal_email = personal_email
        college_name = college_name
        stream = stream
        branch = branch
        cgpa = cgpa
        phone = phone
        year = year
        resume = resume

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
        