from celery_app import celery

from datetime import datetime

from app.models.student import Student
from app.models.company import Company
from app.models.application import Application
from app.models.placement_drive import PlacementDrive

from app.utils.mail import send_email


@celery.task
def generate_monthly_report():

    students = Student.query.count()
    companies = Company.query.count()
    drives = PlacementDrive.query.count()
    applications = Application.query.count()
    selected = Application.query.filter_by(status="selected").count()

    placement_rate = 0

    if students:
        placement_rate = round(selected /students*100,2)

    html = f"""

        <h2>Placement Portal Monthly Report</h2>

        <table border="1">
        <tr>
            <td>Total Students</td>
            <td>{students}</td>
        </tr>
        <tr>
            <td>Total Companies</td>
            <td>{companies}</td>
        </tr>
        <tr>
            <td>Total Drives</td>
            <td>{drives}</td>
        </tr>
        <tr>
            <td>Total Applications</td>
            <td>{applications}</td>
        </tr>
        <tr>
            <td>Selected Students</td>
            <td>{selected}</td>
        </tr>
        <tr>
            <td>Placement Rate</td>
            <td>{placement_rate}%</td>
        </tr>
        </table>

        """
    send_email(
        recipient="admin@gmail.com",
        subject="Monthly Placement Report",
        html=html
    )

    return{"status":"completed"}
    