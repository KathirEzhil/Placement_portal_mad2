const analyticsService = {

    async getAdminSummary(){

        const response = await fetch(
            "/analytics/admin/dashboard",
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },


    async getRecruitmentFunnel(){

        const response = await fetch(
            "/analytics/admin/recruitment-funnel",
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },


    async getMonthlyTrends(year){

        const response = await fetch(
            `/analytics/admin/monthly-trends?year=${year}`,
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },


    async getCompanyRankings(){

        const response = await fetch(
            "/analytics/admin/company-rankings",
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },


    async getBranchStatistics(year){

        const response = await fetch(
            `/analytics/admin/branch-analytics?year=${year}`,
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },


    async getPackageStatistics(year){

        const response = await fetch(
            `/analytics/admin/package-analytics?year=${year}`,
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },


    async getDrivePerformance(year){

        const response = await fetch(
            `/analytics/admin/drive-performance?year=${year}`,
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },


    async getRecentActivities(limit=20){

        const response = await fetch(
            `/analytics/admin/recent-activities?limit=${limit}`,
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },


    async getInsights(year){

        const response = await fetch(
            `/analytics/admin/insights?year=${year}`,
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    }

};