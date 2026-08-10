const StudentAnalytics = {

    data() {

        return {

            loading: true,

            analytics: null,

            error: null

        };

    },


    async mounted(){

        await this.fetchAnalytics();

    },


    methods: {

        async fetchAnalytics() {

            this.loading = true;

            this.error = null;

            try {

                const response = await fetch(
                    "/analytics/student/analytics",
                    {
                        credentials: "include"
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {

                    throw new Error(
                        result.message ||
                        "Unable to load analytics."
                    );

                }

                this.analytics = result.analytics;

                /*
                * Allow Vue to render the analytics section
                * and create the canvas elements.
                */
                this.loading = false;

                await this.$nextTick();

                this.renderStatusChart();

                this.renderMonthlyChart();

                this.renderFunnelChart();

            }

            catch (error) {

                console.error(
                    "Student analytics error:",
                    error
                );

                this.error =
                    "Unable to load your analytics.";

                this.loading = false;

            }

        },


        renderStatusChart(){

            if(!this.analytics) return;

            const overview =
                this.analytics.application_overview;

            const canvas =
                this.$refs.statusChart;

            if(!canvas) return;

            new Chart(canvas, {

                type: "doughnut",

                data: {

                    labels: [
                        "Applied",
                        "Shortlisted",
                        "Selected",
                        "Rejected",
                        "Withdrawn"
                    ],

                    datasets: [
                        {
                            data: [
                                overview.applied,
                                overview.shortlisted,
                                overview.selected,
                                overview.rejected,
                                overview.withdrawn
                            ]
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            position: "bottom"
                        }

                    }

                }

            });

        },


        renderMonthlyChart(){

            if(!this.analytics) return;

            const trend =
                this.analytics.monthly_trend;

            const canvas =
                this.$refs.monthlyChart;

            if(!canvas) return;

            const labels =
                Object.keys(trend);

            const values =
                Object.values(trend);

            new Chart(canvas, {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [
                        {
                            label: "Applications",
                            data: values
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    },

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            });

        },


        renderFunnelChart(){

            if(!this.analytics) return;

            const funnel =
                this.analytics.recruitment_funnel;

            const canvas =
                this.$refs.funnelChart;

            if(!canvas) return;

            new Chart(canvas, {

                type: "bar",

                data: {

                    labels: [
                        "Applications",
                        "Shortlisted",
                        "Interviews",
                        "Selected"
                    ],

                    datasets: [
                        {
                            label: "Students",

                            data: [
                                funnel.applications,
                                funnel.shortlisted,
                                funnel.interviews,
                                funnel.selected
                            ]
                        }
                    ]

                },

                options: {

                    indexAxis: "y",

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        x: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    },

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            });

        },

        getInsightClass(type) {

            if (type === "success") {
                return "alert-success";
            }

            if (type === "warning") {
                return "alert-warning";
            }

            return "alert-info";

        }

    },


    template: `

    <div>

        <!-- Header -->

        <div class="d-flex justify-content-between align-items-center mb-4">

            <div>

                <h2 class="fw-bold mb-1">
                    My Analytics
                </h2>

                <p class="text-muted mb-0">
                    Track your placement applications and recruitment progress.
                </p>

            </div>

        </div>


        <!-- Loading -->

        <div
            v-if="loading"
            class="text-center py-5">

            <div
                class="spinner-border"
                role="status">

            </div>

            <p class="text-muted mt-3">
                Loading analytics...
            </p>

        </div>


        <!-- Error -->

        <div
            v-else-if="error"
            class="alert alert-danger">

            {{ error }}

        </div>


        <!-- Analytics -->

        <div v-else-if="analytics">


            <!-- Summary Cards -->

            <div class="row g-4 mb-4">

                <div class="col-md-3">

                    <div class="card border-0 shadow-sm h-100">

                        <div class="card-body">

                            <small class="text-muted">
                                Applications
                            </small>

                            <h3 class="fw-bold mt-2 mb-0">

                                {{
                                    analytics.application_overview.applied
                                    +
                                    analytics.application_overview.shortlisted
                                    +
                                    analytics.application_overview.selected
                                    +
                                    analytics.application_overview.rejected
                                    +
                                    analytics.application_overview.withdrawn
                                }}

                            </h3>

                        </div>

                    </div>

                </div>


                <div class="col-md-3">

                    <div class="card border-0 shadow-sm h-100">

                        <div class="card-body">

                            <small class="text-muted">
                                Shortlisted
                            </small>

                            <h3 class="fw-bold mt-2 mb-0">

                                {{
                                    analytics.application_overview.shortlisted
                                }}

                            </h3>

                        </div>

                    </div>

                </div>


                <div class="col-md-3">

                    <div class="card border-0 shadow-sm h-100">

                        <div class="card-body">

                            <small class="text-muted">
                                Selected
                            </small>

                            <h3 class="fw-bold mt-2 mb-0">

                                {{
                                    analytics.application_overview.selected
                                }}

                            </h3>

                        </div>

                    </div>

                </div>


                <div class="col-md-3">

                    <div class="card border-0 shadow-sm h-100">

                        <div class="card-body">

                            <small class="text-muted">
                                Withdrawn
                            </small>

                            <h3 class="fw-bold mt-2 mb-0">

                                {{
                                    analytics.application_overview.withdrawn
                                }}

                            </h3>

                        </div>

                    </div>

                </div>

            </div>


            <!-- Charts -->

            <div class="row g-4 mb-4">


                <div class="col-lg-5">

                    <div class="card border-0 shadow-sm h-100">

                        <div class="card-body">

                            <h5 class="fw-bold mb-3">
                                Application Status
                            </h5>

                            <div
                                style="height:300px;">

                                <canvas
                                    ref="statusChart">
                                </canvas>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-lg-7">

                    <div class="card border-0 shadow-sm h-100">

                        <div class="card-body">

                            <h5 class="fw-bold mb-3">
                                Monthly Applications
                            </h5>

                            <div
                                style="height:300px;">

                                <canvas
                                    ref="monthlyChart">
                                </canvas>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- Recruitment Funnel -->

            <div class="row g-4 mb-4">

                <div class="col-lg-7">

                    <div class="card border-0 shadow-sm h-100">

                        <div class="card-body">

                            <h5 class="fw-bold mb-3">
                                Recruitment Funnel
                            </h5>

                            <div
                                style="height:280px;">

                                <canvas
                                    ref="funnelChart">
                                </canvas>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- Insights -->

                <div class="col-lg-5">

                    <div class="card border-0 shadow-sm h-100">

                        <div class="card-body">

                            <h5 class="fw-bold mb-3">
                                Insights
                            </h5>

                            <div
                                v-for="(insight, index) in analytics.insights"
                                :key="index"
                                class="alert mb-3"
                                :class="getInsightClass(insight.type)">

                                <strong>
                                    {{ insight.title }}
                                </strong>

                                <div class="small mt-1">
                                    {{ insight.message }}
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- Skill Match -->

            <div class="card border-0 shadow-sm mb-4">

                <div class="card-body">

                    <h5 class="fw-bold mb-4">
                        Skill Match
                    </h5>

                    <div
                        v-if="analytics.skill_match.length === 0"
                        class="text-muted">

                        No skill matching data available yet.

                    </div>


                    <div
                        v-for="match in analytics.skill_match"
                        :key="match.company + match.drive"
                        class="mb-4">

                        <div class="d-flex justify-content-between mb-1">

                            <div>

                                <strong>
                                    {{ match.drive }}
                                </strong>

                                <div class="small text-muted">

                                    {{ match.company }}

                                </div>

                            </div>

                            <span class="fw-semibold">

                                {{ match.match_percentage }}%

                            </span>

                        </div>


                        <div class="progress">

                            <div
                                class="progress-bar"
                                role="progressbar"
                                :style="{
                                    width: match.match_percentage + '%'
                                }">

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- Recent Activity -->

            <div class="card border-0 shadow-sm">

                <div class="card-body">

                    <h5 class="fw-bold mb-4">
                        Recent Activity
                    </h5>

                    <div
                        v-if="analytics.recent_activity.length === 0"
                        class="text-muted">

                        No recent activity.

                    </div>


                    <div
                        v-for="activity in analytics.recent_activity"
                        :key="activity.id"
                        class="d-flex justify-content-between align-items-center border-bottom py-3">

                        <div>

                            <strong>
                                {{ activity.action }}
                            </strong>

                            <div class="small text-muted">

                                {{ activity.description }}

                            </div>

                        </div>

                        <small class="text-muted">

                            {{ activity.created_at }}

                        </small>

                    </div>

                </div>

            </div>


        </div>

    </div>

    `

};