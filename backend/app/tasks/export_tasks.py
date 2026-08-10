from celery_app import celery
from app.models.application import Application
from app.models.placement_drive import PlacementDrive
from app.models.student import Student
from app.models.company import Company
from app.models.user import User
from app.utils.csv_export import generate_csv
from app.utils.mail import send_email

from app.utils.excel_export import generate_excel, generate_multi_sheet_excel

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
def export_student_applications_excel(student_id, email):

    applications = Application.query.filter_by(
        student_id=student_id
    ).all()

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

    filepath = generate_excel(
        headers,
        rows,
        f"student_{student_id}"
    )

    send_email(
        subject="Placement Applications Excel Export",
        recipients=[email],
        body="Your Excel export is attached.",
        attachments=[
            {
                "path": filepath,
                "filename": os.path.basename(filepath),
                "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        ]
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
def export_company_applicants_excel(drive_id, email):

    applications = Application.query.filter_by(
        drive_id=drive_id
    ).all()

    headers = [
        "Student",
        "Roll Number",
        "Branch",
        "CGPA",
        "Skills",
        "Status"
    ]

    rows = []

    for application in applications:

        student = application.student

        rows.append([
            student.full_name,
            student.roll_number,
            student.branch,
            student.cgpa,
            student.skills,
            application.status
        ])

    filepath = generate_excel(
        headers,
        rows,
        f"drive_{drive_id}"
    )

    send_email(
        subject="Applicants Excel Export",
        recipients=[email],
        body="Your Excel export is attached.",
        attachments=[
            {
                "path": filepath,
                "filename": os.path.basename(filepath),
                "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        ]
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

@celery.task
def export_admin_report_excel(email):

    # --------------------------------------------------
    # 1. SUMMARY
    # --------------------------------------------------

    total_students = Student.query.count()

    total_companies = Company.query.count()

    approved_companies = Company.query.filter_by(
        approval_status="approved"
    ).count()

    pending_companies = Company.query.filter_by(
        approval_status="pending"
    ).count()

    rejected_companies = Company.query.filter_by(
        approval_status="rejected"
    ).count()

    total_drives = PlacementDrive.query.count()

    approved_drives = PlacementDrive.query.filter_by(
        status="approved"
    ).count()

    pending_drives = PlacementDrive.query.filter_by(
        status="pending"
    ).count()

    closed_drives = PlacementDrive.query.filter_by(
        status="closed"
    ).count()

    total_applications = Application.query.count()

    applied_count = Application.query.filter_by(
        status="applied"
    ).count()

    shortlisted_count = Application.query.filter_by(
        status="shortlisted"
    ).count()

    selected_count = Application.query.filter_by(
        status="selected"
    ).count()

    rejected_count = Application.query.filter_by(
        status="rejected"
    ).count()

    withdrawn_count = Application.query.filter_by(
        status="withdrawn"
    ).count()


    # --------------------------------------------------
    # 2. STUDENTS
    # --------------------------------------------------

    students = Student.query.all()

    student_headers = [
        "Student ID",
        "Full Name",
        "Roll Number",
        "College Email",
        "Personal Email",
        "College Name",
        "Stream",
        "Branch",
        "CGPA",
        "Phone",
        "Graduation Year",
        "Year",
        "Skills",
        "LinkedIn",
        "GitHub",
        "Portfolio",
        "Permanent Address",
        "Resume"
    ]

    student_rows = []

    for student in students:

        student_rows.append([
            student.id,
            student.full_name,
            student.roll_number,
            student.college_email,
            student.personal_email,
            student.college_name,
            student.stream,
            student.branch,
            student.cgpa,
            student.phone,
            student.graduation_year,
            student.year,
            student.skills,
            student.linkedin_url,
            student.github_url,
            student.portfolio_url,
            student.permanent_address,
            student.resume
        ])


    # --------------------------------------------------
    # 3. COMPANIES
    # --------------------------------------------------

    companies = Company.query.all()

    company_headers = [
        "Company ID",
        "Company Name",
        "Industry Type",
        "Company Domain",
        "Company Size",
        "Logo",
        "Website",
        "HR Email",
        "HR Contact",
        "Location",
        "Government Verification ID",
        "Description",
        "Approval Status",
        "Created At"
    ]

    company_rows = []

    for company in companies:

        company_rows.append([
            company.id,
            company.company_name,
            company.industry_type,
            company.company_domain,
            company.company_size,
            company.logo,
            company.website,
            company.hr_email,
            company.hr_contact,
            company.location,
            company.govt_verification_id,
            company.description,
            company.approval_status,
            company.created_at
        ])


    # --------------------------------------------------
    # 4. PLACEMENT DRIVES
    # --------------------------------------------------

    drives = PlacementDrive.query.all()

    drive_headers = [
        "Drive ID",
        "Company",
        "Title",
        "Description",
        "Eligibility CGPA",
        "Job Type",
        "Compensation",
        "Location",
        "Required Skills",
        "Selection Process",
        "Drive Date",
        "Last Date To Apply",
        "Status",
        "Created At"
    ]

    drive_rows = []

    for drive in drives:

        drive_rows.append([
            drive.id,
            drive.company.company_name,
            drive.title,
            drive.description,
            drive.eligibility_cgpa,
            drive.job_type,
            drive.compensation,
            drive.location,
            drive.required_skills,
            drive.selection_process,
            drive.drive_date,
            drive.last_date_to_apply,
            drive.status,
            drive.created_at
        ])


    # --------------------------------------------------
    # 5. APPLICATIONS
    # --------------------------------------------------

    applications = Application.query.all()

    application_headers = [
        "Application ID",
        "Student",
        "Roll Number",
        "Branch",
        "CGPA",
        "Company",
        "Drive",
        "Job Type",
        "Location",
        "Resume Used",
        "Cover Letter",
        "Status",
        "Company Notes",
        "Rejection Reason",
        "Last Status Updated By",
        "Applied At",
        "Updated At"
    ]

    application_rows = []

    for application in applications:

        student = application.student
        drive = application.drive
        company = drive.company

        application_rows.append([
            application.id,
            student.full_name,
            student.roll_number,
            student.branch,
            student.cgpa,
            company.company_name,
            drive.title,
            drive.job_type,
            drive.location,
            application.resume_used,
            application.cover_letter,
            application.status,
            application.company_notes,
            application.rejection_reason,
            application.last_status_updated_by,
            application.applied_at,
            application.updated_at
        ])


    # --------------------------------------------------
    # 6. RECRUITMENT PROGRESS
    # --------------------------------------------------

    recruitment_headers = [
        "Application ID",
        "Student",
        "Roll Number",
        "Company",
        "Drive",
        "Recruitment Status",
        "Current Round",

        "Round 1 Completed",
        "Round 1 Status",
        "Round 1 Scheduled At",
        "Round 1 Meeting Details",
        "Round 1 Test Link",
        "Round 1 Email Sent",

        "Round 2 Completed",
        "Round 2 Status",
        "Round 2 Scheduled At",
        "Round 2 Meeting Details",
        "Round 2 Test Link",
        "Round 2 Email Sent",

        "Round 3 Completed",
        "Round 3 Status",
        "Round 3 Scheduled At",
        "Round 3 Meeting Details",
        "Round 3 Test Link",
        "Round 3 Email Sent",

        "Round 4 Completed",
        "Round 4 Status",
        "Round 4 Scheduled At",
        "Round 4 Meeting Details",
        "Round 4 Test Link",
        "Round 4 Email Sent",

        "Offer Letter Generated",
        "Offer Letter Path",
        "Offer Letter Sent",
        "Offer Letter Sent At",

        "Created At",
        "Updated At"
    ]

    recruitment_rows = []

    applications_with_recruitment = Application.query.all()

    for application in applications_with_recruitment:

        recruitment = application.recruitment_process

        if not recruitment:
            continue

        student = application.student
        drive = application.drive
        company = drive.company

        recruitment_rows.append([

            application.id,

            student.full_name,

            student.roll_number,

            company.company_name,

            drive.title,

            recruitment.recruitment_status,

            recruitment.current_round,

            recruitment.round1_completed,
            recruitment.round1_status,
            recruitment.round1_scheduled_at,
            recruitment.round1_meeting_details,
            recruitment.round1_test_link,
            recruitment.round1_email_sent,

            recruitment.round2_completed,
            recruitment.round2_status,
            recruitment.round2_scheduled_at,
            recruitment.round2_meeting_details,
            recruitment.round2_test_link,
            recruitment.round2_email_sent,

            recruitment.round3_completed,
            recruitment.round3_status,
            recruitment.round3_scheduled_at,
            recruitment.round3_meeting_details,
            recruitment.round3_test_link,
            recruitment.round3_email_sent,

            recruitment.round4_completed,
            recruitment.round4_status,
            recruitment.round4_scheduled_at,
            recruitment.round4_meeting_details,
            recruitment.round4_test_link,
            recruitment.round4_email_sent,

            recruitment.offer_letter_generated,
            recruitment.offer_letter_path,
            recruitment.offer_letter_sent,
            recruitment.offer_letter_sent_at,

            recruitment.created_at,
            recruitment.updated_at
        ])


    # --------------------------------------------------
    # 7. SELECTED STUDENTS
    # --------------------------------------------------

    selected_applications = Application.query.filter_by(
        status="selected"
    ).all()

    selected_headers = [
        "Application ID",
        "Student",
        "Roll Number",
        "Branch",
        "CGPA",
        "Company",
        "Job Role",
        "Job Type",
        "Compensation",
        "Location",
        "Applied At",
        "Selected At",
        "Offer Letter Generated",
        "Offer Letter Sent"
    ]

    selected_rows = []

    for application in selected_applications:

        student = application.student
        drive = application.drive
        company = drive.company
        recruitment = application.recruitment_process

        selected_rows.append([
            application.id,
            student.full_name,
            student.roll_number,
            student.branch,
            student.cgpa,
            company.company_name,
            drive.title,
            drive.job_type,
            drive.compensation,
            drive.location,
            application.applied_at,
            application.updated_at,
            recruitment.offer_letter_generated
                if recruitment else None,
            recruitment.offer_letter_sent
                if recruitment else None
        ])


    # --------------------------------------------------
    # 8. REJECTED APPLICATIONS
    # --------------------------------------------------

    rejected_applications = Application.query.filter_by(
        status="rejected"
    ).all()

    rejected_headers = [
        "Application ID",
        "Student",
        "Roll Number",
        "Company",
        "Drive",
        "Job Type",
        "Rejection Reason",
        "Company Notes",
        "Applied At",
        "Updated At"
    ]

    rejected_rows = []

    for application in rejected_applications:

        student = application.student
        drive = application.drive
        company = drive.company

        rejected_rows.append([
            application.id,
            student.full_name,
            student.roll_number,
            company.company_name,
            drive.title,
            drive.job_type,
            application.rejection_reason,
            application.company_notes,
            application.applied_at,
            application.updated_at
        ])


    # --------------------------------------------------
    # 9. WITHDRAWN APPLICATIONS
    # --------------------------------------------------

    withdrawn_applications = Application.query.filter_by(
        status="withdrawn"
    ).all()

    withdrawn_headers = [
        "Application ID",
        "Student",
        "Roll Number",
        "Company",
        "Drive",
        "Job Type",
        "Location",
        "Applied At",
        "Withdrawn / Updated At"
    ]

    withdrawn_rows = []

    for application in withdrawn_applications:

        student = application.student
        drive = application.drive
        company = drive.company

        withdrawn_rows.append([
            application.id,
            student.full_name,
            student.roll_number,
            company.company_name,
            drive.title,
            drive.job_type,
            drive.location,
            application.applied_at,
            application.updated_at
        ])


    # --------------------------------------------------
    # CREATE WORKBOOK
    # --------------------------------------------------

    sheets = {

        "Summary": {
            "headers": [
                "Metric",
                "Value"
            ],

            "rows": [

                ["Total Students", total_students],

                ["Total Companies", total_companies],
                ["Approved Companies", approved_companies],
                ["Pending Companies", pending_companies],
                ["Rejected Companies", rejected_companies],

                ["Total Drives", total_drives],
                ["Approved Drives", approved_drives],
                ["Pending Drives", pending_drives],
                ["Closed Drives", closed_drives],

                ["Total Applications", total_applications],
                ["Applied", applied_count],
                ["Shortlisted", shortlisted_count],
                ["Selected", selected_count],
                ["Rejected", rejected_count],
                ["Withdrawn", withdrawn_count]
            ]
        },

        "Students": {
            "headers": student_headers,
            "rows": student_rows
        },

        "Companies": {
            "headers": company_headers,
            "rows": company_rows
        },

        "Drives": {
            "headers": drive_headers,
            "rows": drive_rows
        },

        "Applications": {
            "headers": application_headers,
            "rows": application_rows
        },

        "Recruitment": {
            "headers": recruitment_headers,
            "rows": recruitment_rows
        },

        "Selected Students": {
            "headers": selected_headers,
            "rows": selected_rows
        },

        "Rejected Applications": {
            "headers": rejected_headers,
            "rows": rejected_rows
        },

        "Withdrawn Applications": {
            "headers": withdrawn_headers,
            "rows": withdrawn_rows
        }
    }


    filepath = generate_multi_sheet_excel(
        sheets,
        "admin_placement_report"
    )


    # --------------------------------------------------
    # EMAIL REPORT
    # --------------------------------------------------

    send_email(
        subject="Placement Park - Detailed Placement Report",
        recipients=[email],
        body=(
            "Your detailed Placement Park "
            "administrative placement report "
            "has been generated and is attached."
        ),
        attachments=[
            {
                "path": filepath,
                "filename": os.path.basename(filepath),
                "content_type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        ]
    )


    return {
        "filepath": filepath,
        "filename": os.path.basename(filepath)
    }

