from functools import wraps

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