const reportsService = {

    async generateMonthlyReport(){

        const response = await fetch(
            "/admin/jobs/monthly-report",
            {
                method: "POST",
                credentials: "include"
            }
        );

        return await response.json();

    }

};