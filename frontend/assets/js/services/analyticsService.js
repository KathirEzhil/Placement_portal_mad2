const analyticsService = {

    async getAdminSummary(year){

        const response = await fetch(
            "/analytics/admin/dashboard?year=${year}",
            {
                method:"GET",
                credentials:"include"
            }
        );

        return await response.json();

    },


    async getRecruitmentFunnel(year){

        const response = await fetch(
             `/analytics/admin/recruitment-funnel?year=${year}`,
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


    async getCompanyRankings(year){

        const response = await fetch(
            `/analytics/admin/company-rankings?year=${year}`,
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