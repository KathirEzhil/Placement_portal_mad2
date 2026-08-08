const AdminAnalytics = {

    data(){

        return{

            loading:true,

            selectedYear:new Date().getFullYear(),

            summary:{},

            funnel:{},

            monthlyTrends:{},

            branchStatistics:[],

            packageStatistics:{},

            companyRankings:[],

            drivePerformance:[],

            recentActivities:[],

            insights:[],

            monthlyChart:null,

            branchChart:null,
            
            packageChart:null,

            funnelChart:null

        };

    },


    async mounted(){

        await this.loadAnalytics();

    },


    beforeUnmount(){

        if(this.monthlyChart){

            this.monthlyChart.destroy();

        }

        if(this.branchChart){

            this.branchChart.destroy();

        }

        if(this.packageChart){

            this.packageChart.destroy();

        }

        if(this.funnelChart){

            this.funnelChart.destroy();

        }

    },


    methods:{

        async loadAnalytics(){

    this.loading = true;

    try{

        const [

            summaryResult,

            funnelResult,

            monthlyResult,

            branchResult,

            packageResult,

            companyResult,

            driveResult,

            activityResult,

            insightResult

        ] = await Promise.all([

            analyticsService.getAdminSummary(),

            analyticsService.getRecruitmentFunnel(),

            analyticsService.getMonthlyTrends(
                this.selectedYear
            ),

            analyticsService.getBranchStatistics(
                this.selectedYear
            ),

            analyticsService.getPackageStatistics(
                this.selectedYear
            ),

            analyticsService.getCompanyRankings(),

            analyticsService.getDrivePerformance(
                this.selectedYear
            ),

            analyticsService.getRecentActivities(10),

            analyticsService.getInsights(
                this.selectedYear
            )

        ]);


        if(summaryResult.success){

            this.summary =
                summaryResult.summary || {};

        }


        if(funnelResult.success){

            this.funnel =
                funnelResult.funnel || {};

        }


        if(monthlyResult.success){

            this.monthlyTrends =
                monthlyResult.monthly_trends || {};

        }


        if(branchResult.success){

            this.branchStatistics =
                branchResult.branch_statistics || [];

        }


        if(packageResult.success){

            this.packageStatistics =
                packageResult.package_statistics || {};

        }


        if(companyResult.success){

            this.companyRankings =
                companyResult.company_rankings || [];

        }


        if(driveResult.success){

            this.drivePerformance =
                driveResult.drive_performance || [];

        }


        if(activityResult.success){

            this.recentActivities =
                activityResult.activities || [];

        }


        if(insightResult.success){

            this.insights =
                insightResult.insights || [];

        }

    }

    catch(error){

        console.error(
            "Analytics loading error:",
            error
        );

    }

    finally{

        /*
         * First hide the loading screen.
         * This causes Vue to render the canvas elements.
         */

        this.loading = false;


        /*
         * Wait until Vue has actually rendered
         * the canvas elements.
         */

        await this.$nextTick();


        /*
         * Now the canvases exist, so Chart.js
         * can safely create the charts.
         */

        this.createCharts();

    }

},


        createCharts(){

            this.createMonthlyChart();

            this.createBranchChart();

            this.createPackageChart();

            this.createFunnelChart();

        },


        createMonthlyChart(){

            const canvas =
                document.getElementById(
                    "monthlyTrendsChart"
                );

            if(!canvas){

                return;

            }


            if(this.monthlyChart){

                this.monthlyChart.destroy();

            }


            const months =
                Object.keys(
                    this.monthlyTrends
                );


            const applications =
                months.map(
                    month =>
                        this.monthlyTrends[
                            month
                        ].applications || 0
                );


            const drives =
                months.map(
                    month =>
                        this.monthlyTrends[
                            month
                        ].drives || 0
                );


            const selections =
                months.map(
                    month =>
                        this.monthlyTrends[
                            month
                        ].selections || 0
                );


            this.monthlyChart =
                new Chart(canvas,{

                    type:"line",

                    data:{

                        labels:months,

                        datasets:[

                            {
                                label:"Applications",
                                data:applications,
                                tension:0.3
                            },

                            {
                                label:"Placement Drives",
                                data:drives,
                                tension:0.3
                            },

                            {
                                label:"Selections",
                                data:selections,
                                tension:0.3
                            }

                        ]

                    },

                    options:{

                        responsive:true,

                        maintainAspectRatio:false,

                        plugins:{

                            legend:{
                                position:"bottom"
                            }

                        },

                        scales:{

                            y:{

                                beginAtZero:true,

                                ticks:{
                                    precision:0
                                }

                            }

                        }

                    }

                });

        },


        createBranchChart(){

            const canvas =
                document.getElementById(
                    "branchStatisticsChart"
                );

            if(!canvas){

                return;

            }


            if(this.branchChart){

                this.branchChart.destroy();

            }


            this.branchChart =
                new Chart(canvas,{

                    type:"bar",

                    data:{

                        labels:
                            this.branchStatistics.map(
                                item => item.branch
                            ),

                        datasets:[

                            {
                                label:"Students",

                                data:
                                    this.branchStatistics.map(
                                        item =>
                                            item.students
                                    )
                            },

                            {
                                label:"Selected",

                                data:
                                    this.branchStatistics.map(
                                        item =>
                                            item.selected
                                    )
                            }

                        ]

                    },

                    options:{

                        responsive:true,

                        maintainAspectRatio:false,

                        plugins:{

                            legend:{
                                position:"bottom"
                            }

                        },

                        scales:{

                            y:{

                                beginAtZero:true,

                                ticks:{
                                    precision:0
                                }

                            }

                        }

                    }

                });

        },


        createPackageChart(){

            const canvas =
                document.getElementById(
                    "packageStatisticsChart"
                );

            if(!canvas){

                return;

            }


            if(this.packageChart){

                this.packageChart.destroy();

            }


            this.packageChart =
                new Chart(canvas,{

                    type:"doughnut",

                    data:{

                        labels:[

                            "Internship",

                            "Full-Time",

                            "Full-Time + Internship"

                        ],

                        datasets:[

                            {

                                data:[

                                    this.packageStatistics
                                        .internship_drives || 0,

                                    this.packageStatistics
                                        .full_time_drives || 0,

                                    this.packageStatistics
                                        .intern_and_ft_drives || 0

                                ]

                            }

                        ]

                    },

                    options:{

                        responsive:true,

                        maintainAspectRatio:false,

                        plugins:{

                            legend:{
                                position:"bottom"
                            }

                        }

                    }

                });

        },


        createFunnelChart(){

            const canvas =
                document.getElementById(
                    "recruitmentFunnelChart"
                );

            if(!canvas){

                return;

            }


            if(this.funnelChart){

                this.funnelChart.destroy();

            }


            this.funnelChart =
                new Chart(canvas,{

                    type:"bar",

                    data:{

                        labels:[

                            "Applications",

                            "Shortlisted",

                            "Recruitment Started",

                            "Selected",

                            "Offer Generated",

                            "Offer Sent"

                        ],

                        datasets:[

                            {

                                label:"Candidates",

                                data:[

                                    this.funnel.applications || 0,

                                    this.funnel.shortlisted || 0,

                                    this.funnel.recruitment_started || 0,

                                    this.funnel.selected || 0,

                                    this.funnel.offer_generated || 0,

                                    this.funnel.offer_sent || 0

                                ]

                            }

                        ]

                    },

                    options:{

                        indexAxis:"y",

                        responsive:true,

                        maintainAspectRatio:false,

                        plugins:{

                            legend:{
                                display:false
                            }

                        },

                        scales:{

                            x:{

                                beginAtZero:true,

                                ticks:{
                                    precision:0
                                }

                            }

                        }

                    }

                });

        },


        formatDate(value){

            if(!value){

                return "-";

            }

            return new Date(value)
                .toLocaleDateString();

        },


        formatNumber(value){

            return Number(value || 0)
                .toLocaleString();

        }

    },


    template:`

    <div class="container-fluid py-3">

        <!-- Header -->

        <div class="d-flex
                    justify-content-between
                    align-items-center
                    mb-4">

            <div>

                <h2 class="fw-bold mb-1">

                    <i class="bi bi-bar-chart-line-fill me-2"></i>

                    Analytics Dashboard

                </h2>

                <p class="text-muted mb-0">

                    Placement and recruitment insights

                    for {{selectedYear}}

                </p>

            </div>


            <div>

                <select

                    class="form-select"

                    v-model="selectedYear"

                    @change="changeYear">

                    <option
                        :value="new Date().getFullYear()">

                        {{new Date().getFullYear()}}

                    </option>

                    <option
                        :value="new Date().getFullYear()-1">

                        {{new Date().getFullYear()-1}}

                    </option>

                    <option
                        :value="new Date().getFullYear()-2">

                        {{new Date().getFullYear()-2}}

                    </option>

                </select>

            </div>

        </div>


        <!-- Loading -->

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


        <template v-else>


            <!-- Summary Cards -->

            <div class="row g-3 mb-4">


                <div class="col-xl-3 col-md-6">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4
                                h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between">

                                <div>

                                    <p class="text-muted mb-1">
                                        Students
                                    </p>

                                    <h3 class="fw-bold mb-0">

                                        {{formatNumber(
                                            summary.total_students
                                        )}}

                                    </h3>

                                </div>

                                <i class="bi bi-people-fill
                                          fs-2
                                          text-primary">

                                </i>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-xl-3 col-md-6">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4
                                h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between">

                                <div>

                                    <p class="text-muted mb-1">
                                        Approved Companies
                                    </p>

                                    <h3 class="fw-bold mb-0">

                                        {{formatNumber(
                                            summary.approved_companies
                                        )}}

                                    </h3>

                                </div>

                                <i class="bi bi-building-check
                                          fs-2
                                          text-success">

                                </i>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-xl-3 col-md-6">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4
                                h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between">

                                <div>

                                    <p class="text-muted mb-1">
                                        Active Drives
                                    </p>

                                    <h3 class="fw-bold mb-0">

                                        {{formatNumber(
                                            summary.active_drives
                                        )}}

                                    </h3>

                                </div>

                                <i class="bi bi-briefcase-fill
                                          fs-2
                                          text-warning">

                                </i>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-xl-3 col-md-6">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4
                                h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between">

                                <div>

                                    <p class="text-muted mb-1">
                                        Applications
                                    </p>

                                    <h3 class="fw-bold mb-0">

                                        {{formatNumber(
                                            summary.total_applications
                                        )}}

                                    </h3>

                                </div>

                                <i class="bi bi-file-earmark-text-fill
                                          fs-2
                                          text-info">

                                </i>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- Placement Summary -->

            <div class="row g-3 mb-4">


                <div class="col-md-4">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4">

                        <div class="card-body text-center">

                            <i class="bi bi-trophy-fill
                                      fs-1
                                      text-warning">

                            </i>

                            <h6 class="text-muted mt-2">

                                Selected Students

                            </h6>

                            <h2 class="fw-bold">

                                {{formatNumber(
                                    summary.selected_students
                                )}}

                            </h2>

                        </div>

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4">

                        <div class="card-body text-center">

                            <i class="bi bi-graph-up-arrow
                                      fs-1
                                      text-success">

                            </i>

                            <h6 class="text-muted mt-2">

                                Placement Rate

                            </h6>

                            <h2 class="fw-bold">

                                {{summary.placement_rate || 0}}%

                            </h2>

                        </div>

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4">

                        <div class="card-body text-center">

                            <i class="bi bi-hourglass-split
                                      fs-1
                                      text-danger">

                            </i>

                            <h6 class="text-muted mt-2">

                                Pending Companies

                            </h6>

                            <h2 class="fw-bold">

                                {{formatNumber(
                                    summary.pending_companies
                                )}}

                            </h2>

                        </div>

                    </div>

                </div>


            </div>


            <!-- Recruitment Funnel -->

            <div class="card
                        border-0
                        shadow-sm
                        rounded-4
                        mb-4">

                <div class="card-body">

                    <h5 class="fw-bold mb-3">

                        <i class="bi bi-filter-square-fill me-2"></i>

                        Recruitment Funnel

                    </h5>

                    <div
                        style="height:300px">

                        <canvas
                            id="recruitmentFunnelChart">

                        </canvas>

                    </div>

                </div>

            </div>


            <!-- Monthly Trends -->

            <div class="card
                        border-0
                        shadow-sm
                        rounded-4
                        mb-4">

                <div class="card-body">

                    <h5 class="fw-bold mb-3">

                        <i class="bi bi-graph-up me-2"></i>

                        Monthly Placement Trends

                    </h5>

                    <div
                        style="height:350px">

                        <canvas
                            id="monthlyTrendsChart">

                        </canvas>

                    </div>

                </div>

            </div>


            <!-- Branch + Package -->

            <div class="row g-4 mb-4">


                <div class="col-lg-7">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4
                                h-100">

                        <div class="card-body">

                            <h5 class="fw-bold mb-3">

                                <i class="bi bi-mortarboard-fill me-2"></i>

                                Branch Statistics

                            </h5>

                            <div
                                style="height:330px">

                                <canvas
                                    id="branchStatisticsChart">

                                </canvas>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-lg-5">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4
                                h-100">

                        <div class="card-body">

                            <h5 class="fw-bold mb-3">

                                <i class="bi bi-pie-chart-fill me-2"></i>

                                Drive Distribution

                            </h5>

                            <div
                                style="height:330px">

                                <canvas
                                    id="packageStatisticsChart">

                                </canvas>

                            </div>

                        </div>

                    </div>

                </div>


            </div>


            <!-- Package Summary -->

            <div class="row g-3 mb-4">


                <div class="col-md-4">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4">

                        <div class="card-body">

                            <p class="text-muted mb-1">
                                Highest Package
                            </p>

                            <h3 class="fw-bold">

                                {{packageStatistics.highest_package || 0}}
                                
                            </h3>

                        </div>

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4">

                        <div class="card-body">

                            <p class="text-muted mb-1">
                                Average Package
                            </p>

                            <h3 class="fw-bold">

                                {{packageStatistics.average_package || 0}}

                            </h3>

                        </div>

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="card
                                border-0
                                shadow-sm
                                rounded-4">

                        <div class="card-body">

                            <p class="text-muted mb-1">
                                Median Package
                            </p>

                            <h3 class="fw-bold">

                                {{packageStatistics.median_package || 0}}

                            </h3>

                        </div>

                    </div>

                </div>


            </div>


            <!-- Company Rankings -->

            <div class="card
                        border-0
                        shadow-sm
                        rounded-4
                        mb-4">

                <div class="card-body">

                    <div class="d-flex
                                justify-content-between
                                align-items-center
                                mb-3">

                        <h5 class="fw-bold mb-0">

                            <i class="bi bi-trophy-fill me-2"></i>

                            Top Recruiting Companies

                        </h5>

                    </div>


                    <div class="table-responsive">

                        <table class="table align-middle">

                            <thead>

                                <tr>

                                    <th>Rank</th>

                                    <th>Company</th>

                                    <th>Drives</th>

                                    <th>Applications</th>

                                    <th>Selected</th>

                                    <th>Success Rate</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr
                                    v-for="company
                                    in companyRankings.slice(0,10)"
                                    :key="company.company_id">

                                    <td>

                                        <span
                                            class="badge bg-primary">

                                            #{{company.rank}}

                                        </span>

                                    </td>

                                    <td class="fw-semibold">

                                        {{company.company_name}}

                                    </td>

                                    <td>

                                        {{company.total_drives}}

                                    </td>

                                    <td>

                                        {{company.total_applications}}

                                    </td>

                                    <td>

                                        {{company.selected_students}}

                                    </td>

                                    <td>

                                        <span
                                            class="badge bg-success">

                                            {{company.success_rate}}%

                                        </span>

                                    </td>

                                </tr>

                                <tr
                                    v-if="companyRankings.length===0">

                                    <td
                                        colspan="6"
                                        class="text-center text-muted py-4">

                                        No company ranking data available.

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            <!-- Drive Performance -->

            <div class="card
                        border-0
                        shadow-sm
                        rounded-4
                        mb-4">

                <div class="card-body">

                    <h5 class="fw-bold mb-3">

                        <i class="bi bi-briefcase-fill me-2"></i>

                        Drive Performance

                    </h5>

                    <div class="table-responsive">

                        <table class="table align-middle">

                            <thead>

                                <tr>

                                    <th>Drive</th>

                                    <th>Company</th>

                                    <th>Applications</th>

                                    <th>Shortlisted</th>

                                    <th>Selected</th>

                                    <th>Success Rate</th>

                                    <th>Status</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr
                                    v-for="drive
                                    in drivePerformance.slice(0,10)"
                                    :key="drive.drive_id">

                                    <td class="fw-semibold">

                                        {{drive.title}}

                                    </td>

                                    <td>

                                        {{drive.company_name}}

                                    </td>

                                    <td>

                                        {{drive.applications}}

                                    </td>

                                    <td>

                                        {{drive.shortlisted}}

                                    </td>

                                    <td>

                                        {{drive.selected}}

                                    </td>

                                    <td>

                                        {{drive.success_rate}}%

                                    </td>

                                    <td>

                                        <span
                                            class="badge bg-success"
                                            v-if="drive.status==='approved'">

                                            Approved

                                        </span>

                                        <span
                                            class="badge bg-warning text-dark"
                                            v-else-if="drive.status==='pending'">

                                            Pending

                                        </span>

                                        <span
                                            class="badge bg-danger"
                                            v-else>

                                            {{drive.status}}

                                        </span>

                                    </td>

                                </tr>

                                <tr
                                    v-if="drivePerformance.length===0">

                                    <td
                                        colspan="7"
                                        class="text-center text-muted py-4">

                                        No drive performance data available.

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            <!-- Recent Activities -->

            <div class="card
                        border-0
                        shadow-sm
                        rounded-4
                        mb-4">

                <div class="card-body">

                    <h5 class="fw-bold mb-3">

                        <i class="bi bi-clock-history me-2"></i>

                        Recent Activities

                    </h5>


                    <div
                        v-if="recentActivities.length===0"
                        class="text-muted">

                        No recent activities.

                    </div>


                    <div
                        v-for="activity
                        in recentActivities"
                        :key="activity.id"
                        class="d-flex
                               align-items-start
                               gap-3
                               border-bottom
                               py-3">

                        <div>

                            <i class="bi bi-activity
                                      fs-4
                                      text-primary">

                            </i>

                        </div>

                        <div class="flex-grow-1">

                            <div class="fw-semibold">

                                {{activity.action || activity.title}}

                            </div>

                            <div class="text-muted small">

                                {{activity.description || activity.message}}

                            </div>

                        </div>

                        <small class="text-muted">

                            {{formatDate(activity.created_at)}}

                        </small>

                    </div>

                </div>

            </div>


            <!-- Insights -->

            <div class="card
                        border-0
                        shadow-sm
                        rounded-4
                        mb-4">

                <div class="card-body">

                    <h5 class="fw-bold mb-3">

                        <i class="bi bi-lightbulb-fill me-2"></i>

                        Admin Insights

                    </h5>


                    <div class="row g-3">

                        <div
                            class="col-lg-6"
                            v-for="insight in insights"
                            :key="insight.title">

                            <div
                                class="alert mb-0 h-100"
                                :class="{

                                    'alert-success':
                                        insight.type==='success',

                                    'alert-info':
                                        insight.type==='info',

                                    'alert-warning':
                                        insight.type==='warning',

                                    'alert-danger':
                                        insight.type==='danger'

                                }">

                                <div class="d-flex gap-3">

                                    <i
                                        class="bi fs-4"
                                        :class="{

                                            'bi-check-circle-fill':
                                                insight.type==='success',

                                            'bi-info-circle-fill':
                                                insight.type==='info',

                                            'bi-exclamation-triangle-fill':
                                                insight.type==='warning',

                                            'bi-x-circle-fill':
                                                insight.type==='danger'

                                        }">

                                    </i>

                                    <div>

                                        <div class="fw-bold">

                                            {{insight.title}}

                                        </div>

                                        <div>

                                            {{insight.message}}

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


        </template>

    </div>

    `

};