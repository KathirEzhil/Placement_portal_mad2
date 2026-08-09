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


    # ==========================================
    # Placement Drive Deadline Reminders
    # ==========================================

    drives = PlacementDrive.query.filter(
        PlacementDrive.status == "approved",
        PlacementDrive.last_date_to_apply == tomorrow
    ).all()


    for drive in drives:

        eligible_students = Student.query.all()


        for student in eligible_students:

            send_email(

                subject="Placement Drive Closing Tomorrow",

                recipients=[
                    student.user.email
                ],

                body=(
                    f"The application deadline for "
                    f"{drive.title} at "
                    f"{drive.company.company_name} "
                    f"is tomorrow."
                )
            )

            reminders_sent += 1


    # ==========================================
    # Interview Reminders
    # ==========================================

    recruitments = RecruitmentProcess.query.all()


    for recruitment in recruitments:

        application = recruitment.application


        if not application:

            continue


        for i in range(1, 5):

            interview_date = getattr(
                recruitment,
                f"round{i}_scheduled_at",
                None
            )


            if (
                interview_date
                and interview_date.date() == tomorrow
            ):

                round_name = getattr(
                    application.drive,
                    f"round{i}_name",
                    None
                )


                if not round_name:

                    round_name = f"Round {i}"


                send_email(

                    subject="Interview Reminder",

                    recipients=[
                        application.student.user.email
                    ],

                    body=(
                        f"You have "
                        f"{round_name} "
                        f"scheduled tomorrow "
                        f"for the placement drive "
                        f"{application.drive.title}."
                    )
                )

                reminders_sent += 1


    return {

        "status": "completed",

        "emails_sent": reminders_sent

    }