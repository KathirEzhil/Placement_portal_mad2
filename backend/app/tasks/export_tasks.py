from celery_app import celery
from app.models.application import Application
from app.models.placement_drive import PlacementDrive
from app.models.student import Student
from app.models.company import Company
from app.models.user import User
from app.utils.csv_export import generate_csv
from app.utils.mail import send_email

import os

@celery.task
def test_database():

    count = User.query.count()
    print(f"Total students: {count}")
    return count


@celery.task
def export_student_applications(student_id, email):

    applications = Application.query.filter_by(student_id=student_id).all()

    headers = [
        "Application ID",
        "Company",
        "Drive",
        "Job Type",
        "Status",
        "Applied At"
    ]

    rows = []

    for application in applications:
        rows.append([
            application.id,
            application.drive.company.company_name,
            application.drive.title,
            application.drive.job_type,
            application.status,
            application.applied_at
        ])

    filepath = generate_csv(headers,rows,f"student_{student_id}")

    send_email(
        recipient=email,
        subject="Placement Applications Export",
        body="Your CSV export is attached.",
        attachments=[filepath]
    )
    return {
        "filepath": filepath,
        "filename": os.path.basename(filepath)
    }


@celery.task
def export_company_applicants(drive_id, email):

    applications = Application.query.filter_by(drive_id=drive_id).all()

    headers=[
        "Student",
        "Roll Number",
        "Branch",
        "CGPA",
        "Skills",
        "Status"
    ]

    rows=[]

    for application in applications:
        student=application.student

        rows.append([
            student.full_name,
            student.roll_number,
            student.branch,
            student.cgpa,
            student.skills,
            application.status
        ])

    filepath=generate_csv(headers,rows,f"drive_{drive_id}")

    send_email(
        recipient=email,
        subject="Applicants Export",
        body="CSV attached.",
        attachments=[filepath]
    )

    return {
        "filepath": filepath,
        "filename": os.path.basename(filepath)
    }


@celery.task
def export_admin_report(email):

    headers=[
        "Students",
        "Companies",
        "Drives",
        "Applications",
        "Selections"
        ]

    rows=[[
        Student.query.count(),
        Company.query.count(),
        PlacementDrive.query.count(),
        Application.query.count(),
        Application.query.filter_by(
        status="selected"
        ).count()
        ]]

    filepath=generate_csv(headers,rows,"admin_report")

    send_email(
        recipient=email,
        subject="Placement Report",
        body="Admin report attached.",
        attachments=[filepath]
        )

    return {
        "filepath": filepath,
        "filename": os.path.basename(filepath)
    }