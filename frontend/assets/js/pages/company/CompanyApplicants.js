const CompanyApplicants = {

    props: ["driveId"],

    emits: ["navigate"],

    data() {

        return {

            loading: true,

            applications: [],

            selectedApplication: null,

            recruitment: null,

            placementDrive: null,

            showDetails: false,

            loadingAction: false,

            showScheduleModal: false,

            exporting: false,

            scheduleForm: {

                round: null,

                scheduled_at: "",

                meeting_details: "",

                test_link: ""

            },

            resultForm: {

                round: null,

                status: "",

                company_notes: ""

            }

        };

    },

    async mounted() {

        if (!this.driveId) {

            this.$emit("navigate", "manage-drives");

            return;

        }

        await this.loadApplicants();

    },

    methods: {

        // =====================================
        // LOAD APPLICANTS
        // =====================================

        async loadApplicants() {

            if (!this.driveId) {

                console.error("No drive selected.");

                this.loading = false;

                return;

            }

            this.loading = true;

            try {

                const response = await fetch(
                    `/company/drives/${this.driveId}/applications`,
                    {
                        credentials: "include"
                    }
                );

                const result = await response.json();

                if (result.success) {

                    this.applications =
                        result.applications || [];

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

                alert("Failed to load applicants.");

            }

            finally {

                this.loading = false;

            }

        },


        // =====================================
        // VIEW APPLICATION
        // =====================================

        async viewApplication(applicationId) {

            try {

                const response = await fetch(
                    `/company/applications/${applicationId}`,
                    {
                        credentials: "include"
                    }
                );

                const result = await response.json();

                if (!result.success) {

                    alert(result.message);

                    return;

                }

                this.selectedApplication =
                    result.application;

                this.recruitment = null;

                this.placementDrive = null;

                this.showDetails = true;

                /*
                 * Recruitment exists only after
                 * the company shortlists the student.
                 */

                if (
                    this.selectedApplication.status === "shortlisted" ||
                    this.selectedApplication.status === "selected"
                ) {
                    await this.loadRecruitment(applicationId);
                }

            }

            catch (error) {

                console.error(error);

                alert(
                    "Failed to load application details."
                );

            }

        },


        // =====================================
        // LOAD RECRUITMENT
        // =====================================

        async loadRecruitment(applicationId) {

            try {

                const response = await fetch(
                    `/company/applications/${applicationId}/recruitment`,
                    {
                        credentials: "include"
                    }
                );

                const result = await response.json();

                if (result.success) {

                    this.recruitment =
                        result.recruitment;

                    this.placementDrive =
                        result.placement_drive;

                }
                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(
                    "Recruitment load error:",
                    error
                );

            }

        },


        // =====================================
        // SHORTLIST / REJECT
        // =====================================

        async updateStatus(applicationId, status) {

            let rejectionReason = null;

            if (status === "rejected") {

                rejectionReason =
                    prompt(
                        "Enter rejection reason:"
                    );

                if (
                    !rejectionReason ||
                    !rejectionReason.trim()
                ) {

                    return;

                }

            }

            this.loadingAction = true;

            try {

                const response = await fetch(
                    `/company/applications/${applicationId}/status`,
                    {

                        method: "PUT",

                        credentials: "include",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            status,

                            rejection_reason:
                                rejectionReason

                        })

                    }
                );

                const result =
                    await response.json();

                if (result.success) {

                    alert(result.message);

                    await this.loadApplicants();

                    /*
                     * Refresh currently opened
                     * application if necessary.
                     */

                    if (
                        this.selectedApplication &&
                        this.selectedApplication.id ===
                        applicationId
                    ) {

                        this.selectedApplication =
                            result.application;

                        if (
                            status === "shortlisted"
                        ) {

                            await this.loadRecruitment(
                                applicationId
                            );

                        }

                    }

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

                alert(
                    "Failed to update application."
                );

            }

            finally {

                this.loadingAction = false;

            }

        },


        // =====================================
        // OPEN SCHEDULE MODAL
        // =====================================

        openSchedule(roundNumber) {

            this.scheduleForm = {

                round: roundNumber,

                scheduled_at: "",

                meeting_details: "",

                test_link: ""

            };

            this.showScheduleModal = true;

        },


        // =====================================
        // SCHEDULE ROUND
        // =====================================

        async scheduleRound() {

            if (!this.scheduleForm.scheduled_at) {

                alert(
                    "Please select the interview/test date and time."
                );

                return;

            }

            if (
                !this.scheduleForm.meeting_details &&
                !this.scheduleForm.test_link
            ) {

                alert(
                    "Provide either meeting details or a test link."
                );

                return;

            }

            this.loadingAction = true;

            try {

                const response = await fetch(
                    `/company/applications/${this.selectedApplication.id}/schedule-round`,
                    {

                        method: "PATCH",

                        credentials: "include",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({
                            round: this.scheduleForm.round,
                            scheduled_at: this.scheduleForm.scheduled_at,
                            meeting_details:
                                this.scheduleForm.meeting_details,
                            test_link:
                                this.scheduleForm.test_link
                        })

                    }
                );

                const result =
                    await response.json();

                if (result.success) {

                    alert(result.message);

                    this.recruitment =
                        result.recruitment;

                    this.showScheduleModal =
                        false;

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

                alert(
                    "Failed to schedule recruitment round."
                );

            }

            finally {

                this.loadingAction = false;

            }

        },


        // =====================================
        // UPDATE ROUND RESULT
        // =====================================

        async updateRoundResult(roundNumber) {

            const status =
                this.resultForm.status;

            if (!status) {

                alert(
                    "Please select a round result."
                );

                return;

            }

            this.loadingAction = true;

            try {

                const response = await fetch(
                    `/company/applications/${this.selectedApplication.id}/round-result`,
                    {

                        method: "PATCH",

                        credentials: "include",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            round: roundNumber,

                            status,

                            company_notes:
                                this.resultForm.company_notes

                        })

                    }
                );

                const result =
                    await response.json();

                if (result.success) {

                    alert(result.message);

                    this.selectedApplication =
                        result.application;

                    this.recruitment =
                        result.recruitment;

                    this.resultForm = {

                        round: null,

                        status: "",

                        company_notes: ""

                    };

                    await this.loadApplicants();

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

                alert(
                    "Failed to update round result."
                );

            }

            finally {

                this.loadingAction = false;

            }

        },

        async sendRoundEmail(roundNumber) {

            if (!this.selectedApplication) {
                return;
            }

            this.loadingAction = true;

            try {

                const response = await fetch(
                    `/company/applications/${this.selectedApplication.id}/send-round-email`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        credentials: "include",

                        body: JSON.stringify({
                            round_number: roundNumber
                        })
                    }
                );

                const result = await response.json();

                if (!result.success) {

                    alert(
                        result.message ||
                        "Failed to send invitation email."
                    );

                    return;
                }

                this.recruitment =
                    result.recruitment;

                alert(
                    result.message ||
                    "Invitation email sent successfully."
                );

            }

            catch (error) {

                console.error(
                    "Send round email error:",
                    error
                );

                alert(
                    "Failed to send invitation email."
                );

            }

            finally {

                this.loadingAction = false;

            }

        },


        // =====================================
        // GENERATE OFFER
        // =====================================

        async generateOffer() {

            this.loadingAction = true;

            try {

                const response = await fetch(
                    `/company/applications/${this.selectedApplication.id}/generate-offer`,
                    {

                        method: "PATCH",

                        credentials: "include"

                    }
                );

                const result =
                    await response.json();

                if (result.success) {

                    alert(result.message);

                    this.recruitment =
                        result.recruitment;

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

                alert(
                    "Failed to generate offer letter."
                );

            }

            finally {

                this.loadingAction = false;

            }

        },


        // =====================================
        // SEND OFFER
        // =====================================

        async sendOffer() {

            this.loadingAction = true;

            try {

                const response = await fetch(
                    `/company/applications/${this.selectedApplication.id}/send-offer`,
                    {

                        method: "PATCH",

                        credentials: "include"

                    }
                );

                const result =
                    await response.json();

                if (result.success) {

                    alert(result.message);

                    this.recruitment =
                        result.recruitment;

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

                alert(
                    "Failed to send offer letter."
                );

            }

            finally {

                this.loadingAction = false;

            }

        },

        viewResume(applicationId) {

            window.open(
                `/company/applications/${applicationId}/resume`,
                "_blank"
            );

        },

        formatDate(dateString) {

            if (!dateString) {
                return "-";
            }

            return new Date(dateString).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        },


        // =====================================
        // DOWNLOAD OFFER
        // =====================================

        downloadOffer() {

            window.open(
                `/company/applications/${this.selectedApplication.id}/offer-letter`,
                "_blank"
            );

        },


        // =====================================
        // STATUS BADGE
        // =====================================

        statusClass(status) {

            return {

                applied: "bg-primary",

                shortlisted: "bg-success",

                selected: "bg-dark",

                rejected: "bg-danger",

                withdrawn: "bg-secondary"

            }[status] || "bg-secondary";

        },


        // =====================================
        // ROUND STATUS
        // =====================================

        roundStatusClass(status) {

            return {

                pending:
                    "bg-warning text-dark",

                passed:
                    "bg-success",

                failed:
                    "bg-danger",

                skipped:
                    "bg-secondary"

            }[status] ||
            "bg-secondary";

        },

        async exportToExcel() {

            this.exporting = true;

            try {

                const response = await fetch(
                    `/api/export/company/${this.driveId}/excel`,
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
                    "Company Excel export error:",
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

<div class="container-fluid">

    <!-- HEADER -->

    <div
        class="d-flex justify-content-between
               align-items-center mb-4">

        <div>

            <h2 class="fw-bold mb-1">

                <i
                    class="bi bi-people-fill
                           text-primary me-2">
                </i>

                Applicants

            </h2>

            <p class="text-muted mb-0">

                Review applicants and manage the
                recruitment process.

            </p>

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

        <button
            class="btn btn-outline-secondary"
            @click="$emit('navigate','manage-drives')">

            <i class="bi bi-arrow-left me-2"></i>

            Back to Drives

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

            Loading applicants...

        </p>

    </div>


    <!-- EMPTY -->

    <div
        v-else-if="applications.length === 0"
        class="card border-0 shadow-sm">

        <div
            class="card-body text-center py-5">

            <i
                class="bi bi-people display-3
                       text-primary">
            </i>

            <h4 class="mt-3">

                No Applicants Yet

            </h4>

            <p class="text-muted">

                Students who apply for this
                drive will appear here.

            </p>

        </div>

    </div>


    <!-- TABLE -->

    <div
        v-else
        class="card border-0 shadow-sm">

        <div
            class="card-header bg-white py-3">

            <h5 class="mb-0">

                {{ applications.length }}
                Applicant(s)

            </h5>

        </div>

        <div class="table-responsive">

            <table
                class="table table-hover
                       align-middle mb-0">

                <thead class="table-light">

                    <tr>

                        <th>Applicant</th>

                        <th>Roll Number</th>

                        <th>CGPA</th>

                        <th>Applied</th>

                        <th>Status</th>

                        <th class="text-end">

                            Actions

                        </th>

                    </tr>

                </thead>

                <tbody>

                    <tr
                        v-for="application in applications"
                        :key="application.id">

                        <td>

                            <strong>

                                {{ application.student.name }}

                            </strong>

                        </td>

                        <td>

                            {{ application.student.roll_number }}

                        </td>

                        <td>

                            {{ application.student.cgpa }}

                        </td>

                        <td>

                            {{ formatDate(application.applied_at) }}

                        </td>

                        <td>

                            <span
                                class="badge"
                                :class="
                                    statusClass(
                                        application.status
                                    )
                                ">

                                {{ application.status }}

                            </span>

                        </td>

                        <td class="text-end">

                            <button
                                v-if="application.resume_used"
                                class="btn btn-sm btn-outline-dark me-2"
                                @click="viewResume(application.id)">

                                <i class="bi bi-file-earmark-pdf me-1"></i>

                                Resume

                            </button>

                            <button
                                class="btn btn-sm btn-outline-primary me-2"
                                @click="viewApplication(application.id)">

                                <i class="bi bi-eye me-1"></i>

                                View

                            </button>

                            <button
                                v-if="application.status === 'applied'"
                                class="btn btn-sm btn-success me-2"
                                @click="
                                    updateStatus(
                                        application.id,
                                        'shortlisted'
                                    )
                                "
                                :disabled="loadingAction">

                                <i class="bi bi-check-circle me-1"></i>

                                Shortlist

                            </button>

                            <button
                                v-if="application.status === 'applied'"
                                class="btn btn-sm btn-danger"
                                @click="
                                    updateStatus(
                                        application.id,
                                        'rejected'
                                    )
                                "
                                :disabled="loadingAction">

                                <i class="bi bi-x-circle me-1"></i>

                                Reject

                            </button>

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    </div>


    <!-- APPLICANT / RECRUITMENT MODAL -->

    <div
        v-if="showDetails"
        class="modal fade show d-block"
        style="background:rgba(0,0,0,.5);">

        <div
            class="modal-dialog modal-xl
                   modal-dialog-centered
                   modal-dialog-scrollable">

            <div class="modal-content">

                <!-- MODAL HEADER -->

                <div class="modal-header">

                    <div>

                        <h5 class="modal-title fw-bold">

                            Applicant Details

                        </h5>

                        <small
                            v-if="selectedApplication">

                            {{ selectedApplication.student.name }}

                        </small>

                    </div>

                    <button
                        class="btn-close"
                        @click="showDetails=false">
                    </button>

                </div>


                <div
                    class="modal-body"
                    v-if="selectedApplication">

                    <!-- APPLICATION DETAILS -->

                    <div class="card mb-4">

                        <div
                            class="card-header bg-light">

                            <strong>

                                Application Details

                            </strong>

                        </div>

                        <div class="card-body">

                            <div class="row">

                                <div
                                    class="col-md-4 mb-3">

                                    <strong>
                                        Student
                                    </strong>

                                    <div>
                                        {{ selectedApplication.student.name }}
                                    </div>

                                </div>

                                <div
                                    class="col-md-4 mb-3">

                                    <strong>
                                        Roll Number
                                    </strong>

                                    <div>
                                        {{ selectedApplication.student.roll_number }}
                                    </div>

                                </div>

                                <div
                                    class="col-md-4 mb-3">

                                    <strong>
                                        CGPA
                                    </strong>

                                    <div>
                                        {{ selectedApplication.student.cgpa }}
                                    </div>

                                </div>

                                <div
                                    class="col-md-4 mb-3">

                                    <strong>
                                        Status
                                    </strong>

                                    <div>

                                        <span
                                            class="badge"
                                            :class="
                                                statusClass(
                                                    selectedApplication.status
                                                )
                                            ">

                                            {{
                                                selectedApplication.status
                                            }}

                                        </span>

                                    </div>

                                </div>

                                <div
                                    class="col-md-8 mb-3">

                                    <strong>
                                        Applied At
                                    </strong>

                                    <div>
                                       {{ formatDate(selectedApplication.applied_at) }}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- RECRUITMENT -->

                    <div
                        v-if="
                            selectedApplication.status === 'shortlisted' ||
                            selectedApplication.status === 'selected'
                        ">

                        <div
                            class="card">

                            <div
                                class="card-header
                                       bg-white">

                                <div
                                    class="d-flex
                                           justify-content-between
                                           align-items-center">

                                    <strong>

                                        Recruitment Process

                                    </strong>

                                    <span
                                        v-if="recruitment"
                                        class="badge bg-primary">

                                        {{
                                            recruitment.recruitment_status
                                        }}

                                    </span>

                                </div>

                            </div>


                            <div
                                class="card-body"
                                v-if="recruitment">

                                <!-- ROUNDS -->

                                <template
                                    v-for="roundNumber in 4"
                                    :key="roundNumber">

                                    <div
                                        v-if="
                                            placementDrive &&
                                            placementDrive[
                                                'round' +
                                                roundNumber +
                                                '_required'
                                            ]
                                        "
                                        class="border rounded p-3 mb-3">

                                        <!-- ROUND HEADER -->

                                        <div
                                            class="d-flex
                                                justify-content-between
                                                align-items-start">

                                            <div>

                                                <h6 class="fw-bold mb-1">

                                                    Round {{ roundNumber }}

                                                </h6>

                                                <div class="text-muted">

                                                    {{
                                                        placementDrive[
                                                            'round' +
                                                            roundNumber +
                                                            '_name'
                                                        ]
                                                    }}

                                                </div>

                                            </div>

                                            <span
                                                class="badge"
                                                :class="
                                                    roundStatusClass(
                                                        recruitment[
                                                            'round' +
                                                            roundNumber +
                                                            '_status'
                                                        ]
                                                    )
                                                ">

                                                {{
                                                    recruitment[
                                                        'round' +
                                                        roundNumber +
                                                        '_status'
                                                    ]
                                                }}

                                            </span>

                                        </div>


                                        <!-- SCHEDULED DATE -->

                                        <div
                                            class="mt-3"
                                            v-if="
                                                recruitment[
                                                    'round' +
                                                    roundNumber +
                                                    '_scheduled_at'
                                                ]
                                            ">

                                            <div class="small text-muted">

                                                Scheduled

                                            </div>

                                            <div>

                                                {{
                                                    recruitment[
                                                        'round' +
                                                        roundNumber +
                                                        '_scheduled_at'
                                                    ]
                                                }}

                                            </div>

                                        </div>


                                        <!-- MEETING DETAILS -->

                                        <div
                                            class="mt-2"
                                            v-if="
                                                recruitment[
                                                    'round' +
                                                    roundNumber +
                                                    '_meeting_details'
                                                ]
                                            ">

                                            <div class="small text-muted">

                                                Meeting / Interview Details

                                            </div>

                                            <div>

                                                {{
                                                    recruitment[
                                                        'round' +
                                                        roundNumber +
                                                        '_meeting_details'
                                                    ]
                                                }}

                                            </div>

                                        </div>


                                        <!-- TEST LINK -->

                                        <div
                                            class="mt-2"
                                            v-if="
                                                recruitment[
                                                    'round' +
                                                    roundNumber +
                                                    '_test_link'
                                                ]
                                            ">

                                            <a
                                                :href="
                                                    recruitment[
                                                        'round' +
                                                        roundNumber +
                                                        '_test_link'
                                                    ]
                                                "
                                                target="_blank"
                                                class="btn
                                                    btn-sm
                                                    btn-outline-primary">

                                                <i class="bi bi-box-arrow-up-right me-1"></i>

                                                Open Test

                                            </a>

                                        </div>



                         

                                        <!-- SCHEDULE BUTTON -->

                                        <button
                                            v-if="
                                                !recruitment[
                                                    'round' +
                                                    roundNumber +
                                                    '_completed'
                                                ] &&
                                                recruitment.current_round <=
                                                roundNumber
                                            "
                                            class="btn
                                                btn-sm
                                                btn-primary
                                                mt-3"
                                            @click="
                                                openSchedule(roundNumber)
                                            "
                                            :disabled="loadingAction">

                                            <i
                                                class="bi
                                                    bi-calendar-plus
                                                    me-1">
                                            </i>

                                            Schedule Round

                                        </button>

                                        <!-- SEND INVITATION EMAIL -->

                                        <div
                                            v-if="
                                                recruitment[
                                                    'round' +
                                                    roundNumber +
                                                    '_scheduled_at'
                                                ]
                                            "
                                            class="mt-3">

                                            <button
                                                v-if="
                                                    !recruitment[
                                                        'round' +
                                                        roundNumber +
                                                        '_email_sent'
                                                    ]
                                                "
                                                class="btn btn-sm btn-outline-primary"
                                                @click="sendRoundEmail(roundNumber)"
                                                :disabled="loadingAction">

                                                <i class="bi bi-envelope me-1"></i>

                                                Send Invitation Email

                                            </button>

                                            <span
                                                v-else
                                                class="badge bg-success">

                                                <i class="bi bi-check-circle me-1"></i>

                                                Invitation Sent

                                            </span>

                                        </div>


                                        <!-- RESULT -->

                                        <div
                                            v-if="
                                                recruitment[
                                                    'round' +
                                                    roundNumber +
                                                    '_scheduled_at'
                                                ] &&
                                                !recruitment[
                                                    'round' +
                                                    roundNumber +
                                                    '_completed'
                                                ]
                                            "
                                            class="mt-3">

                                            <select
                                                class="form-select mb-2"
                                                v-model="resultForm.status">

                                                <option value="">

                                                    Select Result

                                                </option>

                                                <option value="passed">

                                                    Passed

                                                </option>

                                                <option value="failed">

                                                    Failed

                                                </option>

                                                <option value="skipped">

                                                    Skipped

                                                </option>

                                            </select>

                                            <textarea
                                                class="form-control mb-2"
                                                rows="2"
                                                placeholder="Company notes"
                                                v-model="resultForm.company_notes">
                                            </textarea>

                                            <button
                                                class="btn
                                                    btn-sm
                                                    btn-success"
                                                @click="
                                                    updateRoundResult(
                                                        roundNumber
                                                    )
                                                "
                                                :disabled="loadingAction">

                                                Update Result

                                            </button>

                                        </div>

                                    </div>

                                </template>


                                <!-- OFFER -->

                                <div
                                    v-if="
                                        recruitment &&
                                        recruitment.recruitment_status ===
                                        'completed' &&
                                        selectedApplication.status ===
                                        'selected'
                                    "
                                    class="card
                                           border-success
                                           mt-4">

                                    <div
                                        class="card-body">

                                        <h5
                                            class="fw-bold
                                                   text-success">

                                            <i
                                                class="bi
                                                       bi-award
                                                       me-2">
                                            </i>

                                            Offer Letter

                                        </h5>

                                        <p
                                            class="text-muted">

                                            Recruitment completed
                                            successfully.

                                        </p>

                                        <button
                                            v-if="
                                                !recruitment.offer_letter_generated
                                            "
                                            class="btn
                                                   btn-primary
                                                   me-2"
                                            @click="generateOffer"
                                            :disabled="
                                                loadingAction
                                            ">

                                            Generate Offer

                                        </button>

                                        <button
                                            v-if="
                                                recruitment.offer_letter_generated &&
                                                !recruitment.offer_letter_sent
                                            "
                                            class="btn
                                                   btn-success
                                                   me-2"
                                            @click="sendOffer"
                                            :disabled="
                                                loadingAction
                                            ">

                                            Send Offer Email

                                        </button>

                                        <button
                                            v-if="
                                                recruitment.offer_letter_generated
                                            "
                                            class="btn
                                                   btn-outline-primary"
                                            @click="downloadOffer">

                                            Download Offer

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>


    <!-- SCHEDULE MODAL -->

    <div
        v-if="showScheduleModal"
        class="modal fade show d-block"
        style="background:rgba(0,0,0,.5);">

        <div
            class="modal-dialog modal-dialog-centered">

            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="fw-bold">

                        Schedule Round
                        {{ scheduleForm.round }}

                    </h5>

                    <button
                        class="btn-close"
                        @click="
                            showScheduleModal=false
                        ">
                    </button>

                </div>

                <div class="modal-body">

                    <label class="form-label">

                        Date & Time

                    </label>

                    <input
                        type="datetime-local"
                        class="form-control mb-3"
                        v-model="
                            scheduleForm.scheduled_at
                        ">


                    <label class="form-label">

                        Meeting Details

                    </label>

                    <textarea
                        class="form-control mb-3"
                        rows="3"
                        placeholder="Meeting details / interview instructions"
                        v-model="
                            scheduleForm.meeting_details
                        ">
                    </textarea>


                    <label class="form-label">

                        Test Link

                    </label>

                    <input
                        type="url"
                        class="form-control"
                        placeholder="https://..."
                        v-model="
                            scheduleForm.test_link
                        ">

                    <small
                        class="text-muted">

                        Provide meeting details,
                        test link, or both.

                    </small>

                </div>

                <div class="modal-footer">

                    <button
                        class="btn btn-secondary"
                        @click="
                            showScheduleModal=false
                        ">

                        Cancel

                    </button>

                    <button
                        class="btn btn-primary"
                        @click="scheduleRound"
                        :disabled="loadingAction">

                        Schedule

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>

`

};