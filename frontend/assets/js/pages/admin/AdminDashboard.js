const AdminDashboard = {

    data() {

        return {

            admin: {
                name: "Administrator"
            },

            stats: {

                total_students: 0,

                total_companies: 0,

                total_drives: 0,

                total_applications: 0,

                total_placements: 0,

                pending_companies: 0,

                pending_drives: 0,

                placement_rate: 0

            }

        };

    },


    emits: ["navigate"],


    mounted() {

        this.loadDashboard();

    },


    methods: {

        async loadDashboard() {

            try {

                const result =
                    await analyticsService.getAdminSummary();


                if (result.success) {

                    const summary =
                        result.summary || {};


                    this.stats = {

                        /*
                         * Live values from the database
                         */

                        total_students:
                            summary.total_students || 0,


                        total_companies:
                            summary.approved_companies || 0,


                        total_drives:
                            summary.active_drives || 0,


                        total_applications:
                            summary.total_applications || 0,


                        total_placements:
                            summary.selected_students || 0,


                        pending_companies:
                            summary.pending_companies || 0,


                        pending_drives:
                            summary.pending_drives || 0,


                        placement_rate:
                            summary.placement_rate || 0

                    };

                }

            }

            catch(error) {

                console.error(
                    "Admin dashboard loading error:",
                    error
                );

            }

        },


        navigate(page) {

            this.$root.currentPage = page;

        },


        openCompanyDetails(companyId) {

            this.$root.currentPage =
                "approve-companies";

            this.$root.selectedCompanyId =
                companyId;

        },


        approveCompany(companyId) {

            this.$root.currentPage =
                "approve-companies";

            this.$root.selectedCompanyId =
                companyId;

        },


        rejectCompany(companyId) {

            this.$root.currentPage =
                "approve-companies";

            this.$root.selectedCompanyId =
                companyId;

        },


        openDriveDetails() {

            this.$root.currentPage =
                "approve-drives";

        },


        approveDrive() {

            this.$root.currentPage =
                "approve-drives";

        },


        rejectDrive() {

            this.$root.currentPage =
                "approve-drives";

        }

    },


    template: `

    <div class="container-fluid py-4">


        <!-- Hero -->

        <admin-hero

            :admin="admin"

            @navigate="navigate">

        </admin-hero>



        <!-- Live Statistics -->

        <admin-stats

            :stats="stats">

        </admin-stats>



        <!-- Approval Queue -->

        <div class="row g-4 mb-4">


            <div class="col-lg-7">

                <quick-actions

                    @navigate="$emit('navigate', $event)">

                </quick-actions>

            </div>


            <div class="col-lg-5">

                <div class="card
                            border-0
                            shadow-sm
                            rounded-4
                            h-100">

                    <div class="card-body">


                        <div
                            class="d-flex
                                   justify-content-between
                                   align-items-center
                                   mb-4">

                            <div>

                                <h5 class="fw-bold mb-1">

                                    <i
                                        class="bi bi-clipboard2-check
                                               text-primary
                                               me-2">

                                    </i>

                                    Approval Queue

                                </h5>

                                <small class="text-muted">

                                    Review pending companies
                                    and placement drives

                                </small>

                            </div>


                            <span
                                class="badge
                                       bg-primary
                                       rounded-pill">

                                Live

                            </span>

                        </div>



                        <!-- Pending Companies -->

                        <div class="mb-4">

                            <pending-companies

                                @details="openCompanyDetails"

                                @approve="approveCompany"

                                @reject="rejectCompany">

                            </pending-companies>

                        </div>


                        <hr>


                        <!-- Pending Drives -->

                        <pending-drives

                            @details="openDriveDetails"

                            @approve="approveDrive"

                            @reject="rejectDrive">

                        </pending-drives>


                    </div>

                </div>

            </div>

        </div>



        <!-- Platform Analytics -->

        <div class="row g-4 mb-4">


            <div class="col-lg-8">

                <div
                    class="card
                           border-0
                           shadow-sm
                           rounded-4">

                    <div class="card-body">


                        <div
                            class="d-flex
                                   justify-content-between
                                   align-items-center">

                            <div>

                                <h5 class="fw-bold mb-1">

                                    <i
                                        class="bi bi-graph-up-arrow
                                               text-success
                                               me-2">

                                    </i>

                                    Platform Analytics

                                </h5>

                                <small class="text-muted">

                                    Live placement performance

                                </small>

                            </div>


                            <button

                                class="btn
                                       btn-outline-primary"

                                @click="navigate('analytics')">

                                <i
                                    class="bi bi-bar-chart-line
                                           me-1">

                                </i>

                                View Analytics

                            </button>

                        </div>


                        <hr>


                        <div class="row text-center">


                            <div class="col-md-4">

                                <h3 class="fw-bold">

                                    {{stats.total_applications}}

                                </h3>

                                <small class="text-muted">

                                    Applications

                                </small>

                            </div>


                            <div class="col-md-4">

                                <h3 class="fw-bold">

                                    {{stats.total_placements}}

                                </h3>

                                <small class="text-muted">

                                    Selected

                                </small>

                            </div>


                            <div class="col-md-4">

                                <h3 class="fw-bold">

                                    {{stats.placement_rate}}%

                                </h3>

                                <small class="text-muted">

                                    Placement Rate

                                </small>

                            </div>


                        </div>


                    </div>

                </div>

            </div>



            <!-- System Health -->

            <div class="col-lg-4">

                <div
                    class="card
                           border-0
                           shadow-sm
                           rounded-4
                           h-100">

                    <div class="card-body">


                        <h5 class="fw-bold">

                            <i
                                class="bi bi-shield-check
                                       text-success
                                       me-2">

                            </i>

                            System Status

                        </h5>


                        <hr>


                        <div
                            class="d-flex
                                   align-items-center
                                   gap-3
                                   mb-3">

                            <i
                                class="bi bi-check-circle-fill
                                       text-success
                                       fs-3">

                            </i>


                            <div>

                                <div class="fw-semibold">

                                    Platform Operational

                                </div>

                                <small class="text-muted">

                                    All core services available

                                </small>

                            </div>

                        </div>


                        <div
                            class="d-flex
                                   justify-content-between
                                   border-top
                                   pt-3">

                            <span class="text-muted">

                                Pending Companies

                            </span>

                            <span class="fw-bold">

                                {{stats.pending_companies}}

                            </span>

                        </div>


                        <div
                            class="d-flex
                                   justify-content-between
                                   mt-2">

                            <span class="text-muted">

                                Pending Drives

                            </span>

                            <span class="fw-bold">

                                {{stats.pending_drives}}

                            </span>

                        </div>


                    </div>

                </div>

            </div>

        </div>



        <!-- Recent Activity -->

        <div
            class="card
                   border-0
                   shadow-sm
                   rounded-4">

            <div class="card-body">


                <div
                    class="d-flex
                           justify-content-between
                           align-items-center">

                    <div>

                        <h5 class="fw-bold mb-1">

                            <i
                                class="bi bi-clock-history
                                       text-primary
                                       me-2">

                            </i>

                            Recent Activity

                        </h5>

                        <small class="text-muted">

                            Monitor important administrative actions

                        </small>

                    </div>


                    <button

                        class="btn
                               btn-sm
                               btn-outline-primary"

                        @click="navigate('analytics')">

                        View Analytics

                    </button>

                </div>


                <hr>


                <div class="row text-center">


                    <div class="col-md-3">

                        <i
                            class="bi bi-people-fill
                                   fs-3
                                   text-primary">

                        </i>

                        <h5 class="fw-bold mt-2">

                            {{stats.total_students}}

                        </h5>

                        <small class="text-muted">

                            Students

                        </small>

                    </div>


                    <div class="col-md-3">

                        <i
                            class="bi bi-building-check
                                   fs-3
                                   text-success">

                        </i>

                        <h5 class="fw-bold mt-2">

                            {{stats.total_companies}}

                        </h5>

                        <small class="text-muted">

                            Approved Companies

                        </small>

                    </div>


                    <div class="col-md-3">

                        <i
                            class="bi bi-briefcase-fill
                                   fs-3
                                   text-warning">

                        </i>

                        <h5 class="fw-bold mt-2">

                            {{stats.total_drives}}

                        </h5>

                        <small class="text-muted">

                            Active Drives

                        </small>

                    </div>


                    <div class="col-md-3">

                        <i
                            class="bi bi-trophy-fill
                                   fs-3
                                   text-danger">

                        </i>

                        <h5 class="fw-bold mt-2">

                            {{stats.total_placements}}

                        </h5>

                        <small class="text-muted">

                            Placements

                        </small>

                    </div>


                </div>


            </div>

        </div>


    </div>

    `

};