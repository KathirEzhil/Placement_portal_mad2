import os
from flask import current_app, send_file

from flask import Blueprint, jsonify, request
from app.models import Company
from app.models import PlacementDrive
from app.models import Student
from app.models import Application
from app.models import RecruitmentProcess
from app.models import User

from app.extensions import db
from app.utils.decorators import login_required, role_required

from app.utils.cache import delete_cache, clear_admin_cache


admin_bp = Blueprint("admin",__name__,url_prefix="/admin")


# ======= company view approve reject =========
@admin_bp.route("/pending-companies",methods=["GET"])
@login_required
@role_required("admin")
def get_pending_companies():

    pending = Company.query.filter_by(approval_status = "pending").all()

    if not pending:
        return jsonify({
            "success": True,
            "message": "No pending companies found.",
            "companies": []
        }), 200
    
    companies = []

    for company in pending:
        companies.append({
            "id": company.id,
            "company_name": company.company_name,
            "website": company.website,
            "location": company.location,
            "company_size": company.company_size,
            "created_at": company.created_at
        })

    return jsonify({
        "success": True,
        "companies": companies
    }), 200


@admin_bp.route("/company/<int:company_id>", methods=["GET"])
@login_required
@role_required("admin")
def get_company(company_id):

    company = db.session.get(Company,company_id)

    if company is None:
        return jsonify({
            "success": False,
            "message": "Company not found."
        }), 404
    
    company_data = {
        "id": company.id,
        "company_name": company.company_name,
        "industry_type": company.industry_type,
        "company_domain": company.company_domain,
        "website": company.website,
        "location": company.location,
        "description": company.description,
        "company_size": company.company_size,
        "logo": company.logo,
        "hr_email": company.hr_email,
        "hr_contact": company.hr_contact,
        "govt_verification_id": company.govt_verification_id,
        "approval_status": company.approval_status,
        "created_at": company.created_at
    }
    
    return jsonify({
        "success": True,
        "company": company_data
    }), 200


@admin_bp.route("/company/<int:company_id>/approve",methods=["PUT"])
@login_required
@role_required("admin")
def approve_company(company_id):

    company = db.session.get(Company,company_id)

    if not company:
        return jsonify({
            "success": False,
            "message": "Company not found"
        }), 404
    
    if company.approval_status == "approved":
        return jsonify({
            "success": False,
            "message": "Company already approved"
        }), 400
    
    company.approval_status = "approved"
    company.rejection_reason = None

    try:
        db.session.commit()
        clear_admin_cache()

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to approve company",
            "error": str(e)
        }), 500
    
    return jsonify({
        "success": True,
        "message": "Company approved successfully"
    }), 200


@admin_bp.route("/company/<int:company_id>/reject",methods=["PUT"])
@login_required
@role_required("admin")
def reject_company(company_id):

    # for adding rejection reason
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No input data provided."
        }), 400

    reason = data.get("reason", "").strip()

    if not reason:
        return jsonify({
            "success": False,
            "message": "Rejection reason is required."
        }), 400

    company = db.session.get(Company,company_id)

    if not company:
        return jsonify({
            "success": False,
            "message": "Company not found"
        }), 404
    
    if company.approval_status == "rejected":
        return jsonify({
            "success": False,
            "message": "Company already rejected"
        }), 400
    
    company.approval_status = "rejected"
    company.rejection_reason = reason

    try:
        db.session.commit()
        clear_admin_cache()

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to reject company",
            "error": str(e)
        }), 500
    
    return jsonify({
        "success": True,
        "message": "Company rejected successfully"
    }), 200


# ======= drives view approve reject =========
@admin_bp.route("/pending-drives",methods=["GET"])
@login_required
@role_required("admin")
def get_pending_drives():

    pending = PlacementDrive.query.filter_by(status = "pending").all()

    if not pending:
        return jsonify({
            "success": True,
            "message": "No pending drives found.",
            "companies": []
        }), 200
    
    pending_drives_data = [drive.to_dict() for drive in pending]

    return jsonify({
        "success": True,
        "drives": pending_drives_data
    }), 200


@admin_bp.route("/drive/<int:drive_id>",methods=["GET"])
@login_required
@role_required("admin")
def get_drive_details(drive_id):

    drive = db.session.get(PlacementDrive, drive_id)

    if not drive:
        return jsonify({
            "success": False,
            "message": "Placement drice not found"
        }), 404
    
    return jsonify({
        "success": True,
        "drive": drive.to_dict()
    }), 200


@admin_bp.route("/drive/<int:drive_id>/approve",methods=["PUT"])
@login_required
@role_required("admin")
def approve_drive(drive_id):

    drive = db.session.get(PlacementDrive, drive_id)

    if not  drive:
        return jsonify({
            "success": False,
            "message": "Placement drive not found"
        }), 404
    
    if drive.status == "approved":
        return jsonify({
            "success": False,
            "message": "Placement drive already approved"
        }), 400
    
    if drive.status == "rejected":
        return jsonify({
            "success": False,
            "message": "Rejected placement drives cannot be approved."
        }), 400
    
    if drive.status == "closed":
        return jsonify({
            "success": False,
            "message": "Closed placement drives cannot be approved."
        }), 400
    
    try:
        drive.status = "approved"
        drive.rejection_reason = None

        db.session.commit()

        delete_cache(
            f"company_dashboard:{drive.company_id}"
        )
        delete_cache("student_approved_drives")

        clear_admin_cache()

        return jsonify({
            "success": True,
            "message": "Placement drive approved successfully"
        }), 200
    
    except Exception as e:
        db.session.rollback()

        return jsonify({
            "successs": "False",
            "message": "Failed to approve placement drive",
            "error": str(e)
        }), 500
    

@admin_bp.route("/drive/<int:drive_id>/reject",methods=["PUT"])
@login_required
@role_required("admin")
def reject_drive(drive_id):

    drive = db.session.get(PlacementDrive, drive_id)

    if not  drive:
        return jsonify({
            "success": False,
            "message": "Placement drive not found"
        }), 404
    
    if drive.status == "rejected":
        return jsonify({
            "success": False,
            "message": "Placement drive already rejected"
        }), 400
    
    # if drive.status == "approved":
    #     return jsonify({
    #         "success": False,
    #         "message": "approved placement drives cannot be rejected"
    #     }), 400
    
    if drive.status == "closed":
        return jsonify({
            "success": False,
            "message": "Closed placement drives cannot be rejected"
        }), 400
    
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No input data provided"
        }), 400
    
    reason = data.get("reason","").strip()

    if not reason:
        return jsonify({
            "success": False,
            "message": "Rejection reason is required"
        }), 400
    
    try:
        drive.status = "rejected"
        drive.rejection_reason = reason

        db.session.commit()

        delete_cache(
            f"company_dashboard:{drive.company_id}"
        )
       
        clear_admin_cache()

        return jsonify({
            "success": True,
            "message": "Placement drive rejected successfully"
        }), 200
    
    except Exception as e:
        db.session.rollback()

        return jsonify({
            "successs": "False",
            "message": "Failed to reject placement drive",
            "error": str(e)
        }), 500


# ======= student management =========


@admin_bp.route("/students", methods=["GET"])
@login_required
@role_required("admin")
def get_students():

    students = Student.query.order_by(
        Student.created_at.desc()
    ).all()

    student_data = []

    for student in students:

        applications = Application.query.filter_by(
            student_id=student.id
        ).all()

        application_count = len(applications)

        selected_count = sum(
            1
            for application in applications
            if application.status == "selected"
        )

        student_data.append({

            "id": student.id,

            "full_name": student.full_name,

            "is_active": student.user.is_active,

            "college_email": student.college_email,

            "personal_email": student.personal_email,

            "roll_number": student.roll_number,

            "graduation_year": student.graduation_year,

            "skills": student.skills,

            "college_name": student.college_name,

            "stream": student.stream,

            "branch": student.branch,

            "cgpa": student.cgpa,

            "phone": student.phone,

            "year": student.year,

            "resume": student.resume,

            "application_count": application_count,

            "selected_count": selected_count,

            "placement_status": (
                "Placed"
                if selected_count > 0
                else (
                    "Applied"
                    if application_count > 0
                    else "Not Placed"
                )
            ),

            "created_at": (
                student.created_at.isoformat()
                if student.created_at
                else None
            )

        })

    return jsonify({

        "success": True,

        "count": len(student_data),

        "students": student_data

    }), 200


@admin_bp.route(
    "/student/<int:student_id>",
    methods=["GET"]
)
@login_required
@role_required("admin")
def get_student_details(student_id):

    student = db.session.get(
        Student,
        student_id
    )

    if not student:

        return jsonify({

            "success": False,

            "message": "Student not found."

        }), 404

    applications = Application.query.filter_by(
        student_id=student.id
    ).all()

    selected_count = sum(
        1
        for application in applications
        if application.status == "selected"
    )

    student_data = {

        "id": student.id,

        "full_name": student.full_name,

        "college_email": student.college_email,

        "personal_email": student.personal_email,

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

        "resume": student.resume,

        "application_count": len(applications),

        "selected_count": selected_count,

        "placement_status": (
            "Placed"
            if selected_count > 0
            else (
                "Applied"
                if applications
                else "Not Placed"
            )
        ),

        "created_at": (
            student.created_at.isoformat()
            if student.created_at
            else None
        )

    }

    return jsonify({

        "success": True,

        "student": student_data

    }), 200


@admin_bp.route(
    "/student/<int:student_id>/applications",
    methods=["GET"]
)
@login_required
@role_required("admin")
def get_student_applications(student_id):

    student = db.session.get(
        Student,
        student_id
    )

    if not student:

        return jsonify({

            "success": False,

            "message": "Student not found."

        }), 404

    applications = Application.query.filter_by(
        student_id=student.id
    ).order_by(
        Application.applied_at.desc()
    ).all()

    application_data = []

    for application in applications:

        application_data.append({

            "id": application.id,

            "student_id": application.student_id,

            "drive_id": application.drive_id,

            "drive_title": (
                application.drive.title
                if application.drive
                else None
            ),

            "company_name": (
                application.drive.company.company_name
                if application.drive
                and application.drive.company
                else None
            ),

            "location": (
                application.drive.location
                if application.drive
                else None
            ),

            "job_type": (
                application.drive.job_type
                if application.drive
                else None
            ),

            "compensation": (
                application.drive.compensation
                if application.drive
                else None
            ),

            "resume_used": application.resume_used,

            "cover_letter": application.cover_letter,

            "status": application.status,

            "company_notes": application.company_notes,

            "rejection_reason": (
                application.rejection_reason
            ),

            "recruitment_status": (
                application.recruitment_process
                .recruitment_status
                if application.recruitment_process
                else "not_started"
            ),

            "current_round": (
                application.recruitment_process
                .current_round
                if application.recruitment_process
                else 0
            ),

            "applied_at": (
                application.applied_at.isoformat()
                if application.applied_at
                else None
            ),

            "updated_at": (
                application.updated_at.isoformat()
                if application.updated_at
                else None
            )

        })

    return jsonify({

        "success": True,

        "count": len(application_data),

        "applications": application_data

    }), 200


@admin_bp.route(
    "/student/<int:student_id>/resume",
    methods=["GET"]
)
@login_required
@role_required("admin")
def view_student_resume(student_id):

    student = db.session.get(Student, student_id)

    if not student:

        return jsonify({
            "success": False,
            "message": "Student not found."
        }), 404

    if not student.resume:

        return jsonify({
            "success": False,
            "message": "Student has not uploaded a resume."
        }), 404

    resume_path = os.path.join(
        current_app.config["RESUME_UPLOAD_FOLDER"],
        student.resume
    )

    if not os.path.exists(resume_path):

        return jsonify({
            "success": False,
            "message": "Resume file not found."
        }), 404

    return send_file(
        resume_path,
        as_attachment=False,
        download_name=student.resume
    )



@admin_bp.route("/jobs/daily-reminder",methods=["POST"])
@login_required
@role_required("admin")
def run_daily_reminder():

    from app.tasks.reminder_tasks import send_daily_reminders

    task = send_daily_reminders.delay()

    return jsonify({
        "success":True,
        "task_id":task.id,
        "message":"Daily Reminder Started."
    }),202


@admin_bp.route("/jobs/monthly-report",methods=["POST"])
@login_required
@role_required("admin")
def run_monthly_report():

    from app.tasks.report_tasks import generate_monthly_report

    task = generate_monthly_report.delay()

    return jsonify({
        "success":True,
        "task_id":task.id,
        "message":"Monthly Report Started."
    }),202


# ================= RECRUITMENT MANAGEMENT =================

@admin_bp.route("/recruitment", methods=["GET"])
@login_required
@role_required("admin")
def get_recruitment_processes():

    recruitment_processes = (
        RecruitmentProcess.query
        .join(Application)
        .order_by(
            RecruitmentProcess.updated_at.desc()
        )
        .all()
    )

    recruitment_data = []

    for recruitment in recruitment_processes:

        application = recruitment.application

        student = application.student

        drive = application.drive

        company = drive.company

        rounds = []

        for number in range(1, 5):

            required = getattr(
                drive,
                f"round{number}_required",
                False
            )

            if not required:
                continue

            completed_at = getattr(
                recruitment,
                f"round{number}_completed_at",
                None
            )

            scheduled_at = getattr(
                recruitment,
                f"round{number}_scheduled_at",
                None
            )

            rounds.append({

                "round_number": number,

                "name": getattr(
                    drive,
                    f"round{number}_name",
                    f"Round {number}"
                ),

                "status": getattr(
                    recruitment,
                    f"round{number}_status"
                ),

                "completed": getattr(
                    recruitment,
                    f"round{number}_completed"
                ),

                "completed_at": (
                    completed_at.isoformat()
                    if completed_at
                    else None
                ),

                "scheduled_at": (
                    scheduled_at.isoformat()
                    if scheduled_at
                    else None
                ),

                "meeting_details": getattr(
                    recruitment,
                    f"round{number}_meeting_details"
                ),

                "test_link": getattr(
                    recruitment,
                    f"round{number}_test_link"
                ),

                "email_sent": getattr(
                    recruitment,
                    f"round{number}_email_sent"
                )

            })

        recruitment_data.append({

            "recruitment_id": recruitment.id,

            "application_id": application.id,

            "student": {

                "id": student.id,

                "name": student.full_name,

                "roll_number": student.roll_number,

                "branch": student.branch,

                "cgpa": student.cgpa,

                "college_email": student.college_email

            },

            "company": {

                "id": company.id,

                "name": company.company_name

            },

            "drive": {

                "id": drive.id,

                "title": drive.title,

                "job_type": drive.job_type,

                "location": drive.location,

                "compensation": drive.compensation

            },

            "application": {

                "status": application.status,

                "applied_at": (
                    application.applied_at.isoformat()
                    if application.applied_at
                    else None
                ),

                "updated_at": (
                    application.updated_at.isoformat()
                    if application.updated_at
                    else None
                ),

                "rejection_reason":
                    application.rejection_reason

            },

            "recruitment": {

                "status":
                    recruitment.recruitment_status,

                "current_round":
                    recruitment.current_round,

                "rounds":
                    rounds,

                "offer_letter_generated":
                    recruitment.offer_letter_generated,

                "offer_letter_sent":
                    recruitment.offer_letter_sent,

                "offer_letter_sent_at": (
                    recruitment.offer_letter_sent_at.isoformat()
                    if recruitment.offer_letter_sent_at
                    else None
                ),

                "created_at": (
                    recruitment.created_at.isoformat()
                    if recruitment.created_at
                    else None
                ),

                "updated_at": (
                    recruitment.updated_at.isoformat()
                    if recruitment.updated_at
                    else None
                )

            }

        })

    return jsonify({

        "success": True,

        "count": len(recruitment_data),

        "recruitment": recruitment_data

    }), 200


# ================= USER MANAGEMENT =================


@admin_bp.route("/companies", methods=["GET"])
@login_required
@role_required("admin")
def get_all_companies():

    companies = Company.query.order_by(
        Company.created_at.desc()
    ).all()

    company_data = []

    for company in companies:

        company_data.append({

            "id": company.id,

            "company_name": company.company_name,

            "industry_type": company.industry_type,

            "company_domain": company.company_domain,

            "company_size": company.company_size,

            "website": company.website,

            "hr_email": company.hr_email,

            "hr_contact": company.hr_contact,

            "location": company.location,

            "approval_status": company.approval_status,

            "is_active": company.user.is_active,

            "created_at": (
                company.created_at.isoformat()
                if company.created_at
                else None
            )

        })

    return jsonify({

        "success": True,

        "count": len(company_data),

        "companies": company_data

    }), 200


@admin_bp.route(
    "/student/<int:student_id>/status",
    methods=["PUT"]
)
@login_required
@role_required("admin")
def update_student_status(student_id):

    student = db.session.get(
        Student,
        student_id
    )

    if not student:

        return jsonify({

            "success": False,

            "message": "Student not found."

        }), 404

    data = request.get_json()

    if not data or "is_active" not in data:

        return jsonify({

            "success": False,

            "message": "is_active is required."

        }), 400

    is_active = data.get("is_active")

    if not isinstance(is_active, bool):

        return jsonify({

            "success": False,

            "message": "is_active must be true or false."

        }), 400

    student.user.is_active = is_active

    try:

        db.session.commit()
        clear_admin_cache()

    except Exception as e:

        db.session.rollback()

        return jsonify({

            "success": False,

            "message": "Failed to update student status.",

            "error": str(e)

        }), 500

    return jsonify({

        "success": True,

        "message": (
            "Student activated successfully."
            if is_active
            else "Student deactivated successfully."
        ),

        "is_active": is_active

    }), 200


@admin_bp.route(
    "/company/<int:company_id>/status",
    methods=["PUT"]
)
@login_required
@role_required("admin")
def update_company_status(company_id):

    company = db.session.get(
        Company,
        company_id
    )

    if not company:

        return jsonify({

            "success": False,

            "message": "Company not found."

        }), 404

    data = request.get_json()

    if not data or "is_active" not in data:

        return jsonify({

            "success": False,

            "message": "is_active is required."

        }), 400

    is_active = data.get("is_active")

    if not isinstance(is_active, bool):

        return jsonify({

            "success": False,

            "message": "is_active must be true or false."

        }), 400

    company.user.is_active = is_active

    try:

        db.session.commit()
        clear_admin_cache()

    except Exception as e:

        db.session.rollback()

        return jsonify({

            "success": False,

            "message": "Failed to update company status.",

            "error": str(e)

        }), 500

    return jsonify({

        "success": True,

        "message": (
            "Company activated successfully."
            if is_active
            else "Company deactivated successfully."
        ),

        "is_active": is_active

    }), 200