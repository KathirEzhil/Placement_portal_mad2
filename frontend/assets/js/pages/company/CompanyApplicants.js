const CompanyApplicants = {

    props: ["driveId"],

    emits: ["navigate"],

    data() {

        return {

            loading: true,

            applications: [],

            drive: null,

            selectedApplication: null,

            showDetails: false,

            actionLoading: false

        };

    },

    async mounted() {

        await this.loadApplicants();

    },

    methods: {

        async loadApplicants() {

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

                    this.applications = result.applications || [];

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

        async viewApplication(applicationId) {

            try {

                const response = await fetch(
                    `/company/applications/${applicationId}`,
                    {
                        credentials: "include"
                    }
                );

                const result = await response.json();

                if (result.success) {

                    this.selectedApplication = result.application;

                    this.showDetails = true;

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

                alert("Failed to load application details.");

            }

        },

        async updateStatus(applicationId, status) {

            let rejectionReason = null;

            if (status === "rejected") {

                rejectionReason = prompt(
                    "Please enter the rejection reason:"
                );

                if (!rejectionReason || !rejectionReason.trim()) {

                    return;

                }

            }

            this.actionLoading = true;

            try {

                const response = await fetch(
                    `/company/applications/${applicationId}/status`,
                    {

                        method: "PUT",

                        credentials: "include",

                        headers: {

                            "Content-Type": "application/json"

                        },

                        body: JSON.stringify({

                            status: status,

                            rejection_reason: rejectionReason

                        })

                    }
                );

                const result = await response.json();

                if (result.success) {

                    alert(result.message);

                    this.showDetails = false;

                    await this.loadApplicants();

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

                alert("Failed to update application status.");

            }

            finally {

                this.actionLoading = false;

            }

        },

        statusClass(status) {

            return {

                applied: "bg-primary",

                shortlisted: "bg-success",

                rejected: "bg-danger",

                selected: "bg-dark",

                withdrawn: "bg-secondary"

            }[status] || "bg-secondary";

        }

    },

    template: `

        <div class="container-fluid">

            <!-- Header -->

            <div class="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 class="fw-bold mb-1">

                        <i class="bi bi-people-fill text-primary me-2"></i>

                        Applicants

                    </h2>

                    <p class="text-muted mb-0">

                        Review and manage students who applied for this drive.

                    </p>

                </div>

                <button

                    class="btn btn-outline-secondary"

                    @click="$emit('navigate', 'manage-drives')">

                    <i class="bi bi-arrow-left me-2"></i>

                    Back to Drives

                </button>

            </div>


            <!-- Loading -->

            <div

                v-if="loading"

                class="text-center py-5">

                <div class="spinner-border text-primary"></div>

                <p class="text-muted mt-3">

                    Loading applicants...

                </p>

            </div>


            <!-- Empty -->

            <div

                v-else-if="applications.length === 0"

                class="card border-0 shadow-sm">

                <div class="card-body text-center py-5">

                    <i class="bi bi-people display-3 text-primary"></i>

                    <h4 class="mt-3">

                        No Applicants Yet

                    </h4>

                    <p class="text-muted">

                        Students who apply for this placement drive

                        will appear here.

                    </p>

                </div>

            </div>


            <!-- Applicants -->

            <div

                v-else

                class="card border-0 shadow-sm">

                <div class="card-header bg-white py-3">

                    <h5 class="mb-0">

                        {{ applications.length }} Applicant(s)

                    </h5>

                </div>

                <div class="card-body p-0">

                    <div class="table-responsive">

                        <table class="table table-hover align-middle mb-0">

                            <thead class="table-light">

                                <tr>

                                    <th>Student</th>

                                    <th>Roll Number</th>

                                    <th>CGPA</th>

                                    <th>Applied On</th>

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

                                        <div class="fw-semibold">

                                            {{ application.student_name }}

                                        </div>

                                    </td>

                                    <td>

                                        {{ application.roll_number }}

                                    </td>

                                    <td>

                                        {{ application.cgpa }}

                                    </td>

                                    <td>

                                        {{ application.applied_at }}

                                    </td>

                                    <td>

                                        <span

                                            class="badge"

                                            :class="statusClass(application.status)">

                                            {{ application.status }}

                                        </span>

                                    </td>

                                    <td class="text-end">

                                        <button

                                            class="btn btn-sm btn-outline-primary me-2"

                                            @click="viewApplication(application.id)">

                                            <i class="bi bi-eye me-1"></i>

                                            View

                                        </button>

                                        <button

                                            v-if="application.status === 'applied'"

                                            class="btn btn-sm btn-success me-2"

                                            @click="updateStatus(application.id, 'shortlisted')"

                                            :disabled="actionLoading">

                                            <i class="bi bi-check-circle me-1"></i>

                                            Shortlist

                                        </button>

                                        <button

                                            v-if="application.status === 'applied'"

                                            class="btn btn-sm btn-danger"

                                            @click="updateStatus(application.id, 'rejected')"

                                            :disabled="actionLoading">

                                            <i class="bi bi-x-circle me-1"></i>

                                            Reject

                                        </button>

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            <!-- Application Details Modal -->

            <div

                v-if="showDetails"

                class="modal fade show d-block"

                tabindex="-1"

                style="background: rgba(0,0,0,.5);">

                <div class="modal-dialog modal-lg modal-dialog-centered">

                    <div class="modal-content">

                        <div class="modal-header">

                            <h5 class="modal-title fw-bold">

                                Applicant Details

                            </h5>

                            <button

                                type="button"

                                class="btn-close"

                                @click="showDetails = false">

                            </button>

                        </div>

                        <div class="modal-body">

                            <div v-if="selectedApplication">

                                <h5 class="fw-bold">

                                    {{ selectedApplication.student_name }}

                                </h5>

                                <hr>

                                <div class="row">

                                    <div class="col-md-6 mb-3">

                                        <strong>Roll Number</strong>

                                        <div>

                                            {{ selectedApplication.roll_number }}

                                        </div>

                                    </div>

                                    <div class="col-md-6 mb-3">

                                        <strong>CGPA</strong>

                                        <div>

                                            {{ selectedApplication.cgpa }}

                                        </div>

                                    </div>

                                    <div class="col-md-6 mb-3">

                                        <strong>Status</strong>

                                        <div>

                                            <span

                                                class="badge"

                                                :class="statusClass(selectedApplication.status)">

                                                {{ selectedApplication.status }}

                                            </span>

                                        </div>

                                    </div>

                                    <div class="col-md-6 mb-3">

                                        <strong>Applied At</strong>

                                        <div>

                                            {{ selectedApplication.applied_at }}

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div class="modal-footer">

                            <button

                                class="btn btn-secondary"

                                @click="showDetails = false">

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    `

};