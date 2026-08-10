const StudentApplications = {

    data(){

        return {

            applications: [],

            loading: true,

            selectedApplication: null,

            showDetails: false,

            withdrawing: false,

            errorMessage: "",

            successMessage: "",

            selectedRecruitment: null,

            showRecruitment: false,

            recruitmentLoading: false,

            recruitmentError: "",

            exporting: false

        };

    },


    computed: {

        activeApplications(){

            return this.applications.filter(
                application =>
                    application.status !== "withdrawn"
            );

        },

        withdrawnApplications(){

            return this.applications.filter(
                application =>
                    application.status === "withdrawn"
            );

        }

    },


    mounted(){

        this.loadApplications();

    },


    methods: {

        async loadApplications(){

            this.loading = true;

            this.errorMessage = "";

            try{

                const result =
                    await studentService
                        .getApplications();

                console.log(
                    "APPLICATION DATA:",
                    result.application_list
                );

                if(result.success){

                    this.applications =
                        result.application_list || [];

                }

                else{

                    this.errorMessage =
                        result.message ||
                        "Unable to load applications.";

                }

            }

            catch(error){

                console.error(
                    "Applications error:",
                    error
                );

                this.errorMessage =
                    "Unable to load applications.";

            }

            finally{

                this.loading = false;

            }

        },
        


        async viewApplication(application){

            this.errorMessage = "";

            try{

                const result =
                    await studentService
                        .getApplication(
                            application.id
                        );

                if(result.success){

                    this.selectedApplication =
                        result.application;

                    this.showDetails = true;

                }

                else{

                    this.errorMessage =
                        result.message ||
                        "Unable to load application details.";

                }

            }

            catch(error){

                console.error(error);

                this.errorMessage =
                    "Unable to load application details.";

            }

        },


        closeDetails(){

            this.showDetails = false;

            this.selectedApplication = null;

        },


        canWithdraw(application){

            return (
                application.status !== "selected" &&
                application.status !== "rejected" &&
                application.status !== "withdrawn"
            );

        },

        canReapply(application){

            return (
                application.status === "withdrawn" &&
                application.recruitment &&
                application.recruitment.status === "not_started"
            );

        },

        async reapplyApplication(application){

            if(!this.canReapply(application)){
                return;
            }

            const confirmed = confirm(
                "Are you sure you want to reapply for this placement drive?"
            );

            if(!confirmed){
                return;
            }

            this.errorMessage = "";
            this.successMessage = "";

            try{

                const result =
                    await studentService.applyToDrive(
                        application.drive.id,
                        application.cover_letter || ""
                    );

                if(result.success){

                    this.successMessage =
                        result.message ||
                        "Application reapplied successfully.";

                    await this.loadApplications();

                }

                else{

                    this.errorMessage =
                        result.message ||
                        "Unable to reapply for this placement drive.";

                }

            }

            catch(error){

                console.error(
                    "Reapply error:",
                    error
                );

                this.errorMessage =
                    "Unable to reapply for this placement drive.";

            }

        },

        async withdrawApplication(application){

            if(!this.canWithdraw(application)){

                return;

            }


            const confirmed =
                confirm(
                    "Are you sure you want to withdraw this application?"
                );


            if(!confirmed){

                return;

            }


            this.withdrawing = true;

            this.errorMessage = "";

            this.successMessage = "";


            try{

                const result =
                    await studentService
                        .withdrawApplication(
                            application.id
                        );


                if(result.success){

                    this.successMessage =
                        result.message ||
                        "Application withdrawn successfully.";

                    await this.loadApplications();

                    this.closeDetails();

                }

                else{

                    this.errorMessage =
                        result.message ||
                        "Unable to withdraw application.";

                }

            }

            catch(error){

                console.error(
                    "Withdraw error:",
                    error
                );

                this.errorMessage =
                    "Unable to withdraw application.";

            }

            finally{

                this.withdrawing = false;

            }

        },


        getStatusClass(status){

            switch(status){

                case "selected":
                    return "bg-success";

                case "rejected":
                    return "bg-danger";

                case "withdrawn":
                    return "bg-secondary";

                case "shortlisted":
                    return "bg-primary";

                default:
                    return "bg-warning text-dark";

            }

        },


        formatDate(value){

            if(!value){

                return "-";

            }

            return new Date(value)
                .toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

        },
        getOfferLetterUrl(applicationId){

            return `/student/applications/${applicationId}/offer-letter`;

        },

        async viewRecruitment(application){

            this.selectedRecruitment = null;

            this.recruitmentError = "";

            this.recruitmentLoading = true;

            this.showRecruitment = true;

            try{

                const result =
                    await studentService.getRecruitmentDetails(
                        application.id
                    );

                if(result.success){

                    this.selectedRecruitment = result;

                }

                else{

                    this.recruitmentError =
                        result.message ||
                        "Unable to load recruitment details.";

                }

            }

            catch(error){

                console.error(
                    "Recruitment details error:",
                    error
                );

                this.recruitmentError =
                    "Unable to load recruitment details.";

            }

            finally{

                this.recruitmentLoading = false;

            }

        },

        async exportToExcel() {

            this.exporting = true;

            try {

                const response = await fetch(
                    "/api/export/student/excel",
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
                    "Excel export error:",
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

        },

    },


    template: `

    <div class="container-fluid py-4">


        <!-- Header -->

        <div class="mb-4">

            <h2 class="fw-bold mb-1">

                <i
                    class="bi bi-file-earmark-text
                           text-primary me-2">

                </i>

                My Applications

            </h2>


            <p class="text-muted mb-0">

                Track all your placement applications.

            </p>

            <button
                class="btn btn-success"
                @click="exportToExcel"
                :disabled="exporting">

                <i
                    class="bi bi-file-earmark-excel me-2">
                </i>

                {{
                    exporting
                        ? "Generating..."
                        : "Export to Excel"
                }}

            </button>

        </div>


        <!-- Success -->

        <div
            v-if="successMessage"
            class="alert alert-success">

            <i
                class="bi bi-check-circle-fill me-2">

            </i>

            {{successMessage}}

        </div>


        <!-- Error -->

        <div
            v-if="errorMessage"
            class="alert alert-danger">

            <i
                class="bi bi-exclamation-triangle-fill me-2">

            </i>

            {{errorMessage}}

        </div>


        <!-- Loading -->

        <div
            v-if="loading"
            class="text-center py-5">

            <div
                class="spinner-border text-primary">

            </div>

            <p class="text-muted mt-3">

                Loading your applications...

            </p>

        </div>


        <!-- Empty -->

        <div
            v-else-if="applications.length === 0"
            class="card
                   border-0
                   shadow-sm
                   rounded-4">

            <div class="card-body text-center py-5">

                <i
                    class="bi bi-file-earmark-x
                           display-4
                           text-muted">

                </i>

                <h5 class="mt-3">

                    No Applications Yet

                </h5>

                <p class="text-muted">

                    You have not applied for any
                    placement drives yet.

                </p>

            </div>

        </div>


        <!-- Applications -->

        <div
            v-else
            class="row g-4">


            <div
                v-for="application in applications"
                :key="application.id"
                class="col-xl-6">


                <div
                    class="card
                           border-0
                           shadow-sm
                           rounded-4
                           h-100">


                    <div class="card-body p-4">


                        <!-- Header -->

                        <div
                            class="d-flex
                                   justify-content-between
                                   align-items-start
                                   mb-3">


                            <div>

                                <h5 class="fw-bold mb-1">

                                    {{
                                        application.drive?.title || "-"
                                    }}

                                </h5>


                                <div class="text-muted">

                                    <i
                                        class="bi bi-building me-1">

                                    </i>

                                    {{
                                        application.drive?.company_name || "-"
                                    }}

                                </div>

                            </div>


                            <span
                                class="badge"
                                :class="
                                    getStatusClass(
                                        application.status
                                    )
                                ">

                                {{application.status}}

                            </span>

                        </div>


                        <hr>


                        <div class="row g-3">


                            <div class="col-md-6">

                                <small
                                    class="text-muted">

                                    Applied On

                                </small>

                                <div class="fw-semibold">

                                    {{
                                        formatDate(
                                            application.applied_at
                                        )
                                    }}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <small
                                    class="text-muted">

                                    Application ID

                                </small>

                                <div class="fw-semibold">

                                    #{{application.id}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <small
                                    class="text-muted">

                                    Job Type

                                </small>

                                <div>

                                    {{
                                        application.drive?.job_type ||
                                        "-"
                                    }}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <small
                                    class="text-muted">

                                    Location

                                </small>

                                <div>

                                    {{
                                        application.drive?.location || "-"
                                    }}

                                </div>

                            </div>

                        </div>


                        <!-- Actions -->

                        <div
                            class="d-flex
                                   gap-2
                                   mt-4">


                            <button

                                class="btn
                                       btn-outline-primary
                                       flex-grow-1"

                                @click="
                                    viewApplication(
                                        application
                                    )
                                ">

                                <i
                                    class="bi bi-eye me-1">

                                </i>

                                View Details

                            </button>


                            <button

                                v-if="
                                    canWithdraw(
                                        application
                                    )
                                "

                                class="btn btn-outline-danger"

                                :disabled="withdrawing"

                                @click="
                                    withdrawApplication(
                                        application
                                    )
                                ">

                                <i
                                    class="bi bi-x-circle me-1">

                                </i>

                                Withdraw

                            </button>

                            <button
                                v-if="
                                    canReapply(
                                        application
                                    )
                                "

                                class="btn btn-outline-primary"

                                @click="
                                    reapplyApplication(
                                        application
                                    )
                                ">

                                <i
                                    class="bi bi-arrow-repeat me-1">

                                </i>

                                Reapply

                            </button>


                            <a

                                v-if="
                                    application.status ===
                                    'selected'
                                "

                                :href="getOfferLetterUrl(application.id)"

                                target="_blank"

                                class="btn btn-success">

                                <i
                                    class="bi bi-file-earmark-pdf me-1">

                                </i>

                                Offer Letter

                            </a>

                            <button
                                v-if="
                                    application.recruitment &&
                                    application.recruitment.status !== 'not_started'
                                "
                                class="btn btn-outline-info"
                                @click="viewRecruitment(application)">

                                <i class="bi bi-diagram-3 me-1"></i>

                                Recruitment

                            </button>

                        </div>


                    </div>

                </div>

            </div>


        </div>


        <!-- Details Modal -->

        <div
            class="modal fade"
            :class="{show: showDetails}"
            :style="{
                display:
                    showDetails
                    ? 'block'
                    : 'none'
            }"
            tabindex="-1">


            <div
                class="modal-dialog
                       modal-lg
                       modal-dialog-scrollable">


                <div class="modal-content">


                    <div class="modal-header">

                        <h5 class="modal-title">

                            Application Details

                        </h5>


                        <button

                            type="button"

                            class="btn-close"

                            @click="closeDetails">

                        </button>

                    </div>


                    <div
                        class="modal-body"
                        v-if="selectedApplication">


                        <h4 class="fw-bold">

                            {{
                                selectedApplication.drive_title ||
                                selectedApplication.title
                            }}

                        </h4>


                        <p class="text-muted">

                            {{
                                selectedApplication.drive?.company_name ||
                                "-"
                            }}

                        </p>


                        <hr>


                        <div class="row g-4">


                            <div class="col-md-6">

                                <label
                                    class="text-muted small">

                                    Application Status

                                </label>

                                <div>

                                    <span
                                        class="badge"
                                        :class="
                                            getStatusClass(
                                                selectedApplication.status
                                            )
                                        ">

                                        {{
                                            selectedApplication.status
                                        }}

                                    </span>

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label
                                    class="text-muted small">

                                    Applied On

                                </label>

                                <div>

                                    {{
                                        formatDate(
                                            selectedApplication.applied_at
                                        )
                                    }}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label
                                    class="text-muted small">

                                    Job Type

                                </label>

                                <div>

                                    {{
                                        selectedApplication.drive?.job_type ||
                                        "-"
                                    }}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label
                                    class="text-muted small">

                                    Location

                                </label>

                                <div>

                                    {{
                                        selectedApplication.drive?.location ||
                                        "-"
                                    }}

                                </div>

                            </div>

                            <div class="col-md-6">

                                <label class="text-muted small">

                                    Compensation

                                </label>

                                <div>

                                    {{
                                        selectedApplication.drive?.compensation ||
                                        "-"
                                    }}

                                </div>

                            </div>


                            <div class="col-12">

                                <label
                                    class="text-muted small">

                                    Cover Letter

                                </label>

                                <div
                                    class="border
                                           rounded-3
                                           p-3">

                                    {{
                                        selectedApplication.cover_letter ||
                                        "No cover letter provided."
                                    }}

                                </div>

                            </div>


                        </div>

                    </div>


                    <div class="modal-footer">


                        <button

                            class="btn btn-secondary"

                            @click="closeDetails">

                            Close

                        </button>


                        <button

                            v-if="
                                selectedApplication &&
                                canWithdraw(
                                    selectedApplication
                                )
                            "

                            class="btn btn-danger"

                            :disabled="withdrawing"

                            @click="
                                withdrawApplication(
                                    selectedApplication
                                )
                            ">

                            {{
                                withdrawing
                                ? "Withdrawing..."
                                : "Withdraw Application"
                            }}

                        </button>


                    </div>

                </div>

            </div>

        </div>

        <div
            v-if="showRecruitment"
            class="modal fade show d-block"
            tabindex="-1"
            style="background: rgba(0,0,0,0.5);">

            <div class="modal-dialog modal-lg modal-dialog-centered">

                <div class="modal-content border-0 shadow">

                    <div class="modal-header">

                        <div>

                            <h5 class="modal-title fw-bold">

                                Recruitment Progress

                            </h5>

                            <small
                                v-if="selectedRecruitment"
                                class="text-muted">

                                {{
                                    selectedRecruitment.placement_drive.company_name
                                }}

                                -
                                
                                {{
                                    selectedRecruitment.placement_drive.title
                                }}

                            </small>

                        </div>

                        <button
                            type="button"
                            class="btn-close"
                            @click="showRecruitment = false">

                        </button>

                    </div>


                    <div class="modal-body">


                        <!-- Loading -->

                        <div
                            v-if="recruitmentLoading"
                            class="text-center py-5">

                            <div
                                class="spinner-border text-primary">

                            </div>

                            <p class="text-muted mt-3 mb-0">

                                Loading recruitment progress...

                            </p>

                        </div>


                        <!-- Error -->

                        <div
                            v-else-if="recruitmentError"
                            class="alert alert-danger">

                            <i
                                class="bi bi-exclamation-triangle me-2">

                            </i>

                            {{ recruitmentError }}

                        </div>


                        <!-- Recruitment -->

                        <div
                            v-else-if="selectedRecruitment"
                            class="">

                            <!-- Overall status -->

                            <div
                                class="d-flex justify-content-between align-items-center mb-4">

                                <div>

                                    <small class="text-muted">
                                        Recruitment Status
                                    </small>

                                    <h5 class="fw-bold mb-0">

                                        {{
                                            selectedRecruitment
                                                .recruitment
                                                .recruitment_status
                                        }}

                                    </h5>

                                </div>

                                <span
                                    class="badge bg-primary">

                                    Round
                                    {{
                                        selectedRecruitment
                                            .recruitment
                                            .current_round
                                    }}

                                </span>

                            </div>


                            <!-- Rounds -->

                            <div class="list-group">


                                <!-- Round 1 -->

                                <div class="list-group-item">

                                    <div
                                        class="d-flex justify-content-between">

                                        <strong>
                                            Round 1
                                        </strong>

                                        <span
                                            class="badge bg-secondary">

                                            {{
                                                selectedRecruitment
                                                    .recruitment
                                                    .round1_status
                                            }}

                                        </span>

                                    </div>

                                    <div
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round1_scheduled_at
                                        "
                                        class="small text-muted mt-2">

                                        <i class="bi bi-calendar-event me-1"></i>

                                        {{
                                            selectedRecruitment.recruitment
                                                .round1_scheduled_at
                                        }}

                                    </div>

                                    <div
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round1_meeting_details
                                        "
                                        class="small mt-2">

                                        {{
                                            selectedRecruitment.recruitment
                                                .round1_meeting_details
                                        }}

                                    </div>

                                    <a
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round1_test_link
                                        "
                                        :href="
                                            selectedRecruitment.recruitment
                                                .round1_test_link
                                        "
                                        target="_blank"
                                        class="btn btn-sm btn-outline-primary mt-2">

                                        Open Test

                                    </a>

                                </div>


                                <!-- Round 2 -->

                                <div class="list-group-item">

                                    <div
                                        class="d-flex justify-content-between">

                                        <strong>
                                            Round 2
                                        </strong>

                                        <span
                                            class="badge bg-secondary">

                                            {{
                                                selectedRecruitment
                                                    .recruitment
                                                    .round2_status
                                            }}

                                        </span>

                                    </div>

                                    <div
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round2_scheduled_at
                                        "
                                        class="small text-muted mt-2">

                                        <i class="bi bi-calendar-event me-1"></i>

                                        {{
                                            selectedRecruitment.recruitment
                                                .round2_scheduled_at
                                        }}

                                    </div>

                                    <div
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round2_meeting_details
                                        "
                                        class="small mt-2">

                                        {{
                                            selectedRecruitment.recruitment
                                                .round2_meeting_details
                                        }}

                                    </div>

                                    <a
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round2_test_link
                                        "
                                        :href="
                                            selectedRecruitment.recruitment
                                                .round2_test_link
                                        "
                                        target="_blank"
                                        class="btn btn-sm btn-outline-primary mt-2">

                                        Open Test

                                    </a>

                                </div>


                                <!-- Round 3 -->

                                <div class="list-group-item">

                                    <div
                                        class="d-flex justify-content-between">

                                        <strong>
                                            Round 3
                                        </strong>

                                        <span
                                            class="badge bg-secondary">

                                            {{
                                                selectedRecruitment
                                                    .recruitment
                                                    .round3_status
                                            }}

                                        </span>

                                    </div>

                                    <div
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round3_scheduled_at
                                        "
                                        class="small text-muted mt-2">

                                        <i class="bi bi-calendar-event me-1"></i>

                                        {{
                                            selectedRecruitment.recruitment
                                                .round3_scheduled_at
                                        }}

                                    </div>

                                    <div
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round3_meeting_details
                                        "
                                        class="small mt-2">

                                        {{
                                            selectedRecruitment.recruitment
                                                .round3_meeting_details
                                        }}

                                    </div>

                                    <a
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round3_test_link
                                        "
                                        :href="
                                            selectedRecruitment.recruitment
                                                .round3_test_link
                                        "
                                        target="_blank"
                                        class="btn btn-sm btn-outline-primary mt-2">

                                        Open Test

                                    </a>

                                </div>


                                <!-- Round 4 -->

                                <div class="list-group-item">

                                    <div
                                        class="d-flex justify-content-between">

                                        <strong>
                                            Round 4
                                        </strong>

                                        <span
                                            class="badge bg-secondary">

                                            {{
                                                selectedRecruitment
                                                    .recruitment
                                                    .round4_status
                                            }}

                                        </span>

                                    </div>

                                    <div
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round4_scheduled_at
                                        "
                                        class="small text-muted mt-2">

                                        <i class="bi bi-calendar-event me-1"></i>

                                        {{
                                            selectedRecruitment.recruitment
                                                .round4_scheduled_at
                                        }}

                                    </div>

                                    <div
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round4_meeting_details
                                        "
                                        class="small mt-2">

                                        {{
                                            selectedRecruitment.recruitment
                                                .round4_meeting_details
                                        }}

                                    </div>

                                    <a
                                        v-if="
                                            selectedRecruitment.recruitment
                                                .round4_test_link
                                        "
                                        :href="
                                            selectedRecruitment.recruitment
                                                .round4_test_link
                                        "
                                        target="_blank"
                                        class="btn btn-sm btn-outline-primary mt-2">

                                        Open Test

                                    </a>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="modal-footer">

                        <button
                            class="btn btn-secondary"
                            @click="showRecruitment = false">

                            Close

                        </button>

                    </div>

                </div>

            </div>

        </div>


        <div
            v-if="showDetails"
            class="modal-backdrop fade show">

        </div>


    </div>

    `

};