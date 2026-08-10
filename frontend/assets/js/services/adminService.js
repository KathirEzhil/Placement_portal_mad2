const adminService = {

    // ==========================
    // Pending Companies
    // ==========================

    async getPendingCompanies() {

        const response = await fetch("/admin/pending-companies", {
            credentials: "include"
        });

        return await response.json();

    },

    async getCompany(companyId) {

        const response = await fetch(
            `/admin/company/${companyId}`,
            {
                credentials: "include"
            }
        );

        return await response.json();

    },

    async approveCompany(companyId) {

        const response = await fetch(
            `/admin/company/${companyId}/approve`,
            {
                method: "PUT",
                credentials: "include"
            }
        );

        return await response.json();

    },

    async getAllCompanies() {

        const response = await fetch(
            "/admin/companies",
            {
                method: "GET",
                credentials: "include"
            }
        );

        return await response.json();

    },


    async updateCompanyStatus(
        companyId,
        isActive
    ) {

        const response = await fetch(
            `/admin/company/${companyId}/status`,
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

    async rejectCompany(companyId, reason) {

        const response = await fetch(
            `/admin/company/${companyId}/reject`,
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reason
                })
            }
        );

        return await response.json();

    },



    // ==========================
    // Pending Drives
    // ==========================

    async getPendingDrives() {

        const response = await fetch(
            "/admin/pending-drives",
            {
                credentials: "include"
            }
        );

        return await response.json();

    },

    async getDrive(driveId) {

        const response = await fetch(
            `/admin/drive/${driveId}`,
            {
                credentials: "include"
            }
        );

        return await response.json();

    },

    async approveDrive(driveId) {

        const response = await fetch(
            `/admin/drive/${driveId}/approve`,
            {
                method: "PUT",
                credentials: "include"
            }
        );

        return await response.json();

    },

    async rejectDrive(driveId, reason) {

        const response = await fetch(
            `/admin/drive/${driveId}/reject`,
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reason
                })
            }
        );

        return await response.json();

    },



    // ==========================
    // Background Jobs
    // ==========================

    async runDailyReminder() {

        const response = await fetch(
            "/admin/jobs/daily-reminder",
            {
                method: "POST",
                credentials: "include"
            }
        );

        return await response.json();

    },

    async runMonthlyReport() {

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