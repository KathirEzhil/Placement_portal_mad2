def calculate_profile_completion(student):

    fields=[
        student.full_name,
        student.phone,
        student.branch,
        student.cgpa,
        student.skills,
        student.resume,
        student.linkedin_url,
        student.github_url,
        student.portfolio_url,
        student.permanent_address
        ]

    completed=sum(1 for field in fields if field)

    return round((completed/len(fields))*100)