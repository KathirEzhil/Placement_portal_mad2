const AdminReports = {

    data(){

        return {

            generatingReport: false,

            runningReminders: false,

            message: "",

            error: "",

            taskId: null,

            exporting: false

        };

    },


    methods: {

        async generateMonthlyReport(){

            this.generatingReport = true;

            this.message = "";

            this.error = "";

            this.taskId = null;


            try{

                const result =
                    await reportsService
                        .generateMonthlyReport();


                if(result.success){

                    this.taskId =
                        result.task_id;

                    this.message =
                        result.message ||
                        "Monthly report generation started.";

                }

                else{

                    this.error =
                        result.message ||
                        "Unable to generate monthly report.";

                }

            }

            catch(error){

                console.error(
                    "Monthly report error:",
                    error
                );

                this.error =
                    "Unable to start monthly report.";

            }

            finally{

                this.generatingReport = false;

            }

        },


        async runDailyReminders(){

            this.runningReminders = true;

            this.message = "";

            this.error = "";

            this.taskId = null;


            try{

                const result =
                    await reportsService
                        .runDailyReminders();


                if(result.success){

                    this.taskId =
                        result.task_id;

                    this.message =
                        result.message ||
                        "Daily reminders started.";

                }

                else{

                    this.error =
                        result.message ||
                        "Unable to start daily reminders.";

                }

            }

            catch(error){

                console.error(
                    "Daily reminder error:",
                    error
                );

                this.error =
                    "Unable to start daily reminders.";

            }

            finally{

                this.runningReminders = false;

            }

        },


        async exportToExcel() {

            this.exporting = true;

            try {

                const response = await fetch(
                    "/api/export/admin/excel",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

                const result =
                    await response.json();

                if (!response.ok || !result.success) {

                    throw new Error(
                        result.message ||
                        "Failed to start Excel export."
                    );

                }

                alert(result.message);

            }

            catch (error) {

                console.error(
                    "Admin Excel export error:",
                    error
                );

                alert(
                    error.message ||
                    "Failed to generate Excel export."
                );

            }

            finally {

                this.exporting = false;

            }

        }

    },


    template: `

    <div class="container-fluid py-4">


        <div class="mb-4">

            <div class="d-flex align-items-center gap-3 mb-1">

                <h1 class="mb-0">
                    <i class="bi bi-file-earmark-bar-graph me-2"></i>
                    Reports & Background Jobs
                </h1>

                <button
                    class="btn btn-success"
                    @click="exportToExcel"
                    :disabled="exporting">

                    <i class="bi bi-file-earmark-excel me-2"></i>

                    {{
                        exporting
                            ? "Generating..."
                            : "Export to Excel"
                    }}

                </button>

            </div>
            <p class="text-muted mb-0">

                Generate reports and run automated placement
                notification jobs.

            </p>

            

        </div>


        <!-- Notifications -->

        <div
            v-if="message"
            class="alert alert-success">

            <i class="bi bi-check-circle-fill me-2"></i>

            {{message}}

        </div>


        <div
            v-if="error"
            class="alert alert-danger">

            <i class="bi bi-exclamation-triangle-fill me-2"></i>

            {{error}}

        </div>


        <div class="row g-4">


            <!-- Monthly Report -->

            <div class="col-lg-6">

                <div
                    class="card
                           border-0
                           shadow-sm
                           rounded-4
                           h-100">

                    <div class="card-body p-4">


                        <div
                            class="d-flex
                                   align-items-center
                                   mb-3">

                            <div
                                class="rounded-3
                                       bg-primary-subtle
                                       p-3
                                       me-3">

                                <i
                                    class="bi bi-calendar-month
                                           text-primary
                                           fs-4">

                                </i>

                            </div>


                            <div>

                                <h5 class="fw-bold mb-1">

                                    Monthly Placement Report

                                </h5>

                                <small class="text-muted">

                                    Generate current placement
                                    statistics and email the report.

                                </small>

                            </div>

                        </div>


                        <hr>


                        <p class="text-muted">

                            Includes students, companies,
                            drives, applications, selections
                            and placement rate.

                        </p>


                        <button

                            class="btn btn-primary"

                            :disabled="generatingReport"

                            @click="generateMonthlyReport">

                            <span
                                v-if="generatingReport"
                                class="spinner-border
                                       spinner-border-sm
                                       me-2">

                            </span>

                            <i
                                v-else
                                class="bi bi-send me-2">

                            </i>

                            {{generatingReport
                                ? "Generating..."
                                : "Generate Monthly Report"}}

                        </button>

                    </div>

                </div>

            </div>



            <!-- Daily Reminders -->

            <div class="col-lg-6">

                <div
                    class="card
                           border-0
                           shadow-sm
                           rounded-4
                           h-100">

                    <div class="card-body p-4">


                        <div
                            class="d-flex
                                   align-items-center
                                   mb-3">

                            <div
                                class="rounded-3
                                       bg-warning-subtle
                                       p-3
                                       me-3">

                                <i
                                    class="bi bi-bell
                                           text-warning
                                           fs-4">

                                </i>

                            </div>


                            <div>

                                <h5 class="fw-bold mb-1">

                                    Daily Placement Reminders

                                </h5>

                                <small class="text-muted">

                                    Notify students about
                                    upcoming deadlines and interviews.

                                </small>

                            </div>

                        </div>


                        <hr>


                        <p class="text-muted">

                            Checks for placement drives closing
                            tomorrow and interviews scheduled
                            for tomorrow.

                        </p>


                        <button

                            class="btn btn-warning"

                            :disabled="runningReminders"

                            @click="runDailyReminders">

                            <span
                                v-if="runningReminders"
                                class="spinner-border
                                       spinner-border-sm
                                       me-2">

                            </span>

                            <i
                                v-else
                                class="bi bi-bell me-2">

                            </i>

                            {{runningReminders
                                ? "Starting..."
                                : "Run Daily Reminders"}}

                        </button>

                    </div>

                </div>

            </div>


        </div>


        <!-- Background Job Information -->

        <div
            v-if="taskId"
            class="card
                   border-0
                   shadow-sm
                   rounded-4
                   mt-4">

            <div class="card-body">


                <h6 class="fw-bold">

                    <i
                        class="bi bi-cpu me-2
                               text-success">

                    </i>

                    Background Job Started

                </h6>


                <p class="mb-1 text-muted">

                    The request has been handed over to
                    Celery for background processing.

                </p>


                <div>

                    <small class="text-muted">

                        Task ID:

                    </small>

                    <code>

                        {{taskId}}

                    </code>

                </div>

            </div>

        </div>


    </div>

    `

};