from flask import Blueprint, jsonify, request
from app.models import Company

from app.extensions import db
from app.utils.decorators import login_required, role_required


admin_bp = Blueprint("admin",__name__,prefix_url="/admin")


@admin_bp.route("/pending-companies",methods=["GET"])
@login_required
@role_required("admin")
def get_pending_companies():

    pending = Company.query.filter_by(approval_status = "pending").all()

    if not pending:
        return jsonify({
            "success": True,
            "message": "No pending companies found.",
            "companies": []
        }), 200
    
    companies = []

    for company in pending:
        companies.append({
            "id": company.id,
            "company_name": company.company_name,
            "website": company.website,
            "location": company.location,
            "company_size": company.company_size,
            "created_at": company.created_at
        })

    return jsonify({
        "success": True,
        "companies": companies
    }), 200


@admin_bp.route("/company/<int:company_id>", methods=["GET"])
@login_required
@role_required("admin")
def get_company(company_id):

    company = Company.session.get(Company,company_id)

    if company is None:
        return jsonify({
            "success": False,
            "message": "Company not found."
        }), 404
    
    company_data = {
        "id": company.id,
        "company_name": company.company_name,
        "industry_type": company.industry_type,
        "company_domain": company.company_domain,
        "website": company.website,
        "location": company.location,
        "description": company.description,
        "company_size": company.company_size,
        "logo": company.logo,
        "hr_email": company.hr_email,
        "hr_contact": company.hr_contact,
        "govt_verification_id": company.govt_verification_id,
        "approval_status": company.approval_status,
        "created_at": company.created_at
    }
    
    return jsonify({
        "success": True,
        "company": company_data
    }), 200


@admin_bp.route("/company/<int:company_id/approve",methods=["PUT"])
@login_required
@role_required("admin")
def appprove_company(company_id):

    company = db.session.get(Company,company_id)

    if not company:
        return jsonify({
            "success": False,
            "message": "Company not found"
        }), 404
    
    if company.approval_status == "approved":
        return jsonify({
            "success": False,
            "message": "Company already approved"
        }), 400
    
    company.approval_status = "approved"
    company.rejection_reason = None

    try:
        db.session.commit()

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to approve company",
            "error": str(e)
        }), 500
    
    return jsonify({
        "success": True,
        "message": "Company approved successfully"
    }), 200


@admin_bp.route("/company/<int:company_id>/reject",methods=["PUT"])
@login_required
@role_required("admin")
def reject_company(company_id):

    # for adding rejection reason
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No input data provided."
        }), 400

    reason = data.get("reason", "").strip()

    if not reason:
        return jsonify({
            "success": False,
            "message": "Rejection reason is required."
        }), 400

    company = db.session.get(Company,company_id)

    if not company:
        return jsonify({
            "success": False,
            "message": "Company not found"
        }), 404
    
    if company.approval_status == "rejected":
        return jsonify({
            "success": False,
            "message": "Company already rejected"
        }), 400
    
    company.approval_status = "rejected"
    company.rejection_reason = reason

    try:
        db.session.commit()

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to reject company",
            "error": str(e)
        }), 500
    
    return jsonify({
        "success": True,
        "message": "Company rejected successfully"
    }), 200