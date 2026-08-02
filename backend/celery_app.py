from celery import Celery

from app import create_app
from celery.schedules import crontab


def make_celery():

    app = create_app()

    celery = Celery(
        app.import_name,
        broker="redis://localhost:6379/0",
        backend="redis://localhost:6379/0",
    )

    celery.conf.update(app.config)

    celery.conf.update(timezone="Asia/kolkata",enable_utc=False)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):

            with app.app_context():
                return self.run(*args, **kwargs)


    celery.Task = ContextTask

    return celery

celery = make_celery()

import app.tasks.export_tasks
import app.tasks.reminder_tasks
import app.tasks.report_tasks


celery.conf.beat_schedule = {

    "daily-reminder": {
        "task":"app.tasks.reminder_tasks.send_daily_reminders",
        "schedule":crontab(
            hour=8,
            minute=0
        )
    },

    "monthly-report": {
        "task":"app.tasks.report_tasks.generate_monthly_report",
        "schedule":crontab(
            day_of_month=1,
            hour=9,
            minute=0
        )
    }
}