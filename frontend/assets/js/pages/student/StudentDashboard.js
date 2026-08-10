const StudentDashboard = {

    props: ["currentUser"],

    emits: ["view-all"],


    data() {

        return {

            dashboard: null,

            loading: true,

            error: null

        };

    },


    computed: {

        studentName() {

            if (
                this.dashboard &&
                this.dashboard.profile &&
                this.dashboard.profile.profile_completion === 100
            ) {

                return this.dashboard.profile.name;

            }

            return null;

        },


        summary() {

            return this.dashboard
                ? this.dashboard.summary
                : {
                    open_drives: 0,
                    new_drives_today: 0,
                    applications: 0,
                    under_review: 0,
                    interviews: 0,
                    offers: 0
                };

        },


        calendarEvents() {

            if (
                !this.dashboard ||
                !this.dashboard.calendar
            ) {

                return [];

            }

            return this.dashboard.calendar.map(
                event => {

                    const scheduledDate =
                        new Date(event.scheduled_at);

                    const today =
                        new Date();

                    today.setHours(0, 0, 0, 0);

                    scheduledDate.setHours(
                        0,
                        0,
                        0,
                        0
                    );

                    const difference =
                        Math.ceil(
                            (
                                scheduledDate -
                                today
                            ) /
                            (1000 * 60 * 60 * 24)
                        );


                    let deadline;

                    let badge;


                    if (difference <= 0) {

                        deadline = "Today";

                        badge = "danger";

                    }

                    else if (difference === 1) {

                        deadline = "Tomorrow";

                        badge = "danger";

                    }

                    else {

                        deadline =
                            `${difference} Days`;

                        badge = "warning";

                    }


                    return {

                        company: event.company,

                        role:
                            event.round ||
                            event.title,

                        deadline: deadline,

                        badge: badge

                    };

                }
            );

        },


        recruitmentProcesses() {

            if (
                !this.dashboard ||
                !this.dashboard.recruitment_progress
            ) {

                return [];

            }

            return this.dashboard.recruitment_progress.map(
                process => {

                    return {

                        id:
                            `${process.company}-${process.title}`,

                        company:
                            process.company,

                        stage:
                            process.current_round > 0
                                ? `Round ${process.current_round}`
                                : "Recruitment Started",

                        progress:
                            process.percentage

                    };

                }
            );

        }

    },


    mounted() {

        this.fetchDashboard();

    },


    methods: {

        async fetchDashboard() {

            this.loading = true;

            this.error = null;

            try {

                const response = await fetch(
                    "/analytics/student/dashboard",
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to load dashboard."
                    );

                }


                this.dashboard =
                    result.dashboard;


                console.log(
                    "Student Dashboard Data:",
                    this.dashboard
                );

            }

            catch (error) {

                console.error(
                    "Student dashboard error:",
                    error
                );

                this.error =
                    "Unable to load dashboard data.";

            }

            finally {

                this.loading = false;

            }

        },


        navigateToDrives() {

            this.$root.currentPage =
                "drives";

        },

        viewCalendar() {

            this.$root.currentPage = "applications";

        },

        viewRecruitment() {

            this.$root.currentPage = "applications";

        }

    },


    template: `

    <div>

        <!-- Loading -->

        <div
            v-if="loading"
            class="text-center py-5">

            <div
                class="spinner-border"
                role="status">
            </div>

            <p class="text-muted mt-3">
                Loading dashboard...
            </p>

        </div>


        <!-- Error -->

        <div
            v-else-if="error"
            class="alert alert-danger">

            {{ error }}

        </div>


        <!-- Dashboard -->

        <div v-else>


            <!-- Hero -->

            <dashboard-hero

                title="Welcome Back"

                subtitle="Every application brings you one step closer to your dream career."

                button-text="Explore Drives"

                button-icon="bi bi-search"

                :current-user="currentUser"

                :student-name="studentName"

                @action="navigateToDrives">

            </dashboard-hero>


            <!-- Stats -->

            <div class="row g-4 mt-1">


                <div class="col-lg-3 col-md-6">

                    <stat-card

                        title="Open Drives"

                        :value="summary.open_drives"

                        :subtitle="
                            '+' +
                            summary.new_drives_today +
                            ' New Today'
                        "

                        icon="bi bi-briefcase-fill"

                        color="bg-primary">

                    </stat-card>

                </div>


                <div class="col-lg-3 col-md-6">

                    <stat-card

                        title="Applications"

                        :value="summary.applications"

                        :subtitle="
                            summary.under_review +
                            ' Under Review'
                        "

                        icon="bi bi-send-fill"

                        color="bg-success">

                    </stat-card>

                </div>


                <div class="col-lg-3 col-md-6">

                    <stat-card

                        title="Interviews"

                        :value="summary.interviews"

                        subtitle="Upcoming Interviews"

                        icon="bi bi-person-video3"

                        color="bg-warning">

                    </stat-card>

                </div>


                <div class="col-lg-3 col-md-6">

                    <stat-card

                        title="Offers"

                        :value="summary.offers"

                        :subtitle="
                            summary.offers > 0
                                ? 'Congratulations!'
                                : 'No offers yet'
                        "

                        icon="bi bi-award-fill"

                        color="bg-danger">

                    </stat-card>

                </div>

            </div>


            <!-- Calendar + Recruitment -->

            <div class="row mt-3 g-4">


                <div class="col-lg-6">

                    <placement-calendar
                        :events="calendarEvents"
                        @view-all="viewCalendar">
                    </placement-calendar>

                </div>


                <div class="col-lg-6">

                    <recruitment-progress
                        :processes="recruitmentProcesses"
                        @view-all="viewRecruitment">
                    </recruitment-progress>

                </div>


            </div>


        </div>

    </div>

    `

};