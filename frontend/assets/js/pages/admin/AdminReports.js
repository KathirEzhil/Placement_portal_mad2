const AdminReports = {

    data(){

        return {

            generating: false,

            message: "",

            error: "",

            taskId: null

        };

    },


    methods: {

        async generateMonthlyReport(){

            this.generating = true;

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

                this.generating = false;

            }

        }

    },


    template: `

    <div class="container-fluid py-4">


        <!-- Header -->

        <div class="mb-4">

            <h2 class="fw-bold mb-1">

                <i class="bi bi-file-earmark-bar-graph me-2"></i>

                Reports

            </h2>

            <p class="text-muted mb-0">

                Generate and manage placement portal reports

            </p>

        </div>



        <!-- Monthly Report -->

        <div class="card border-0 shadow-sm rounded-4">

            <div class="card-body p-4">


                <div class="d-flex
                            justify-content-between
                            align-items-center
                            mb-4">

                    <div>

                        <h5 class="fw-bold mb-1">

                            <i class="bi bi-calendar-month
                                      text-primary me-2"></i>

                            Monthly Placement Report

                        </h5>

                        <p class="text-muted mb-0">

                            Generate the latest placement
                            statistics and send them to the admin.

                        </p>

                    </div>


                    <button

                        class="btn btn-primary"

                        :disabled="generating"

                        @click="generateMonthlyReport">

                        <span
                            v-if="generating"
                            class="spinner-border
                                   spinner-border-sm
                                   me-2">

                        </span>

                        <i
                            v-else
                            class="bi bi-send me-2">

                        </i>

                        {{ generating
                            ? "Generating..."
                            : "Generate Report" }}

                    </button>

                </div>



                <!-- Success -->

                <div
                    v-if="message"

                    class="alert alert-success">

                    <i
                        class="bi bi-check-circle-fill me-2">

                    </i>

                    {{message}}

                </div>



                <!-- Error -->

                <div
                    v-if="error"

                    class="alert alert-danger">

                    <i
                        class="bi bi-exclamation-triangle-fill me-2">

                    </i>

                    {{error}}

                </div>



                <!-- Task Information -->

                <div
                    v-if="taskId"

                    class="border rounded-3 p-3">

                    <div class="fw-semibold">

                        Background Task Started

                    </div>

                    <small class="text-muted">

                        Task ID:

                    </small>

                    <code>

                        {{taskId}}

                    </code>

                    <div class="small text-muted mt-2">

                        The report is being generated in the
                        background and will be sent to the
                        configured admin email.

                    </div>

                </div>



                <!-- Report Contents -->

                <div class="mt-4">

                    <h6 class="fw-bold">

                        Report Includes

                    </h6>

                    <div class="row g-3 mt-1">


                        <div class="col-md-4">

                            <div class="border rounded-3 p-3">

                                <i class="bi bi-people
                                          text-primary fs-4">

                                </i>

                                <div class="fw-semibold mt-2">

                                    Student Statistics

                                </div>

                                <small class="text-muted">

                                    Total students and placement rate

                                </small>

                            </div>

                        </div>


                        <div class="col-md-4">

                            <div class="border rounded-3 p-3">

                                <i class="bi bi-building
                                          text-success fs-4">

                                </i>

                                <div class="fw-semibold mt-2">

                                    Company Statistics

                                </div>

                                <small class="text-muted">

                                    Participating companies

                                </small>

                            </div>

                        </div>


                        <div class="col-md-4">

                            <div class="border rounded-3 p-3">

                                <i class="bi bi-briefcase
                                          text-warning fs-4">

                                </i>

                                <div class="fw-semibold mt-2">

                                    Placement Activity

                                </div>

                                <small class="text-muted">

                                    Drives, applications and selections

                                </small>

                            </div>

                        </div>


                    </div>

                </div>


            </div>

        </div>


    </div>

    `

};