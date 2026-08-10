from functools import wraps

from app.models.user import User

from flask import session, jsonify

def login_required(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        if "user_id" not in session:
            return jsonify({
                "success": False,
                "message": "Authentication required"
            }), 401
        return func(*args,**kwargs)
    return wrapper

def role_required(role):

    def decorator(func):

        @wraps(func)
        def wrapper(*args,**kwargs):

            if session.get("role") != role:
                return jsonify({
                    "success": False,
                    "message": "Access denied"
                }), 403
            return func(*args,**kwargs)
        return wrapper
    return decorator


def active_account_required(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        user_id = session.get("user_id")

        if not user_id:

            return jsonify({
                "success": False,
                "message": "Authentication required"
            }), 401

        user = User.query.get(user_id)

        if not user:

            return jsonify({
                "success": False,
                "message": "User account not found"
            }), 404

        if not user.is_active:

            return jsonify({
                "success": False,
                "message": (
                    "Your account has been deactivated "
                    "by the administrator."
                ),
                "account_active": False
            }), 403

        return func(*args, **kwargs)

    return wrapper