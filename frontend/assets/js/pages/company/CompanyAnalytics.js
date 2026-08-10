const CompanyAnalytics = {

    data() {

        return {

            loading: true,

            dashboard: {

                summary: {
                    active_drives: 0,
                    applications: 0,
                    shortlisted: 0,
                    selected: 0,
                    offers_generated: 0,
                    offers_sent: 0
                },

                recruitment_funnel: {
                    applications: 0,
                    shortlisted: 0,
                    recruitment_started: 0,
                    selected: 0,
                    offer_generated: 0,
                    offer_sent: 0
                },

                drive_performance: [],

                branch_distribution: [],

                skill_analytics: [],

                recent_activity: [],

                insights: []

            }

        };

    },

    async created() {

        await this.loadAnalytics();

    },

    methods: {

        async loadAnalytics() {

            this.loading = true;

            try {

                const response = await fetch(
                    "/analytics/company/dashboard",
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                const result =
                    await response.json();

                if (!result.success) {

                    alert(
                        result.message ||
                        "Failed to load analytics."
                    );

                    return;
                }

                this.dashboard =
                    result.dashboard;

            }

            catch (error) {

                console.error(
                    "Company analytics error:",
                    error
                );

                alert(
                    "Failed to load company analytics."
                );

            }

            finally {

                this.loading = false;

            }

        }

    },

    template: `

        <div class="container-fluid">

            <!-- HEADER -->

            <div class="d-flex
                        justify-content-between
                        align-items-center
                        mb-4">

                <div>

                    <h3 class="fw-bold mb-1">
                        Company Analytics
                    </h3>

                    <p class="text-muted mb-0">
                        Track your recruitment performance
                        and hiring progress.
                    </p>

                </div>

                <button
                    class="btn btn-outline-primary"
                    @click="loadAnalytics"
                    :disabled="loading">

                    <i class="bi bi-arrow-clockwise me-1"></i>

                    Refresh

                </button>

            </div>


            <!-- LOADING -->

            <div
                v-if="loading"
                class="text-center py-5">

                <div
                    class="spinner-border text-primary">
                </div>

                <p class="text-muted mt-3">
                    Loading analytics...
                </p>

            </div>


            <div v-else>


                <!-- SUMMARY CARDS -->

                <div class="row g-3 mb-4">


                    <div class="col-md-6 col-xl-3">

                        <div class="card border-0 shadow-sm h-100">

                            <div class="card-body">

                                <div class="d-flex
                                            justify-content-between
                                            align-items-center">

                                    <div>

                                        <p class="text-muted
                                                  mb-1">
                                            Active Drives
                                        </p>

                                        <h3 class="fw-bold mb-0">
                                            {{
                                                dashboard.summary
                                                .active_drives
                                            }}
                                        </h3>

                                    </div>

                                    <i class="bi bi-briefcase
                                              fs-1 text-primary">
                                    </i>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="col-md-6 col-xl-3">

                        <div class="card border-0 shadow-sm h-100">

                            <div class="card-body">

                                <div class="d-flex
                                            justify-content-between
                                            align-items-center">

                                    <div>

                                        <p class="text-muted mb-1">
                                            Applications
                                        </p>

                                        <h3 class="fw-bold mb-0">
                                            {{
                                                dashboard.summary
                                                .applications
                                            }}
                                        </h3>

                                    </div>

                                    <i class="bi bi-people
                                              fs-1 text-primary">
                                    </i>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="col-md-6 col-xl-3">

                        <div class="card border-0 shadow-sm h-100">

                            <div class="card-body">

                                <div class="d-flex
                                            justify-content-between
                                            align-items-center">

                                    <div>

                                        <p class="text-muted mb-1">
                                            Selected
                                        </p>

                                        <h3 class="fw-bold mb-0">
                                            {{
                                                dashboard.summary
                                                .selected
                                            }}
                                        </h3>

                                    </div>

                                    <i class="bi bi-trophy
                                              fs-1 text-primary">
                                    </i>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="col-md-6 col-xl-3">

                        <div class="card border-0 shadow-sm h-100">

                            <div class="card-body">

                                <div class="d-flex
                                            justify-content-between
                                            align-items-center">

                                    <div>

                                        <p class="text-muted mb-1">
                                            Offers Sent
                                        </p>

                                        <h3 class="fw-bold mb-0">
                                            {{
                                                dashboard.summary
                                                .offers_sent
                                            }}
                                        </h3>

                                    </div>

                                    <i class="bi bi-envelope-check
                                              fs-1 text-primary">
                                    </i>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- RECRUITMENT FUNNEL -->

                <div class="card border-0 shadow-sm mb-4">

                    <div class="card-body">

                        <h5 class="fw-bold mb-4">
                            Recruitment Funnel
                        </h5>

                        <div class="row g-3">


                            <div class="col-md-2">

                                <div class="text-center
                                            border rounded
                                            p-3 h-100">

                                    <h4 class="fw-bold">
                                        {{
                                            dashboard
                                            .recruitment_funnel
                                            .applications
                                        }}
                                    </h4>

                                    <small class="text-muted">
                                        Applications
                                    </small>

                                </div>

                            </div>


                            <div class="col-md-2">

                                <div class="text-center
                                            border rounded
                                            p-3 h-100">

                                    <h4 class="fw-bold">
                                        {{
                                            dashboard
                                            .recruitment_funnel
                                            .shortlisted
                                        }}
                                    </h4>

                                    <small class="text-muted">
                                        Shortlisted
                                    </small>

                                </div>

                            </div>


                            <div class="col-md-2">

                                <div class="text-center
                                            border rounded
                                            p-3 h-100">

                                    <h4 class="fw-bold">
                                        {{
                                            dashboard
                                            .recruitment_funnel
                                            .recruitment_started
                                        }}
                                    </h4>

                                    <small class="text-muted">
                                        Recruitment Started
                                    </small>

                                </div>

                            </div>


                            <div class="col-md-2">

                                <div class="text-center
                                            border rounded
                                            p-3 h-100">

                                    <h4 class="fw-bold">
                                        {{
                                            dashboard
                                            .recruitment_funnel
                                            .selected
                                        }}
                                    </h4>

                                    <small class="text-muted">
                                        Selected
                                    </small>

                                </div>

                            </div>


                            <div class="col-md-2">

                                <div class="text-center
                                            border rounded
                                            p-3 h-100">

                                    <h4 class="fw-bold">
                                        {{
                                            dashboard
                                            .recruitment_funnel
                                            .offer_generated
                                        }}
                                    </h4>

                                    <small class="text-muted">
                                        Offers Generated
                                    </small>

                                </div>

                            </div>


                            <div class="col-md-2">

                                <div class="text-center
                                            border rounded
                                            p-3 h-100">

                                    <h4 class="fw-bold">
                                        {{
                                            dashboard
                                            .recruitment_funnel
                                            .offer_sent
                                        }}
                                    </h4>

                                    <small class="text-muted">
                                        Offers Sent
                                    </small>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="row g-4">


                    <!-- DRIVE PERFORMANCE -->

                    <div class="col-lg-8">

                        <div class="card border-0 shadow-sm h-100">

                            <div class="card-body">

                                <h5 class="fw-bold mb-3">
                                    Drive Performance
                                </h5>

                                <div
                                    v-if="
                                        dashboard
                                        .drive_performance
                                        .length === 0
                                    "
                                    class="text-center
                                           text-muted
                                           py-4">

                                    No drive data available.

                                </div>

                                <div
                                    v-else
                                    class="table-responsive">

                                    <table
                                        class="table
                                               align-middle">

                                        <thead>

                                            <tr>

                                                <th>Drive</th>
                                                <th>Applications</th>
                                                <th>Shortlisted</th>
                                                <th>Selected</th>
                                                <th>Success Rate</th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            <tr
                                                v-for="
                                                    drive
                                                    in dashboard
                                                    .drive_performance
                                                "
                                                :key="
                                                    drive.drive_id
                                                ">

                                                <td>

                                                    <strong>
                                                        {{ drive.title }}
                                                    </strong>

                                                    <br>

                                                    <small
                                                        class="text-muted">

                                                        {{ drive.job_type }}

                                                    </small>

                                                </td>

                                                <td>
                                                    {{ drive.applications }}
                                                </td>

                                                <td>
                                                    {{ drive.shortlisted }}
                                                </td>

                                                <td>
                                                    {{ drive.selected }}
                                                </td>

                                                <td>

                                                    <span
                                                        class="badge
                                                               bg-primary">

                                                        {{
                                                            drive.success_rate
                                                        }}%

                                                    </span>

                                                </td>

                                            </tr>

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- BRANCH DISTRIBUTION -->

                    <div class="col-lg-4">

                        <div class="card border-0 shadow-sm h-100">

                            <div class="card-body">

                                <h5 class="fw-bold mb-3">
                                    Applicant Branches
                                </h5>

                                <div
                                    v-if="
                                        dashboard
                                        .branch_distribution
                                        .length === 0
                                    "
                                    class="text-muted text-center py-4">

                                    No branch data available.

                                </div>

                                <div v-else>

                                    <div
                                        v-for="
                                            branch
                                            in dashboard
                                            .branch_distribution
                                        "
                                        :key="
                                            branch.branch
                                        "
                                        class="d-flex
                                               justify-content-between
                                               border-bottom
                                               py-2">

                                        <span>
                                            {{ branch.branch }}
                                        </span>

                                        <strong>
                                            {{ branch.applications }}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- SKILLS + INSIGHTS -->

                <div class="row g-4 mt-1">


                    <!-- SKILLS -->

                    <div class="col-lg-6">

                        <div class="card border-0 shadow-sm h-100">

                            <div class="card-body">

                                <h5 class="fw-bold mb-3">
                                    Top Applicant Skills
                                </h5>

                                <div
                                    v-if="
                                        dashboard
                                        .skill_analytics
                                        .length === 0
                                    "
                                    class="text-muted text-center py-4">

                                    No skill data available.

                                </div>

                                <div v-else>

                                    <div
                                        v-for="
                                            skill
                                            in dashboard
                                            .skill_analytics
                                        "
                                        :key="
                                            skill.skill
                                        "
                                        class="mb-3">

                                        <div class="d-flex
                                                    justify-content-between">

                                            <span>
                                                {{ skill.skill }}
                                            </span>

                                            <strong>
                                                {{ skill.count }}
                                            </strong>

                                        </div>

                                        <div
                                            class="progress"
                                            style="height:6px;">

                                            <div
                                                class="progress-bar"
                                                :style="{
                                                    width:
                                                    (
                                                        skill.count /
                                                        dashboard.skill_analytics[0].count
                                                    ) * 100
                                                    + '%'
                                                }">
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- INSIGHTS -->

                    <div class="col-lg-6">

                        <div class="card border-0 shadow-sm h-100">

                            <div class="card-body">

                                <h5 class="fw-bold mb-3">
                                    Recruitment Insights
                                </h5>

                                <div
                                    v-if="
                                        dashboard.insights
                                        .length === 0
                                    "
                                    class="text-muted text-center py-4">

                                    No insights available.

                                </div>

                                <div
                                    v-for="
                                        insight
                                        in dashboard.insights
                                    "
                                    :key="
                                        insight.title
                                    "
                                    class="alert alert-light
                                           border mb-2">

                                    <strong>
                                        {{ insight.title }}
                                    </strong>

                                    <div class="small text-muted">
                                        {{ insight.message }}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- RECENT ACTIVITY -->

                <div class="card border-0 shadow-sm mt-4">

                    <div class="card-body">

                        <h5 class="fw-bold mb-3">
                            Recent Activity
                        </h5>

                        <div
                            v-if="
                                dashboard.recent_activity
                                .length === 0
                            "
                            class="text-muted text-center py-4">

                            No recent activity.

                        </div>

                        <div
                            v-for="
                                activity
                                in dashboard.recent_activity
                            "
                            :key="
                                activity.id
                            "
                            class="border-bottom py-2">

                            <div class="fw-semibold">
                                {{ activity.action }}
                            </div>

                            <small class="text-muted">
                                {{ activity.description }}
                            </small>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    `
};