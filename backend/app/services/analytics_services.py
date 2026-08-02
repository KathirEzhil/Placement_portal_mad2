from sqlalchemy import func
from sqlalchemy import extract
from statistics import median

from datetime import date

from app import db
from collections import OrderedDict

from app.models.student import Student
from app.models.company import Company
from app.models.placement_drive import PlacementDrive
from app.models.application import Application
from app.models.recruitment_process import RecruitmentProcess
from app.models.activity_log import ActivityLog

from app.utils.compensation_parser import extract_lpa
from app.utils.profile_completion import calculate_profile_completion


# ======== Admin analytics ========

def get_admin_summary():

    total_students = Student.query.count()
    approved_companies = Company.query.filter_by(approval_status="approved").count()
    pending_companies = Company.query.filter_by(approval_status="pending").count()
    active_drives = PlacementDrive.query.filter_by(status="approved").count()
    total_applications = Application.query.count()
    selected_students = Application.query.filter_by(status="selected").count()
    shortlisted_students = Application.query.filter_by(status="shortlisted").count()
    rejected_students = Application.query.filter_by(status="rejected").count()
    withdrawn_students = Application.query.filter_by(status="withdrawn").count()

    placement_rate = 0
    if total_applications > 0:
        placement_rate = round((selected_students/total_applications)*100,2)

    highest_package = None
    average_package = None

    return {
        "total_students": total_students,
        "approved_companies": approved_companies,
        "pending_companies": pending_companies,
        "active_drives": active_drives,
        "total_applications": total_applications,
        "selected_students": selected_students,
        "shortlisted_students": shortlisted_students,
        "rejected_students": rejected_students,
        "withdrawn_students": withdrawn_students,
        "placement_rate": placement_rate,
        "highest_package": highest_package,
        "average_package": average_package
    }


def get_recruitment_funnel():

    applications = Application.query.count()
    shortlisted = Application.query.filter_by(status="shortlisted").count()

    recruitment_started = RecruitmentProcess.query.filter(
        RecruitmentProcess.recruitment_status.in_(
            ["in_progress", "completed"])).count()

    selected = Application.query.filter_by(status="selected").count()
    offer_generated = RecruitmentProcess.query.filter_by(offer_letter_generated=True).count()
    offer_sent = RecruitmentProcess.query.filter_by(offer_letter_sent=True).count()

    return {
        "applications": applications,
        "shortlisted": shortlisted,
        "recruitment_started": recruitment_started,
        "selected": selected,
        "offer_generated": offer_generated,
        "offer_sent": offer_sent
    }


def get_monthly_trends(year):

    months = OrderedDict([("January", {}),("February", {}),("March", {}),
        ("April", {}),("May", {}),("June", {}),("July", {}),("August", {}),
        ("September", {}),("October", {}),("November", {}),("December", {})
    ])

    for month in months:
        months[month] = {
            "applications": 0,
            "drives": 0,
            "companies": 0,
            "students": 0,
            "selections": 0
        }

    application_data = (
        db.session.query(
            extract("month", Application.applied_at),
            func.count(Application.id)
        )
        .filter(extract("year", Application.applied_at) == year)
        .group_by(extract("month", Application.applied_at))
        .all()
    )

    month_names = list(months.keys())

    for month, count in application_data:
        months[month_names[int(month)-1]]["applications"] = count

    drive_data = (
        db.session.query(
            extract("month", PlacementDrive.created_at),
            func.count(PlacementDrive.id)
        )
        .filter(extract("year", Application.applied_at) == year)
        .group_by(extract("month", PlacementDrive.created_at))
        .all()
    )

    for month, count in drive_data:
        months[month_names[int(month)-1]]["drives"] = count

    company_data = (
        db.session.query(
            extract("month", Company.created_at),
            func.count(Company.id)
        )
        .filter(extract("year", Application.applied_at) == year)
        .group_by(extract("month", Company.created_at))
        .all()
    )

    for month, count in company_data:
        months[month_names[int(month)-1]]["companies"] = count

    student_data = (
        db.session.query(
            extract("month", Student.created_at),
            func.count(Student.id)
        )
        .filter(extract("year", Application.applied_at) == year)
        .group_by(extract("month", Student.created_at))
        .all()
    )

    for month, count in student_data:
        months[month_names[int(month)-1]]["students"] = count

    selection_data = (
        db.session.query(
            extract("month", Application.updated_at),
            func.count(Application.id)
        )
        .filter(extract("year", Application.applied_at) == year)
        .filter(Application.status == "selected")
        .group_by(extract("month", Application.updated_at))
        .all()
    )

    for month, count in selection_data:
        months[month_names[int(month)-1]]["selections"] = count

    return months


def get_company_rankings():

    company_data = (
        db.session.query(
            Company.id,Company.company_name,
            func.count(func.distinct(PlacementDrive.id)).label("total_drives"),
            func.count(func.distinct(Application.id)).label("total_applications"),
            func.sum(
                db.case((Application.status == "selected", 1),else_=0)
            ).label("selected_students")
        )
        .outerjoin(
            PlacementDrive,
            PlacementDrive.company_id == Company.id
        )
        .outerjoin(
            Application,
            Application.drive_id == PlacementDrive.id
        )
        .filter(Company.approval_status == "approved")
        .group_by(Company.id)
        .all()
    )

    rankings = []

    for company in company_data:

        selected = company.selected_students or 0
        applications = company.total_applications or 0
        success_rate = 0
        if applications > 0:
            success_rate = round((selected / applications) * 100,2)

        rankings.append({
            "company_id": company.id,
            "company_name": company.company_name,
            "total_drives": company.total_drives,
            "total_applications": applications,
            "selected_students": selected,
            "success_rate": success_rate
        })

    rankings.sort(key=lambda company: company["selected_students"],reverse=True)

    for index, company in enumerate(rankings):
            company["rank"] = index + 1

    return rankings


def get_branch_statistics(year):

    branch_data = (

        db.session.query(
            Student.branch.label("branch"),

            func.count(
                func.distinct(Student.id)
            ).label("students"),

            func.avg(
                Student.cgpa
            ).label("average_cgpa"),

            func.count(
                Application.id
            ).label("applications"),

            func.sum(
                db.case((Application.status=="selected",1),else_=0)
            ).label("selected"))
        .outerjoin(Application, Application.student_id==Student.id)
        .filter(extract("year",Student.created_at)==year)
        .group_by(Student.branch)
        .all()

    )

    statistics = []

    for branch in branch_data:

        students = branch.students or 0
        applications = branch.applications or 0
        selected = branch.selected or 0
        average_cgpa = round(branch.average_cgpa or 0,2)

    placement_percentage = 0

    if students > 0:
        placement_percentage = round((selected/students)*100,2)

    statistics.append({
        "branch": branch.branch,
        "students": students,
        "applications": applications,
        "selected": selected,
        "placement_percentage": placement_percentage,
        "average_cgpa": average_cgpa
    })

    statistics.sort(key=lambda branch: branch["placement_percentage"], reverse=True)

    for index, branch in enumerate(statistics):
        branch["rank"]=index+1

    return statistics


def get_package_statistics(year):

    drives = PlacementDrive.query.filter(
        extract("year", PlacementDrive.created_at) == year,
        PlacementDrive.status == "approved"
    ).all()

    package_values = []

    internship_count = 0

    full_time_count = 0

    intern_ft_count = 0

    for drive in drives:

        package = extract_lpa(drive.compensation)
        if package is not None:
            package_values.append(package)
        if drive.job_type == "internship":
            internship_count += 1
        elif drive.job_type == "full_time":
            full_time_count += 1
        elif drive.job_type == "intern_ft":
            intern_ft_count += 1

    highest_package = 0
    average_package = 0
    median_package = 0

    if package_values:

        highest_package = max(package_values)

        average_package = round(
            sum(package_values) / len(package_values),
            2
        )

        median_package = round(
            median(package_values),
            2
        )

    return {
        "highest_package": highest_package,
        "average_package": average_package,
        "median_package": median_package,
        "internship_drives": internship_count,
        "full_time_drives": full_time_count,
        "intern_and_ft_drives": intern_ft_count
    }


def get_drive_performance(year):

    drives = (
        PlacementDrive.query.filter(
            extract("year", PlacementDrive.created_at) == year)
        .order_by(PlacementDrive.created_at.desc())
        .all()
    )

    performance = []

    for drive in drives:

        applications = Application.query.filter_by(
            drive_id=drive.id
        ).count()

        shortlisted = Application.query.filter_by(
            drive_id=drive.id,
            status="shortlisted"
        ).count()

        selected = Application.query.filter_by(
            drive_id=drive.id,
            status="selected"
        ).count()

        rejected = Application.query.filter_by(
            drive_id=drive.id,
            status="rejected"
        ).count()

        withdrawn = Application.query.filter_by(
            drive_id=drive.id,
            status="withdrawn"
        ).count()

    success_rate = 0

    if applications > 0:
        success_rate = round((selected / applications) * 100,2)

    performance.append({
        "drive_id": drive.id,
        "company_name": drive.company.company_name,
        "title": drive.title,
        "job_type": drive.job_type,
        "location": drive.location,
        "compensation": drive.compensation,
        "applications": applications,
        "shortlisted": shortlisted,
        "selected": selected,
        "rejected": rejected,
        "withdrawn": withdrawn,
        "success_rate": success_rate,
        "status": drive.status,
        "last_date_to_apply": (
            drive.last_date_to_apply.isoformat()
            if drive.last_date_to_apply
            else None
        )
    })

    performance.sort(key=lambda drive: drive["applications"],reverse=True)

    return performance


def get_recent_activities(limit=20):

    activities = (
        ActivityLog.quer
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )

    return [activity.to_dict() for activity in activities]


def get_admin_insights(year):

    insights = []

    company_rankings = get_company_rankings()
    if company_rankings:
        top_company = company_rankings[0]
        insights.append({
            "type": "success",
            "icon": "trophy",
            "title": "Top Recruiting Company",
            "message": (
                f"{top_company['company_name']} selected "
                f"{top_company['selected_students']} students."
            )
        })

    branch_statistics = get_branch_statistics(year)
    if branch_statistics:
        best_branch = max(
            branch_statistics,
            key=lambda branch: branch["placement_percentage"]
        )
        insights.append({
            "type": "success",
            "icon": "school",
            "title": "Highest Placement Rate",
            "message": (
                f"{best_branch['branch']} achieved "
                f"{best_branch['placement_percentage']}% placement."
            )
        })

    package_statistics = get_package_statistics(year)
    insights.append({
        "type": "info",
        "icon": "payments",
        "title": "Highest Package",
        "message": (
            f"Highest package offered is "
            f"{package_statistics['highest_package']['display']}."
        )
    })

    active_drives = PlacementDrive.query.filter_by(status="approved").count()
    insights.append({
        "type": "info",
        "icon": "work",
        "title": "Active Placement Drives",
        "message": (
            f"There are currently "
            f"{active_drives} active placement drives."
        )
    })

    pending_companies = Company.query.filter_by(approval_status="pending").count()
    if pending_companies:
        insights.append({
            "type": "warning",
            "icon": "pending",
            "title": "Pending Company Approvals",
            "message": (
                f"{pending_companies} companies are awaiting approval."
            )
        })

    withdrawn = Application.query.filter_by(status="withdrawn").count()
    if withdrawn:
        insights.append({
            "type": "warning",
            "icon": "person_off",
            "title": "Withdrawn Applications",
            "message": (
                f"{withdrawn} applications have been withdrawn by students."
            )
        })

    summary = get_admin_summary()
    insights.append({
        "type": "success",
        "icon": "analytics",
        "title": "Overall Placement Rate",
        "message": (
            f"Current placement rate is "
            f"{summary['placement_rate']}%."
        )
    })

    return insights
    

# ======== Company analytics ========

def get_company_dashboard(company_id):

    drives = PlacementDrive.query.filter_by(company_id=company_id).all()

    drive_ids = [drive.id for drive in drives]

    total_applications = 0
    shortlisted = 0
    selected = 0
    offers_generated = 0
    offers_sent = 0

    for drive_id in drive_ids:

        total_applications += Application.query.filter_by(drive_id=drive_id).count()

        shortlisted += Application.query.filter_by(
            drive_id=drive_id,
            status="shortlisted"
        ).count()

        selected += Application.query.filter_by(
            drive_id=drive_id,
            status="selected"
        ).count()

    recruitments = RecruitmentProcess.query.join(Application).filter(
        Application.drive_id.in_(drive_ids)
    ).all()

    for recruitment in recruitments:
        if recruitment.offer_letter_generated:
            offers_generated += 1
        if recruitment.offer_letter_sent:
            offers_sent += 1

    applications = Application.query.filter(
        Application.drive_id.in_(drive_ids)
    ).all()

    recruitment_started = 0
    selected = 0
    offer_generated = 0
    offer_sent = 0

    for application in applications:

        if application.recruitment_process:
            recruitment = application.recruitment_process
            if recruitment.recruitment_status in ["in_progress", "completed"]:
                recruitment_started += 1
            if recruitment.offer_letter_generated:
                offer_generated += 1
            if recruitment.offer_letter_sent:
                offer_sent += 1
        if application.status == "selected":
            selected += 1

    drive_performance = []

    for drive in drives:

        drive_applications = [app for app in applications if app.drive_id == drive.id]
        shortlisted_count = sum(1 for app in drive_applications if app.status == "shortlisted")
        selected_count = sum(1 for app in drive_applications if app.status == "selected")
        rejected_count = sum(1 for app in drive_applications if app.status == "rejected")
        withdrawn_count = sum(1 for app in drive_applications if app.status == "withdrawn")

    success_rate = 0
    if drive_applications:
        success_rate = round((selected_count / len(drive_applications)) * 100,2)


    branch_distribution = {}
    for application in applications:
        branch = application.student.branch
        if branch not in branch_distribution:
            branch_distribution[branch] = 0
        branch_distribution[branch] += 1

    branch_data = []
    for branch, count in branch_distribution.items():
        branch_data.append({"branch": branch,"applications": count})


    drive_performance.append({
        "drive_id": drive.id,
        "title": drive.title,
        "job_type": drive.job_type,
        "location": drive.location,
        "applications": len(drive_applications),
        "shortlisted": shortlisted_count,
        "selected": selected_count,
        "rejected": rejected_count,
        "withdrawn": withdrawn_count,
        "success_rate": success_rate,
        "status": drive.status
    })

    skill_distribution = {}

    for application in applications:
        student = application.student

        if not student.skills:
            continue

        skills = [
            skill.strip()
            for skill in student.skills.split(",")
            if skill.strip()
        ]

        for skill in skills:
            skill_distribution[skill] = (
                skill_distribution.get(skill, 0) + 1
            )

        skill_data = []

        for skill, count in skill_distribution.items():
            skill_data.append({"skill": skill,"count": count})

        skill_data.sort(key=lambda skill: skill["count"],reverse=True)

        company = Company.query.filter_by(company_id=company_id).first()

        recent_activity = (
            ActivityLog.query.filter_by(
                user_id=company.user_id
            )
            .order_by(ActivityLog.created_at.desc())
            .limit(10)
            .all()
        )

        recent_activity = [activity.to_dict() for activity in recent_activity]


        company_insights = []

        if drives:
            company_insights.append({
                "type": "info",
                "icon": "work",
                "title": "Active Drives",
                "message": (f"You currently have {len(drives)} active placement drives.")
            })

        if selected > 0:
            company_insights.append({
                "type": "success",
                "icon": "emoji_events",
                "title": "Selections",
                "message": (f"You have selected {selected} students.")
            })

        if skill_data:
            top_skill = skill_data[0]
            company_insights.append({
                "type": "success",
                "icon": "psychology",
                "title": "Most Common Skill",
                "message": (
                    f"{top_skill['skill']} appears in "
                    f"{top_skill['count']} applications."
                )
            })

        if drive_performance:
            top_drive = max(
                drive_performance,
                key=lambda drive: drive["applications"]
            )
            company_insights.append({
                "type": "info",
                "icon": "trending_up",
                "title": "Most Popular Drive",
                "message": (
                    f"{top_drive['title']} received "
                    f"{top_drive['applications']} applications."
                )
            })

        if offers_sent > 0:
            company_insights.append({
                "type": "success",
                "icon": "mail",
                "title": "Offer Letters",
                "message": (f"{offers_sent} offer letters have been sent.")
            })




    return {
        "summary": {
            "active_drives": len(drives),
            "applications": total_applications,
            "shortlisted": shortlisted,
            "selected": selected,
            "offers_generated": offers_generated,
            "offers_sent": offers_sent
        },
        "recruitment_funnel": {
            "applications": len(applications),
            "shortlisted": shortlisted,
            "recruitment_started": recruitment_started,
            "selected": selected,
            "offer_generated": offer_generated,
            "offer_sent": offer_sent
        },
        "drive_performance": drive_performance,
        "branch_distribution": branch_data,
        "skill_analytics": skill_data,
        "recent_activity": recent_activity,
        "insights": company_insights
        
    }


# ======== Student analytics ========

def get_student_dashboard(student_id):

    student = Student.query.get(student_id)

    applications = Application.query.filter_by(student_id = student.id).all()

    today = date.today()

    open_drives = PlacementDrive.query.filter(
        PlacementDrive.status=="approved",
        PlacementDrive.last_date_to_apply >= today
    ).all()

    interviews = []

    for application in applications:
        recruitment = application.recruitment_process

        if not recruitment:
            continue
        for i in range(1,5):
            scheduled = getattr(recruitment,f"round{i}_scheduled_at")
            required = getattr(application.drive,f"round{i}_required")
            completed = getattr(recruitment,f"round{i}_completed")

            if required and scheduled and not completed:
                interviews.append({
                    "company": application.drive.company.company_name,
                    "drive": application.drive.title,
                    "round": i,
                    "round_name": getattr(application.drive,f"round{i}_name"),
                    "scheduled_at": scheduled
                })

    interviews.sort(key=lambda x: x["scheduled_at"])

    offers = sum(1 for app in applications if app.status=="selected")

    under_review = sum(1 for app in applications if app.status=="applied")

    progress = []

    for application in applications:
        recruitment = application.recruitment_process

        if not recruitment:
            continue

        required_rounds = 0
        completed_rounds = 0

        for i in range(1,5):
            if getattr(application.drive,f"round{i}_required"):
                required_rounds += 1

                if getattr(recruitment,f"round{i}_completed"):
                    completed_rounds += 1

        percentage = 0

        if required_rounds:
            percentage = round((completed_rounds/required_rounds)*100)

        progress.append({
            "company": application.drive.company.company_name,
            "title": application.drive.title,
            "current_round": recruitment.current_round,
            "percentage": percentage
        })

    calendar = []

    for interview in interviews[:5]:
        calendar.append({
            "company": interview["company"],
            "title": interview["drive"],
            "round": interview["round_name"],
            "scheduled_at": interview["scheduled_at"]
        })


    return{
        "profile":{
            "name":student.full_name,
            "email":student.user.email,
            "profile_completion":calculate_profile_completion(student)
        },
        "summary":{
            "open_drives":len(open_drives),
            "new_drives_today":len([d for d in open_drives if d.created_at.date()==today]),
            "applications":len(applications),
            "under_review":under_review,
            "interviews":len(interviews),
            "offers":offers
        },
        "calendar":calendar,
        "recruitment_progress":progress
        }  


def get_student_analytics(student_id):

    student = Student.query.get(student_id)

    applications = Application.query.filter_by(student_id=student.id).all()

    overview = {
        "applied":0,
        "shortlisted":0,
        "selected":0,
        "rejected":0,
        "withdrawn":0
    }

    for application in applications:
        if application.status in overview:
            overview[application.status] += 1

    months = {"Jan":0,"Feb":0,"Mar":0,"Apr":0,"May":0,"Jun":0,"Jul":0,
              "Aug":0,"Sep":0,"Oct":0,"Nov":0,"Dec":0}

    for application in applications:
        month = application.applied_at.strftime("%b")
        months[month] += 1

    funnel = {
        "applications":len(applications),
        "shortlisted":0,
        "interviews":0,
        "selected":0
    }   

    for application in applications:
        if application.status=="shortlisted":
            funnel["shortlisted"]+=1

        if application.status=="selected":
            funnel["selected"]+=1

        recruitment = application.recruitment_process
        if recruitment and recruitment.recruitment_status in ["in_progress","completed"]:
            funnel["interviews"]+=1 

    skill_match = []

    for application in applications:
        drive=application.drive

        if not drive.required_skills:
            continue

        student_skills=set(
            s.strip().lower()
            for s in student.skills.split(",")
        )

        required=set(
            s.strip().lower()
            for s in drive.required_skills.split(",")
        )

        matched=len(student_skills & required)

        percentage=0

        if required:
            percentage=round(matched/len(required)*100)

        skill_match.append({
            "company":drive.company.company_name,
            "drive":drive.title,
            "match_percentage":percentage
        })

    activities = (ActivityLog.query.filter_by(user_id=student.user_id)
                .order_by(ActivityLog.created_at.desc()).limit(10).all())

    insights = []

    insights.append({
        "type":"info",
        "title":"Applications",
        "message":f"You have applied to {len(applications)} placement drives."
        })

    if overview["selected"]:
        insights.append({
            "type":"success",
            "title":"Congratulations",
            "message":f"You have received {overview['selected']} offer(s)."
            })

    if overview["shortlisted"]:

        insights.append({
            "type":"success",
            "title":"Shortlisted",
            "message":f"You are shortlisted for {overview['shortlisted']} drive(s)."
            })

    if calculate_profile_completion(student)<100:

        insights.append({
            "type":"warning",
            "title":"Complete Profile",
            "message":"Complete your profile to improve job recommendations."
            })

    best=max(skill_match,key=lambda x:x["match_percentage"],default=None)

    if best:
        insights.append({
            "type":"success",
            "title":"Best Skill Match",
            "message":f"{best['company']} matches your profile by {best['match_percentage']}%."
            })

    return {
        "application_overview":overview,
        "monthly_trend":months,
        "recruitment_funnel":funnel,
        "skill_match":skill_match,
        "recent_activity":[activity.to_dict() for activity in activities],
        "insights":insights
    }

    
