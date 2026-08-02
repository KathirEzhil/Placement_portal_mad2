from app import db
from app.models.activity_log import ActivityLog


def log_activity(user_id,role,action,entity_type,entity_id,description):

    activity = ActivityLog(
        user_id=user_id,
        role=role,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description
    )

    db.session.add(activity)