const CompanyCreateDrive = {

    props: {
        editDriveId: {
            type: Number,
            default: null
        }
    },

    emits: ["navigate"],

    data() {

        return {

            loading: false,

            drive: {

                title: "",
                description: "",
                job_type: "",
                compensation: "",
                location: "",
                required_skills: "",
                selection_process: "",
                round1_required: false,
                round1_name: "",

                round2_required: false,
                round2_name: "",

                round3_required: false,
                round3_name: "",

                round4_required: false,
                round4_name: "",
                eligibility_cgpa: "",
                drive_date: "",
                last_date_to_apply: ""

            }

        }

    },

    async mounted() {

        if (this.editDriveId) {

            await this.loadDriveForEdit();

        }

    },

    methods: {

        goBack() {

            this.$emit("navigate", "manage-drives");

        },

        resetForm() {

            this.drive = {

                title: "",
                description: "",
                job_type: "",
                compensation: "",
                location: "",
                required_skills: "",
                selection_process: "",
                round1_required: false,
                round1_name: "",

                round2_required: false,
                round2_name: "",

                round3_required: false,
                round3_name: "",

                round4_required: false,
                round4_name: "",
                eligibility_cgpa: "",
                drive_date: "",
                last_date_to_apply: ""

            }

        },

        async createDrive() {

            // Basic Validation

            if (!this.drive.title.trim()) {
                alert("Job Title is required.");
                return;
            }

            if (!this.drive.job_type) {
                alert("Please select a Job Type.");
                return;
            }

            if (!this.drive.compensation.trim()) {
                alert("Compensation is required.");
                return;
            }

            if (!this.drive.location.trim()) {
                alert("Location is required.");
                return;
            }

            if (
                this.drive.eligibility_cgpa === "" ||
                this.drive.eligibility_cgpa < 0 ||
                this.drive.eligibility_cgpa > 10
            ) {
                alert("Eligibility CGPA must be between 0 and 10.");
                return;
            }

            if (!this.drive.required_skills.trim()) {
                alert("Required Skills are required.");
                return;
            }

            if (!this.drive.selection_process.trim()) {
                alert("Selection Process is required.");
                return;
            }

            if (!this.drive.description.trim()) {
                alert("Job Description is required.");
                return;
            }

            if (!this.drive.drive_date) {
                alert("Drive Date is required.");
                return;
            }

            if (!this.drive.last_date_to_apply) {
                alert("Last Date to Apply is required.");
                return;
            }

            if (
                this.drive.last_date_to_apply >
                this.drive.drive_date
            ) {
                alert("Last Date to Apply cannot be after Drive Date.");
                return;
            }

            if (!this.drive.round1_required) {

                alert("Please select at least Round 1.");

                return;

            }

            if (
                this.drive.round1_required &&
                !this.drive.round1_name.trim()
            ) {

                alert("Please enter Round 1 name.");

                return;

            }

            if (
                this.drive.round2_required &&
                !this.drive.round2_name.trim()
            ) {

                alert("Please enter Round 2 name.");

                return;

            }

            if (
                this.drive.round3_required &&
                !this.drive.round3_name.trim()
            ) {

                alert("Please enter Round 3 name.");

                return;

            }

            if (
                this.drive.round4_required &&
                !this.drive.round4_name.trim()
            ) {

                alert("Please enter Round 4 name.");

                return;

            }

            this.loading = true;

            try {

                const url = this.editDriveId
                    ? `/company/drive/${this.editDriveId}`
                    : "/company/drive";

                const method = this.editDriveId
                    ? "PUT"
                    : "POST";

                const response = await fetch(url, {

                    method: method,

                    credentials: "include",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(this.drive)

                });

                const result = await response.json();

                if (result.success) {

                    alert(result.message);

                    this.resetForm();

                    this.$emit("navigate", "manage-drives");

                }

                else {

                    alert(result.message);

                    console.log(result.error);

                }

            }

            catch (error) {

                console.error(error);

                alert(
                    this.editDriveId
                        ? "Something went wrong while updating the placement drive."
                        : "Something went wrong while creating the placement drive."
                );

            }

            finally {

                this.loading = false;

            }

        },
        
        async loadDriveForEdit() {

            const response = await fetch(
                `/company/drives/${this.editDriveId}`,
                {
                    credentials: "include"
                }
            );

            const result = await response.json();

            if (result.success) {

                this.drive = result.drive;

            } else {

                alert(result.message);

                this.$emit("navigate", "manage-drives");

            }

        }

    },

    template: 
            `
            <div class="container-fluid">

                <div class="mb-3">

                    <button
                    class="btn btn-outline-secondary"
                    @click="goBack">

                        <i class="bi bi-arrow-left me-2"></i>

                        Back to Dashboard

                    </button>

                </div>

                <div class="card border-0 shadow-sm">

                    <div class="card-body p-4">

                        <h2 class="fw-bold mb-4">

                            <i class="bi bi-briefcase-fill text-primary me-2"></i>

                            {{ editDriveId ? "Edit Placement Drive" : "Create Placement Drive" }}

                        </h2>

                        <div class="row">

                            <div class="col-md-6 mb-3">

                                <label class="form-label">

                                    Job Title

                                </label>

                                <input
                                class="form-control"
                                v-model="drive.title">

                            </div>

                            <div class="col-md-6 mb-3">

                                <label class="form-label">

                                    Job Type

                                </label>

                                <select
                                class="form-select"
                                v-model="drive.job_type">

                                    <option value="">

                                        Select

                                    </option>

                                    <option>

                                        Internship

                                    </option>

                                    <option>

                                        Full-Time

                                    </option>

                                    <option>

                                        Full-Time + Internship

                                    </option>

                                </select>

                            </div>

                            <div class="col-md-6 mb-3">

                                <label class="form-label">

                                    Compensation

                                </label>

                                <input
                                class="form-control"
                                placeholder="Eg: 18 LPA / ₹40,000 per month"
                                v-model="drive.compensation">

                            </div>

                            <div class="col-md-6 mb-3">

                                <label class="form-label">

                                    Location

                                </label>

                                <input
                                class="form-control"
                                v-model="drive.location">

                            </div>

                        </div>

                        <hr>

                        <h5 class="fw-bold mb-3">

                            Eligibility

                        </h5>

                        <div class="row">

                            <div class="col-md-6 mb-3">

                                <label class="form-label">

                                    Minimum CGPA

                                </label>

                                <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                class="form-control"
                                v-model="drive.eligibility_cgpa">

                            </div>

                            <div class="col-md-6 mb-3">

                                <label class="form-label">

                                    Required Skills

                                </label>

                                <input
                                class="form-control"
                                placeholder="Python, SQL, VueJS..."
                                v-model="drive.required_skills">

                            </div>

                        </div>

                        <hr>

                        <h5 class="fw-bold mb-3">

                            Recruitment Process

                        </h5>

                        <div class="mb-3">

                            <label class="form-label">

                                Selection Process

                            </label>

                            <textarea
                            rows="3"
                            class="form-control"
                            v-model="drive.selection_process">

                            </textarea>

                        </div>

                        <hr>

                        <h5 class="fw-bold mb-3">

                            Recruitment Rounds

                        </h5>

                        <!-- Round 1 -->

                        <div class="card mb-3">

                            <div class="card-body">

                                <div class="form-check">

                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        v-model="drive.round1_required">

                                    <label class="form-check-label">

                                        Round 1 Required

                                    </label>

                                </div>

                                <input
                                    v-if="drive.round1_required"
                                    class="form-control mt-3"
                                    placeholder="Example: Aptitude Test"
                                    v-model="drive.round1_name">

                            </div>

                        </div>

                        <!-- Round 2 -->

                        <div class="card mb-3">

                            <div class="card-body">

                                <div class="form-check">

                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        v-model="drive.round2_required"
                                        :disabled="!drive.round1_required">

                                    <label class="form-check-label">

                                        Round 2 Required

                                    </label>

                                </div>

                                <input
                                    v-if="drive.round2_required"
                                    class="form-control mt-3"
                                    placeholder="Example: Technical Interview"
                                    v-model="drive.round2_name">

                            </div>

                        </div>

                        <!-- Round 3 -->

                        <div class="card mb-3">

                            <div class="card-body">

                                <div class="form-check">

                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        v-model="drive.round3_required"
                                        :disabled="!drive.round2_required">

                                    <label class="form-check-label">

                                        Round 3 Required

                                    </label>

                                </div>

                                <input
                                    v-if="drive.round3_required"
                                    class="form-control mt-3"
                                    placeholder="Example: HR Interview"
                                    v-model="drive.round3_name">

                            </div>

                        </div>

                        <!-- Round 4 -->

                        <div class="card mb-4">

                            <div class="card-body">

                                <div class="form-check">

                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        v-model="drive.round4_required"
                                        :disabled="!drive.round3_required">

                                    <label class="form-check-label">

                                        Round 4 Required

                                    </label>

                                </div>

                                <input
                                    v-if="drive.round4_required"
                                    class="form-control mt-3"
                                    placeholder="Example: Managerial Interview"
                                    v-model="drive.round4_name">

                            </div>

                        </div>

                        <div class="mb-4">

                            <label class="form-label">

                                Job Description

                            </label>

                            <textarea
                            rows="5"
                            class="form-control"
                            v-model="drive.description">

                            </textarea>

                        </div>

                        <hr>

                        <h5 class="fw-bold mb-3">

                            Timeline

                        </h5>

                        <div class="row">

                            <div class="col-md-6 mb-3">

                                <label class="form-label">

                                    Drive Date

                                </label>

                                <input
                                type="date"
                                class="form-control"
                                v-model="drive.drive_date">

                            </div>

                            <div class="col-md-6 mb-4">

                                <label class="form-label">

                                    Last Date to Apply

                                </label>

                                <input
                                type="date"
                                class="form-control"
                                v-model="drive.last_date_to_apply">

                            </div>

                        </div>

                        <div class="d-flex justify-content-end">

                            <button
                            class="btn btn-secondary me-2"
                            @click="resetForm">

                                Reset

                            </button>

                            <button
                            class="btn btn-primary"
                            @click="createDrive"
                            :disabled="loading">

                            <span
                                v-if="loading"
                                class="spinner-border spinner-border-sm me-2">
                            </span>

                            <i
                                v-else
                                :class="editDriveId
                                    ? 'bi bi-check-circle me-2'
                                    : 'bi bi-plus-circle me-2'">
                            </i>

                            {{
                                loading
                                    ? (editDriveId ? "Updating..." : "Creating...")
                                    : (editDriveId ? "Update Drive" : "Create Drive")
                            }}

                        </button>

                        </div>

                    </div>

                </div>

            </div>

            `

}
            