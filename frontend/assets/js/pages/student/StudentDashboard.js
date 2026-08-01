const StudentDashboard = {

    props: ["currentUser"],

    methods: {

        navigateToDrives() {

            console.log("Navigate to drives")
        }

    },
    
    data() {
        return {
            placementCalendar: studentDashboardData.placementCalendar,
            recruitmentProgress: studentDashboardData.recruitmentProgress
        }
    },

    template: 
    `
        <dashboard-hero
            title="Welcome Back"
            subtitle="Every application brings you one step closer to your dream career."
            button-text="Explore Drives"
            button-icon="bi bi-search"
            :current-user="currentUser"
            @action="navigateToDrives">
        </dashboard-hero>

        <!-- Stats Cards -->

        <div class="row g-4 mt-1">
            <div class="col-lg-3 col-md-6">
                <stat-card
                    title="Open Drives"
                    value="18"
                    subtitle="+3 New Today"
                    icon="bi bi-briefcase-fill"
                    color="bg-primary">
                </stat-card>
            </div>
            <div class="col-lg-3 col-md-6">
                <stat-card
                    title="Applications"
                    value="7"
                    subtitle="2 Under Review"
                    icon="bi bi-send-fill"
                    color="bg-success">
                </stat-card>
            </div>
            <div class="col-lg-3 col-md-6">
                <stat-card
                    title="Interviews"
                    value="2"
                    subtitle="Next Tomorrow"
                    icon="bi bi-person-video3"
                    color="bg-warning">
                </stat-card>
            </div>
            <div class="col-lg-3 col-md-6">
                <stat-card
                    title="Offers"
                    value="1"
                    subtitle="Congratulations!"
                    icon="bi bi-award-fill"
                    color="bg-danger">
                </stat-card>
            </div>
        </div>


        <div class="row mt-3">
            <div class="col-lg-6">
                <placement-calendar
                    :events="placementCalendar">
                </placement-calendar>
            </div>

            <div class="col-lg-6">
                <recruitment-progress
                    :processes="recruitmentProgress">
                </recruitment-progress>
            </div>
        </div>


        <!-- Deadlines -->

        <!-- Recruitment Progress -->
    `

}
