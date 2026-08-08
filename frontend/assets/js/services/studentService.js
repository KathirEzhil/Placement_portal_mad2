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

    }

};