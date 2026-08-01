from datetime import datetime
import os

from flask import current_app
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (SimpleDocTemplate,Paragraph,Spacer)


def generate_offer_letter_pdf(application):

    student = application.student
    drive = application.drive
    company = drive.company

    upload_folder = current_app.config["OFFER_LETTER_FOLDER"]

    os.makedirs(upload_folder, exist_ok=True)

    filename = (
        f"{student.roll_number}_"
        f"{company.company_name.replace(' ', '_')}_"
        f"OfferLetter.pdf"
    )

    filepath = os.path.join(upload_folder,filename)

    document = SimpleDocTemplate(filepath)

    styles = getSampleStyleSheet()

    title_style = styles["Heading1"]
    title_style.alignment = TA_CENTER

    heading_style = styles["Heading2"]

    normal_style = styles["BodyText"]

    story = []

    story.append(Paragraph("OFFER LETTER",title_style))

    story.append(Spacer(1, 0.3 * inch))

    story.append(Paragraph(f"<b>Company:</b> {company.company_name}",normal_style))

    story.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%d-%m-%Y')}",normal_style))

    story.append(Spacer(1,0.2 * inch))

    story.append(Paragraph(f"Dear <b>{student.full_name}</b>,",normal_style))

    story.append(Spacer(1,0.15 * inch))

    story.append(Paragraph("Congratulations!",heading_style))

    story.append(Spacer(1,0.15 * inch))

    story.append(Paragraph(
            (
                f"We are pleased to offer you the position of "
                f"<b>{drive.title}</b> "
                f"at <b>{company.company_name}</b>."
            ),
            normal_style
        )
    )

    story.append(Spacer(1,0.15 * inch))

    story.append(Paragraph(
            f"<b>Job Type:</b> {drive.job_type}",
            normal_style
        )
    )

    story.append(Paragraph(
            f"<b>Compensation:</b> {drive.compensation}",
            normal_style
        )
    )

    story.append( Paragraph(
            f"<b>Job Location:</b> {drive.location}",
            normal_style
        )
    )

    story.append(Paragraph(
            f"<b>Student Name:</b> {student.full_name}",
            normal_style
        )
    )

    story.append(Paragraph(
            f"<b>Roll Number:</b> {student.roll_number}",
            normal_style
        )
    )

    story.append(Paragraph(
            f"<b>Branch:</b> {student.branch}",
            normal_style
        )
    )

    story.append(Spacer(1,0.3 * inch))

    story.append(Paragraph(
            (
                "We look forward to having you as a valued member "
                "of our organisation."
            ),
            normal_style
        )
    )

    story.append(Spacer(1,0.5 * inch))

    story.append(Paragraph("Regards,",normal_style))

    story.append(Paragraph(company.company_name,normal_style))

    document.build(story)

    return filepath