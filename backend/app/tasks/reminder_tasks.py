from celery_app import celery

from datetime import date, timedelta

from app.models.student import Student
from app.models.application import Application
from app.models.recruitment_process import RecruitmentProcess
from app.models.placement_drive import PlacementDrive

from app.utils.mail import send_email


@celery.task
def send_daily_reminders():

    tomorrow = date.today() + timedelta(days=1)
    reminders_sent = 0

    drives = PlacementDrive.query.filter(
        PlacementDrive.status == "approved",
        PlacementDrive.last_date_to_apply == tomorrow
    ).all()

    for drive in drives:

        eligible_students = Student.query.all()

        for student in eligible_students:

            send_email(
                recipient=student.user.email,
                subject="Placement Drive Closing Tomorrow",
                body=(
                    f"Thr application deadline for "
                    f"{drive.title} at "
                    f"{drive.company.company_name} "
                    f"is tomorrow."
                )
            )
            reminders_sent += 1

    recruitments = RecruitmentProcess.query.all()

    for recruitment in recruitments:
        application = recruitment.application
        for i in range(1,5):
            interview_date = getattr(recruitment,f"round{i}_scheduled_at")

            if (interview_date and interview_date.date() == tomorrow):
                send_email(
                    recipient=application.student.user.email,
                    subject="Interview Reminder",
                    body=(
                        f"You have "
                        f"{application.drive.round1_name if i==1 else getattr(application.drive, f'round{i}_name')} "
                        f"scheduled tomorrow."
                    )
                )
                reminders_sent += 1
        return {
            "status":"completed",
            "emails_sent":reminders_sent
        }