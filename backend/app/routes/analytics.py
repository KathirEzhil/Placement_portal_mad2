from flask import  Blueprint, jsonify, session
from flask import request
from datetime import datetime

from app.models.company import Company
from app.models.student import Student
from app.models.user import User

from app.utils.decorators import login_required, role_required
from app.services.analytics_services import get_admin_summary
from app.services.analytics_services import get_recruitment_funnel
from app.services.analytics_services import get_monthly_trends
from app.services.analytics_services import get_company_rankings
from app.services.analytics_services import get_branch_statistics
from app.services.analytics_services import get_package_statistics
from app.services.analytics_services import get_drive_performance
from app.services.analytics_services import get_recent_activities
from app.services.analytics_services import get_admin_insights

from app.services.analytics_services import get_company_dashboard

from app.services.analytics_services import get_student_dashboard
from app.services.analytics_services import get_student_analytics

analytics_bp = Blueprint("analytics",__name__,url_prefix="/analytics")


@analytics_bp.route("/admin/dashboard", methods=["GET"])
@login_required
@role_required("admin")
def admin_dashboard():

    year = request.args.get(
        "year",
        default=datetime.utcnow().year,
        type=int
    )

    return jsonify({
        "success": True,
        "year": year,
        "summary": get_admin_summary(year)
    }), 200


@analytics_bp.route("/admin/recruitment-funnel", methods=["GET"])
@login_required
@role_required("admin")
def admin_recruitment_funnel():

    year = request.args.get(
        "year",
        default=datetime.utcnow().year,
        type=int
    )

    return jsonify({
        "success": True,
        "year": year,
        "funnel": get_recruitment_funnel(year)
    }), 200


@analytics_bp.route("/admin/monthly-trends", methods=["GET"])
@login_required
@role_required("admin")
def admin_monthly_trends():

    year = request.args.get(
        "year",
        default=datetime.utcnow().year,
        type=int
    )

    return jsonify({
        "success": True,
        "year": year,
        "monthly_trends": get_monthly_trends(year)
    }), 200


@analytics_bp.route("/admin/company-rankings", methods=["GET"])
@login_required
@role_required("admin")
def admin_company_rankings():

    year = request.args.get(
        "year",
        default=datetime.utcnow().year,
        type=int
    )

    return jsonify({
        "success": True,
        "year": year,
        "company_rankings": get_company_rankings(year)
    }), 200


@analytics_bp.route("/admin/branch-analytics", methods=["GET"])
@login_required
@role_required("admin")
def admin_branch_statistics():

    year = request.args.get(
        "year",
        default=datetime.utcnow().year,
        type=int
    )

    return jsonify({
        "success": True,
        "year": year,
        "branch_statistics": get_branch_statistics(year)
    }),200


@analytics_bp.route("/admin/package-analytics", methods=["GET"])
@login_required
@role_required("admin")
def admin_package_statistics():

    year = request.args.get(
        "year",
        default=datetime.utcnow().year,
        type=int
    )

    return jsonify({
        "success": True,
        "year": year,
        "package_statistics": get_package_statistics(year)
    }), 200


@analytics_bp.route("/admin/drive-performance", methods=["GET"])
@login_required
@role_required("admin")
def admin_drive_performance():

    year = request.args.get(
        "year",
        default=datetime.utcnow().year,
        type=int
    )

    return jsonify({
        "success": True,
        "year": year,
        "drive_performance": get_drive_performance(year)
    }), 200


@analytics_bp.route("/admin/recent-activities", methods=["GET"])
@login_required
@role_required("admin")
def admin_recent_activities():

    limit = request.args.get("limit", default=20, type=int)

    return jsonify({
        "success": True,
        "activities": get_recent_activities(limit)
    }),200


@analytics_bp.route("/admin/insights", methods=["GET"])
@login_required
@role_required("admin")
def admin_insights():

    year = request.args.get("year",default=datetime.utcnow().year,type=int)

    return jsonify({
        "success": True,
        "year": year,
        "insights": get_admin_insights(year)
    }), 200


@analytics_bp.route("/company/dashboard", methods=["GET"])
@login_required
@role_required("company")
def company_dashboard():

    company = Company.query.filter_by(
        user_id=session["user_id"]
    ).first()

    if not company:
        return jsonify({
            "success": False,
            "message": "Company profile not found."
        }), 404

    return jsonify({
        "success": True,
        "account_active": company.user.is_active,
        "dashboard": get_company_dashboard(company.id)
    }), 200


@analytics_bp.route("/student/dashboard", methods=["GET"])
@login_required
@role_required("student")
def student_dashboard():

    student = Student.query.filter_by(
        user_id=session["user_id"]
    ).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found."
        }),404

    return jsonify({
        "success": True,
        "account_active": student.user.is_active,
        "dashboard": get_student_dashboard(student.id)
    }), 200


@analytics_bp.route("/student/analytics", methods=["GET"])
@login_required
@role_required("student")
def student_analytics():

    student = Student.query.filter_by(
        user_id=session["user_id"]
    ).first()

    if not student:
        return jsonify({
            "success": False,
            "message": "Student profile not found."
        }),404

    return jsonify({

        "success": True,

        "analytics": get_student_analytics(student.id)

    }),200


@analytics_bp.before_request
def check_company_analytics_status():

    user_id = session.get("user_id")

    if not user_id:
        return None

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User account not found"
        }), 404

    if (
        user.role == "company"
        and not user.is_active
        and request.path != "/analytics/company/dashboard"
    ):

        return jsonify({
            "success": False,
            "message": (
                "Your company account has been "
                "deactivated by the administrator."
            ),
            "account_active": False
        }), 403

    return None