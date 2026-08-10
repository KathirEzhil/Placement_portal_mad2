const studentService = {

    async getStudents(){

        const response = await fetch(
            "/admin/students",
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },

    async updateStudentStatus(studentId, isActive) {

        const response = await fetch(
            `/admin/student/${studentId}/status`,
            {
                method: "PUT",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    is_active: isActive
                })
            }
        );

        return await response.json();

    },


    async getStudentDetails(studentId){

        const response = await fetch(
            `/admin/student/${studentId}`,
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },


    async getStudentApplications(studentId){

        const response = await fetch(
            `/admin/student/${studentId}/applications`,
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },

    async getStudentResume(studentId){

        return `/admin/student/${studentId}/resume`;

    },
    async getDrives(){

        const response = await fetch(
            "/student/drives",
            {
                method: "GET",
                credentials: "include"
            }
        );

        return await response.json();

    },


    async getDrive(driveId){

        const response = await fetch(
            `/student/drives/${driveId}`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        return await response.json();

    },


    async applyToDrive(driveId, coverLetter = ""){

        const response = await fetch(
            `/student/drives/${driveId}/apply`,
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    cover_letter: coverLetter
                })
            }
        );

        return await response.json();

    },

    async getApplications(){

        const response = await fetch(
            "/student/applications",
            {
                method: "GET",
                credentials: "include"
            }
        );

        return await response.json();

    },


    async getApplication(applicationId){

        const response = await fetch(
            `/student/applications/${applicationId}`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        return await response.json();

    },


    async withdrawApplication(applicationId){

        const response = await fetch(
            `/student/applications/${applicationId}/withdraw`,
            {
                method: "PUT",
                credentials: "include"
            }
        );

        return await response.json();

    },


    async getRecruitmentDetails(applicationId){

        const response = await fetch(
            `/student/applications/${applicationId}/recruitment`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        return await response.json();

    },


    getOfferLetterUrl(applicationId){

        return `/student/applications/${applicationId}/offer-letter`;

    }


};