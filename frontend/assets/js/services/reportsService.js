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

    },

    async runDailyReminders(){

        const response = await fetch(
            "/admin/jobs/daily-reminder",
            {
                method: "POST",
                credentials: "include"
            }
        );

        return await response.json();

    }

};