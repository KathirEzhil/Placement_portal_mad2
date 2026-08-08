const OperationsCenter = {

    data() {

        return {

            loadingReminder: false,
            loadingReport: false

        }

    },

    methods: {

        async runReminder() {

            this.loadingReminder = true;

            try {

                const result = await adminService.runDailyReminder();

                if (result.success) {
                    alert(result.message);
                }
                else {
                    alert(result.message);
                }

            }
            finally {

                this.loadingReminder = false;

            }

        },

        async runReport() {

            this.loadingReport = true;

            try {

                const result = await adminService.runMonthlyReport();

                if (result.success) {
                    alert(result.message);
                }
                else {
                    alert(result.message);
                }

            }
            finally {

                this.loadingReport = false;

            }

        }

    },

    template: `

    <div class="card border-0 shadow-sm rounded-4">

        <div class="card-body">

            <div class="d-flex align-items-center mb-4">

                <i class="bi bi-cpu text-primary fs-3 me-3"></i>

                <div>

                    <h5 class="fw-bold mb-0">

                        Operations Center

                    </h5>

                    <small class="text-muted">

                        Administrative platform operations

                    </small>

                </div>

            </div>


            <div class="list-group list-group-flush">

                <!-- Daily Reminder -->

                <div class="list-group-item px-0">

                    <div class="d-flex justify-content-between align-items-center">

                        <div>

                            <h6 class="mb-1">

                                <i class="bi bi-envelope-paper me-2 text-primary"></i>

                                Daily Reminder

                            </h6>

                            <small class="text-muted">

                                Send reminder emails to students.

                            </small>

                        </div>

                        <button

                            class="btn btn-outline-primary btn-sm"

                            @click="runReminder"

                            :disabled="loadingReminder">

                            <span
                                v-if="loadingReminder"
                                class="spinner-border spinner-border-sm me-2">
                            </span>

                            Run

                        </button>

                    </div>

                </div>


                <!-- Monthly Report -->

                <div class="list-group-item px-0">

                    <div class="d-flex justify-content-between align-items-center">

                        <div>

                            <h6 class="mb-1">

                                <i class="bi bi-file-earmark-bar-graph me-2 text-success"></i>

                                Monthly Report

                            </h6>

                            <small class="text-muted">

                                Generate placement report.

                            </small>

                        </div>

                        <button

                            class="btn btn-outline-success btn-sm"

                            @click="runReport"

                            :disabled="loadingReport">

                            <span
                                v-if="loadingReport"
                                class="spinner-border spinner-border-sm me-2">
                            </span>

                            Generate

                        </button>

                    </div>

                </div>


                <!-- Analytics -->

                <div class="list-group-item px-0">

                    <div class="d-flex justify-content-between align-items-center">

                        <div>

                            <h6 class="mb-1">

                                <i class="bi bi-bar-chart-line me-2 text-warning"></i>

                                Analytics

                            </h6>

                            <small class="text-muted">

                                View placement analytics.

                            </small>

                        </div>

                        <button
                            class="btn btn-outline-dark btn-sm">

                            Open

                        </button>

                    </div>

                </div>


                <!-- Reports -->

                <div class="list-group-item px-0">

                    <div class="d-flex justify-content-between align-items-center">

                        <div>

                            <h6 class="mb-1">

                                <i class="bi bi-folder2-open me-2 text-info"></i>

                                Reports

                            </h6>

                            <small class="text-muted">

                                View exported reports.

                            </small>

                        </div>

                        <button
                            class="btn btn-outline-dark btn-sm">

                            Open

                        </button>

                    </div>

                </div>

            </div>

        </div>

    </div>

    `
}