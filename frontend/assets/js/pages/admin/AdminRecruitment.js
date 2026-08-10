const AdminRecruitment = {

    data() {

        return {

            recruitment: [],

            loading: true,

            error: null,

            search: "",

            statusFilter: "all",

            selectedRecruitment: null

        };

    },

    computed: {

        filteredRecruitment() {

            let result = this.recruitment;

            if (this.statusFilter !== "all") {

                result = result.filter(
                    item =>
                        item.recruitment.status ===
                        this.statusFilter
                );

            }

            if (this.search.trim()) {

                const search =
                    this.search.toLowerCase();

                result = result.filter(item =>

                    item.student.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    item.student.roll_number
                        .toLowerCase()
                        .includes(search)

                    ||

                    item.company.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    item.drive.title
                        .toLowerCase()
                        .includes(search)

                );

            }

            return result;

        }

    },

    methods: {

        async loadRecruitment() {

            this.loading = true;

            this.error = null;

            try {

                const response = await fetch(
                    "/admin/recruitment",
                    {
                        credentials: "include"
                    }
                );

                const result =
                    await response.json();

                if (!response.ok || !result.success) {

                    throw new Error(
                        result.message ||
                        "Failed to load recruitment data."
                    );

                }

                this.recruitment =
                    result.recruitment || [];

            }

            catch (error) {

                console.error(
                    "Recruitment loading error:",
                    error
                );

                this.error =
                    error.message ||
                    "Failed to load recruitment data.";

            }

            finally {

                this.loading = false;

            }

        },

        statusClass(status) {

            if (status === "completed") {
                return "bg-success";
            }

            if (status === "in_progress") {
                return "bg-primary";
            }

            if (status === "cancelled") {
                return "bg-danger";
            }

            return "bg-secondary";

        },

        roundClass(status) {

            if (status === "passed") {
                return "text-success";
            }

            if (status === "failed") {
                return "text-danger";
            }

            if (status === "skipped") {
                return "text-secondary";
            }

            return "text-warning";

        },

        formatDate(value) {

            if (!value) {
                return "-";
            }

            return new Date(value)
                .toLocaleString();

        },

        viewDetails(item) {

            this.selectedRecruitment = item;

        },

    },

    mounted() {

        this.loadRecruitment();

    },

    template: `

    <div>

        <!-- PAGE HEADER -->

        <div class="d-flex justify-content-between
                    align-items-center mb-4">

            <div>

                <h2 class="fw-bold mb-1">

                    <i class="bi bi-diagram-3-fill
                              text-primary me-2"></i>

                    Recruitment

                </h2>

                <p class="text-muted mb-0">

                    Track recruitment progress across
                    all placement drives.

                </p>

            </div>

        </div>


        <!-- FILTER CARD -->

        <div class="card border-0 shadow-sm
                    rounded-4 mb-4">

            <div class="card-body">

                <div class="row g-3">

                    <div class="col-md-8">

                        <label class="form-label
                                      fw-semibold">

                            Search

                        </label>

                        <input
                            type="text"
                            class="form-control"
                            v-model="search"
                            placeholder="Search student, roll number, company or drive..."
                        >

                    </div>

                    <div class="col-md-4">

                        <label class="form-label
                                      fw-semibold">

                            Recruitment Status

                        </label>

                        <select
                            class="form-select"
                            v-model="statusFilter">

                            <option value="all">
                                All
                            </option>

                            <option value="not_started">
                                Not Started
                            </option>

                            <option value="in_progress">
                                In Progress
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                            <option value="cancelled">
                                Cancelled
                            </option>

                        </select>

                    </div>

                </div>

            </div>

        </div>


        <!-- LOADING -->

        <div
            v-if="loading"
            class="text-center py-5">

            <div
                class="spinner-border text-primary">
            </div>

            <p class="text-muted mt-3">

                Loading recruitment data...

            </p>

        </div>


        <!-- ERROR -->

        <div
            v-else-if="error"
            class="alert alert-danger">

            <i class="bi bi-exclamation-triangle me-2"></i>

            {{ error }}

        </div>


        <!-- EMPTY -->

        <div
            v-else-if="filteredRecruitment.length === 0"
            class="card border-0 shadow-sm rounded-4">

            <div class="card-body text-center py-5">

                <i
                    class="bi bi-diagram-3
                           fs-1 text-muted">
                </i>

                <h5 class="mt-3">
                    No recruitment processes found
                </h5>

                <p class="text-muted mb-0">

                    Recruitment processes will appear
                    here once applications enter recruitment.

                </p>

            </div>

        </div>


        <!-- RECRUITMENT TABLE -->

        <div
            v-else
            class="card border-0 shadow-sm rounded-4">

            <div class="card-header bg-white
                        border-0 p-4">

                <div class="d-flex
                            justify-content-between
                            align-items-center">

                    <div>

                        <h5 class="fw-bold mb-1">

                            Recruitment Processes

                        </h5>

                        <small class="text-muted">

                            {{ filteredRecruitment.length }}
                            process(es)

                        </small>

                    </div>

                </div>

            </div>


            <div class="table-responsive">

                <table
                    class="table table-hover
                           align-middle mb-0">

                    <thead class="table-light">

                        <tr>

                            <th>Student</th>

                            <th>Company</th>

                            <th>Drive</th>

                            <th>Application</th>

                            <th>Recruitment</th>

                            <th>Current Round</th>

                            <th>Offer</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        <tr
                            v-for="item in filteredRecruitment"
                            :key="item.recruitment_id">

                            <!-- STUDENT -->

                            <td>

                                <div class="fw-semibold">

                                    {{ item.student.name }}

                                </div>

                                <small class="text-muted">

                                    {{ item.student.roll_number }}

                                </small>

                                <br>

                                <small class="text-muted">

                                    {{ item.student.branch }}

                                    ·

                                    CGPA
                                    {{ item.student.cgpa }}

                                </small>

                            </td>


                            <!-- COMPANY -->

                            <td>

                                <span class="fw-semibold">

                                    {{ item.company.name }}

                                </span>

                            </td>


                            <!-- DRIVE -->

                            <td>

                                <div class="fw-semibold">

                                    {{ item.drive.title }}

                                </div>

                                <small class="text-muted">

                                    {{ item.drive.job_type }}

                                    ·

                                    {{ item.drive.location }}

                                </small>

                            </td>


                            <!-- APPLICATION -->

                            <td>

                                <span
                                    class="badge bg-light
                                           text-dark border">

                                    {{ item.application.status }}

                                </span>

                            </td>


                            <!-- RECRUITMENT -->

                            <td>

                                <span
                                    class="badge"
                                    :class="
                                        statusClass(
                                            item.recruitment.status
                                        )
                                    ">

                                    {{
                                        item.recruitment.status
                                    }}

                                </span>

                            </td>

                            


                            <!-- CURRENT ROUND -->

                            <td>

                                <span
                                    v-if="
                                        item.recruitment.current_round
                                        > 0
                                    "
                                    class="fw-semibold">

                                    Round
                                    {{
                                        item.recruitment.current_round
                                    }}

                                </span>

                                <span
                                    v-else
                                    class="text-muted">

                                    Not Started

                                </span>

                            </td>


                            <!-- OFFER -->

                            <td>

                                <span
                                    v-if="
                                        item.recruitment
                                        .offer_letter_sent
                                    "
                                    class="badge bg-success">

                                    Sent

                                </span>

                                <span
                                    v-else-if="
                                        item.recruitment
                                        .offer_letter_generated
                                    "
                                    class="badge bg-warning
                                           text-dark">

                                    Generated

                                </span>

                                <span
                                    v-else
                                    class="badge bg-light
                                           text-dark border">

                                    Not Generated

                                </span>

                            </td>


                            <!-- ACTION -->

                            <td>

                                <button
                                    class="btn
                                           btn-outline-primary
                                           btn-sm"
                                    @click="
                                        viewDetails(item)
                                    ">

                                    <i
                                        class="bi bi-eye me-1">
                                    </i>

                                    View

                                </button>

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>


        <!-- ROUND DETAILS -->

        <div
            v-if="
                filteredRecruitment.length > 0
            "
            class="mt-4">

            <div
                v-for="item in filteredRecruitment"
                :key="'rounds-' + item.recruitment_id"
                class="card border-0 shadow-sm
                       rounded-4 mb-3">

                <div class="card-body">

                    <div class="d-flex
                                justify-content-between
                                align-items-center mb-3">

                        <div>

                            <h6 class="fw-bold mb-1">

                                {{ item.student.name }}

                                <span class="text-muted">
                                    →
                                </span>

                                {{ item.company.name }}

                            </h6>

                            <small class="text-muted">

                                {{ item.drive.title }}

                            </small>

                        </div>

                        <span class="text-muted small">

                            Updated:
                            {{
                                formatDate(
                                    item.recruitment.updated_at
                                )
                            }}

                        </span>

                    </div>


                    <div class="row g-3">

                        <div
                            v-for="round
                                in item.recruitment.rounds"
                            :key="
                                item.recruitment_id +
                                '-' +
                                round.round_number
                            "
                            class="col-md-6 col-xl-3">

                            <div
                                class="border rounded-3 p-3
                                       h-100">

                                <div class="fw-semibold mb-2">

                                    Round
                                    {{ round.round_number }}

                                    <span
                                        v-if="round.name">

                                        -
                                        {{ round.name }}

                                    </span>

                                </div>

                                <div
                                    :class="
                                        roundClass(
                                            round.status
                                        )
                                    "
                                    class="fw-semibold">

                                    {{ round.status }}

                                </div>

                                <small
                                    class="text-muted d-block">

                                    {{
                                        round.completed
                                            ? "Completed"
                                            : "Not Completed"
                                    }}

                                </small>

                                <small
                                    v-if="round.scheduled_at"
                                    class="text-muted d-block mt-1">

                                    Scheduled:
                                    {{
                                        formatDate(
                                            round.scheduled_at
                                        )
                                    }}

                                </small>

                                <small
                                    class="text-muted d-block mt-1">

                                    Email:
                                    {{
                                        round.email_sent
                                            ? "Sent"
                                            : "Not Sent"
                                    }}

                                </small>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
        
        <!-- RECRUITMENT DETAILS MODAL -->

<div
    v-if="selectedRecruitment"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.25);">

    <div
        class="modal-dialog modal-lg modal-dialog-centered">

        <div class="modal-content border-0 shadow-lg">

            <!-- HEADER -->

            <div class="modal-header">

                <div>

                    <h5 class="modal-title fw-bold mb-1">
                        Recruitment Details
                    </h5>

                    <small class="text-muted">
                        Application
                        #{{ selectedRecruitment.application_id }}
                    </small>

                </div>

                <button
                    type="button"
                    class="btn-close"
                    @click="selectedRecruitment = null">
                </button>

            </div>


            <!-- BODY -->

            <div class="modal-body">

                <!-- STUDENT + COMPANY -->

                <div class="row g-3 mb-4">

                    <div class="col-md-6">

                        <div class="border rounded-3 p-3 h-100">

                            <small class="text-muted">
                                Student
                            </small>

                            <h6 class="fw-bold mt-1 mb-1">
                                {{
                                    selectedRecruitment
                                    .student.name
                                }}
                            </h6>

                            <div class="text-muted">
                                {{
                                    selectedRecruitment
                                    .student.roll_number
                                }}
                            </div>

                            <div class="text-muted">
                                {{
                                    selectedRecruitment
                                    .student.branch
                                }}
                                · CGPA
                                {{
                                    selectedRecruitment
                                    .student.cgpa
                                }}
                            </div>

                        </div>

                    </div>


                    <div class="col-md-6">

                        <div class="border rounded-3 p-3 h-100">

                            <small class="text-muted">
                                Company
                            </small>

                            <h6 class="fw-bold mt-1">
                                {{
                                    selectedRecruitment
                                    .company.name
                                }}
                            </h6>

                            <div class="text-muted">
                                {{
                                    selectedRecruitment
                                    .drive.title
                                }}
                            </div>

                        </div>

                    </div>

                </div>


                <!-- RECRUITMENT STATUS -->

                <div class="border rounded-3 p-3 mb-4">

                    <div class="d-flex
                                justify-content-between
                                align-items-center">

                        <div>

                            <small class="text-muted">
                                Recruitment Status
                            </small>

                            <div class="fw-semibold mt-1">

                                {{
                                    selectedRecruitment
                                    .recruitment.status
                                }}

                            </div>

                        </div>


                        <div>

                            <small class="text-muted">
                                Current Round
                            </small>

                            <div class="fw-semibold mt-1">

                                <span
                                    v-if="
                                        selectedRecruitment
                                        .recruitment
                                        .current_round > 0
                                    ">

                                    Round
                                    {{
                                        selectedRecruitment
                                        .recruitment
                                        .current_round
                                    }}

                                </span>

                                <span v-else>
                                    Not Started
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- RECRUITMENT ROUNDS -->

                <h6 class="fw-bold mb-3">
                    Recruitment Rounds
                </h6>

                <div
                    v-if="
                        selectedRecruitment
                        .recruitment
                        .rounds.length
                    "
                    class="row g-3">

                    <div
                        v-for="
                            round in
                            selectedRecruitment
                            .recruitment
                            .rounds
                        "
                        :key="
                            round.round_number
                        "
                        class="col-md-6">

                        <div
                            class="border rounded-3 p-3">

                            <div
                                class="d-flex
                                       justify-content-between
                                       align-items-center mb-2">

                                <strong>
                                    Round
                                    {{ round.round_number }}
                                </strong>

                                <span
                                    class="badge"
                                    :class="
                                        round.status === 'passed'
                                            ? 'bg-success'
                                            : round.status === 'failed'
                                                ? 'bg-danger'
                                                : 'bg-secondary'
                                    ">

                                    {{ round.status }}

                                </span>

                            </div>


                            <div class="small text-muted">

                                <div class="mb-1">

                                    <strong>
                                        Status:
                                    </strong>

                                    {{ round.status }}

                                </div>

                                <div class="mb-1">

                                    <strong>
                                        Completed:
                                    </strong>

                                    {{
                                        round.completed
                                            ? "Yes"
                                            : "No"
                                    }}

                                </div>

                                <div
                                    v-if="round.scheduled_at"
                                    class="mb-1">

                                    <strong>
                                        Scheduled:
                                    </strong>

                                    {{
                                        formatDate(
                                            round.scheduled_at
                                        )
                                    }}

                                </div>

                                <div class="mb-1">

                                    <strong>
                                        Email:
                                    </strong>

                                    {{
                                        round.email_sent
                                            ? "Sent"
                                            : "Not Sent"
                                    }}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <div
                    v-else
                    class="text-muted">

                    No recruitment rounds recorded.

                </div>


                <!-- OFFER LETTER -->

                <div
                    class="border rounded-3 p-3 mt-4">

                    <h6 class="fw-bold mb-3">
                        Offer Letter
                    </h6>

                    <div class="d-flex gap-4">

                        <div>

                            <small class="text-muted">
                                Generated
                            </small>

                            <div class="fw-semibold">

                                {{
                                    selectedRecruitment
                                    .recruitment
                                    .offer_letter_generated
                                        ? "Yes"
                                        : "No"
                                }}

                            </div>

                        </div>


                        <div>

                            <small class="text-muted">
                                Sent
                            </small>

                            <div class="fw-semibold">

                                {{
                                    selectedRecruitment
                                    .recruitment
                                    .offer_letter_sent
                                        ? "Yes"
                                        : "No"
                                }}

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- FOOTER -->

            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-secondary"
                    @click="selectedRecruitment = null">

                    Close

                </button>

            </div>

        </div>

    </div>

</div>

    </div>

    `

};