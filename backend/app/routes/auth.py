from flask import Blueprint, request, jsonify, session

from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db
from app.models import User
from app.utils.decorators import login_required, role_required 

auth_bp = Blueprint("auth",__name__,url_prefix="/auth")


@auth_bp.route("/test")
def test():
    return "Authentication blueprint working"


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()
    
    if not data:
        return jsonify({
            "success": False,
            "message": "Request body must be in JSON format"
        }), 400
    
    # used get instead of data[] to avoid crash if any field is missing
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirm_password")
    role = data.get("role")

    if not all([email, password, confirm_password, role]):
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400
    
    if password != confirm_password: 
        return jsonify({
            "success": False,
            "message": "Passwords do not match"
        }), 400
    
    if role not in ["student", "company"]:
        return jsonify({
            "success": False,
            "message": "Invalid role"
        }), 400
    
    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must be atleast 8 characters long"
        }), 400
    
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({
            "success": False,
            "message": "Email already registered"
        }), 409 # 409 means conflict
    
    hashed_password = generate_password_hash(password)

    user = User(email=email,password_hash=hashed_password,role=role)

    try:
        db.session.add(user)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "User registered successfully"
        }), 201
    
    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Registration failed",
            "error": str(e)
        }),500


@auth_bp.route("/login", methods=["Post"])
def login():
    
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request must be in JSON format"
        }), 400
    
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400
    
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash,password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }),401
    
    session["user_id"] = user.id
    session["role"] = user.role
    session["email"] = user.email

    return jsonify({
        "success": True,
        "message": "Login successful",
        "data": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }), 200

# for testing the login_required decorator
@auth_bp.route("/protected")
@login_required
def protected():
    return jsonify({
        "success": True,
        "message": "You are authenticated"
        })

# for testing the role_required decorator
@auth_bp.route("/admin-test")
@login_required
@role_required("admin")
def admin_test():
    return jsonify({
        "success": True,
        "message": "Welcome Admin"
    }), 200


@auth_bp.route("/logout",methods=["POST"])
@login_required
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    }), 200


@auth_bp.route("/session",methods=["GET"])
def check_session():

    if "user_id" not in session:
        return jsonify({
            "authenticated": False
        }), 200

    user = User.query.filter_by(id=session["user_id"]).first()

    if not user:
        session.clear()
        return jsonify({
            "authenticated": False
        }), 200

    return jsonify({
        "authenticated": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }), 200


