from flask import Blueprint, jsonify, session
from flask import send_from_directory
import os

from app.models.student import Student
from app.models.company import Company
from app.utils.decorators import login_required, role_required


from celery.result import AsyncResult

export_bp = Blueprint("export",__name__,url_prefix="/api/export")


@export_bp.route("/student", methods=["POST"])
@login_required
@role_required("student")
def export_student():

    from app.tasks.export_tasks import export_student_applications

    student = Student.query.filter_by(user_id=session["user_id"]).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found."
        }),404

    task = export_student_applications.delay(student.id,student.user.email)

    return jsonify({
        "success": True,
        "message": "Export started.",
        "task_id": task.id
    }),202


@export_bp.route("/company/<int:drive_id>", methods=["POST"])
@login_required
@role_required("company")
def export_company(drive_id):

    from app.tasks.export_tasks import export_company_applicants

    company = Company.query.filter_by(user_id=session["user_id"]).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found."
        }),404

    task = export_company_applicants.delay(drive_id,company.user.email)

    return jsonify({
        "success": True,
        "task_id": task.id
    }),202


@export_bp.route("/admin", methods=["POST"])
@login_required
@role_required("admin")
def export_admin():

    from app.tasks.export_tasks import export_admin_report


    email = session["email"]
    task = export_admin_report.delay(email)

    return jsonify({
        "success": True,
        "task_id": task.id
    }),202


@export_bp.route("/status/<task_id>", methods=["GET"])
@login_required
def export_status(task_id):

    task = AsyncResult(task_id)

    response = {"state": task.state}

    if task.state == "SUCCESS":

        response["filename"] = task.result["filename"]

    elif task.state == "FAILURE":

        response["error"] = str(task.result)

    return jsonify(response),200


@export_bp.route("/download/<filename>", methods=["GET"])
@login_required
def download_export(filename):

    folder = "exports"
    filepath = os.path.join(folder, filename)

    if not os.path.exists(filepath):
        return jsonify({
            "success": False,
            "message": "File not found."
        }),404

    return send_from_directory(
        folder,
        filename,
        as_attachment=True
    )