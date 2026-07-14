from flask import Blueprint, request, jsonify, session

from app.extensions import db
from app.models.user import User
from app.models.company import Company

from app.utils.decorators import login_required, role_required

company_bp = Blueprint("company",__name__,url_prefix="/company")


@company_bp.route("/profile",methods=["GET"])
@login_required
@role_required("company")
def get_profile():

    user = db.session.get(User, session["user_id"])
    company = user.company

    if company is None:
        return jsonify({
            "success": False,
            "message": "company profile not found"
        }), 404
    
    return jsonify({
        "success": True,
        "data":{
            "email": user.email,
            "company_name": company.company_name,
            "industry_type": company.industry_type,
            "company_domain": company.company_domain,
            "website": company.website,
            "hr_email": company.hr_email,
            "hr_contact": company.hr_contact,
            "location": company.location,
            "govt_verification_id": company.govt_verification_id,
            "description": company.description,
            "approval_status": company.approval_status
        }
    }), 200



@company_bp.route("/profile",methods=["PUT"])
@login_required
@role_required
def update_profile():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body must be in JSON format"
        }), 400
    
    company_name = data.get("company_name","").strip()
    industry_type = data.get("industry_type")
    company_domain = data.get("company_name")
    website = data.get("website","").strip()
    hr_email = data.get("hr_email")
    hr_contact = data.get("hr_contact")
    location = data.get("location","").strip()
    govt_verification_id = data.get("govt_verification_id")
    description = data.get("description", "").strip()

    if not company_name:
        return jsonify({
            "success": False,
            "message": "Company name is required"
        }), 400

    if not location:
        return jsonify({
            "success": False,
            "message": "Location is required"
        }), 400
    
    if not website:
        return jsonify({
            "success": False,
            "message": "Website url is required"
        }), 400
    
    if not (industry_type or company_domain):
        return jsonify({
            "success": False,
            "message": "Both insutry type and company_domain are required"
        }), 400
    
    if not hr_email:
        return jsonify({
            "success": False,
            "message": "HR email id is required."
        }), 400

    user = db.session.get(User, session["user_id"])
    company = user.company

    existing_company = Company.query.filter_by(company_name=company_name).first()

    if existing_company and existing_company.user_id != user.id:
        return jsonify({
            "success": False,
            "message": "Company name already exists"
        }), 409
    
    if len(company_name) < 3:
        return jsonify({
            "success": False,
            "message": "Company name must be at least 3 characters long."
        }), 400
    
    if len(location) < 2:
        return jsonify({
            "success": False,
            "message": "Location is too short."
        }), 400
    
    if not (website.startswith("http://") or website.startswith("https://")):
        return jsonify({
            "success": False,
            "message": "Website must start with http:// or https://"
        }), 400
    
    if company is None:
        
        company = Company(
            user_id = user.id,
            company_name = company_name,
            industry_type = industry_type,
            company_domain = company_domain,
            website = website,
            hr_email = hr_email,
            hr_contact = hr_contact,
            location = location,
            govt_verification_id = govt_verification_id,
            description = description
        )

        db.session.add(company)
    
    else:

        company.company_name = company_name
        company.industry_type = industry_type
        company.company_domain = company_domain
        company.website = website
        company.hr_email = hr_email
        company.hr_contact = hr_contact
        company.location = location
        company.govt_verification_id = govt_verification_id
        company.description = description

    try:

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Company profile updated successfully"
        }), 200
    
    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to update company profile",
            "error": str(e)
        }), 500

        
