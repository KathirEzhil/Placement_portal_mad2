const StudentPlacementDrives = {

    components: {
        "drive-card": DriveCard
    },


    data() {

        return {

            drives: [],

            filteredDrives: [],

            searchQuery: "",

            selectedJobType: "all",

            selectedLocation: "all",

            loading: true,

            applying: false,

            appliedDriveIds: [],

            selectedDrive: null,

            showDetails: false,

            showApply: false,

            coverLetter: "",

            errorMessage: "",

            successMessage: ""

        };

    },


    computed: {

        jobTypes() {

            return [
                ...new Set(
                    this.drives
                        .map(drive => drive.job_type)
                        .filter(Boolean)
                )
            ];

        },


        locations() {

            return [
                ...new Set(
                    this.drives
                        .map(drive => drive.location)
                        .filter(Boolean)
                )
            ];

        }

    },


    mounted() {

        this.fetchDrives();

    },


    methods: {

        async fetchDrives() {

            this.loading = true;

            this.errorMessage = "";

            try {

                const [drivesResult, applicationsResult] =
                    await Promise.all([

                        studentService.getDrives(),

                        studentService.getApplications()

                    ]);


                /*
                * Load placement drives
                */

                if (drivesResult.success) {

                    this.drives =
                        drivesResult.drives || [];

                    this.filteredDrives =
                        this.drives;

                }

                else {

                    this.errorMessage =
                        drivesResult.message ||
                        "Unable to load placement drives.";

                    return;

                }


                /*
                * Load already submitted applications
                */

                if (applicationsResult.success) {

                    this.appliedDriveIds =
                        (applicationsResult.application_list || [])
                            .filter(application =>
                                application.status !== "withdrawn"
                            )
                            .map(application =>
                                application.drive?.id
                            )
                            .filter(id =>
                                id !== undefined
                            );

                }

            }

            catch(error) {

                console.error(
                    "Placement drives error:",
                    error
                );

                this.errorMessage =
                    "Unable to load placement drives.";

            }

            finally {

                this.loading = false;

            }

        },


        searchDrives() {

            const query =
                this.searchQuery
                    .trim()
                    .toLowerCase();


            this.filteredDrives =
                this.drives.filter(drive => {


                    const matchesSearch =
                        !query ||

                        (drive.title || "")
                            .toLowerCase()
                            .includes(query) ||

                        (drive.company_name || "")
                            .toLowerCase()
                            .includes(query) ||

                        (drive.location || "")
                            .toLowerCase()
                            .includes(query) ||

                        (drive.required_skills || "")
                            .toLowerCase()
                            .includes(query);


                    const matchesJobType =
                        this.selectedJobType === "all" ||

                        drive.job_type ===
                        this.selectedJobType;


                    const matchesLocation =
                        this.selectedLocation === "all" ||

                        drive.location ===
                        this.selectedLocation;


                    return (
                        matchesSearch &&
                        matchesJobType &&
                        matchesLocation
                    );

                });

        },


        viewDrive(drive) {

            this.selectedDrive = drive;

            this.errorMessage = "";

            this.successMessage = "";

            this.showDetails = true;

        },


        closeDetails() {

            this.showDetails = false;

            this.selectedDrive = null;

        },


        openApply(drive) {

            if (
                this.appliedDriveIds
                    .includes(drive.id)
            ) {

                return;

            }


            this.selectedDrive = drive;

            this.coverLetter = "";

            this.errorMessage = "";

            this.successMessage = "";

            this.showApply = true;

        },


        closeApply() {

            this.showApply = false;

            this.coverLetter = "";

        },


        async applyDrive(drive) {

            this.openApply(drive);

        },


        async submitApplication() {

            if (!this.selectedDrive) {
                return;
            }

            this.applying = true;

            this.errorMessage = "";
            this.successMessage = "";

            try {

                const response = await fetch(
                    `/student/drives/${this.selectedDrive.id}/apply`,
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            cover_letter: this.coverLetter
                        })
                    }
                );

                const result = await response.json();

                console.log("Apply response:", result);

                if (response.ok) {

                    this.successMessage =
                        result.message ||
                        "Application submitted successfully.";

                    this.appliedDriveIds.push(
                        this.selectedDrive.id
                    );

                    this.coverLetter = "";

                    setTimeout(() => {

                        this.showApply = false;
                        this.successMessage = "";

                    }, 1500);

                }

                else {

                    this.errorMessage =
                        result.message ||
                        "Unable to submit application.";

                }

            }

            catch(error) {

                console.error(
                    "Application error:",
                    error
                );

                this.errorMessage =
                    "Failed to submit application.";

            }

            finally {

                this.applying = false;

            }

        },


        formatDate(dateValue) {

            if (!dateValue) {

                return "-";

            }


            return new Date(dateValue)
                .toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

        }

    },


    template: `

    <div class="container-fluid py-4">


        <!-- Header -->

        <div
            class="d-flex
                   justify-content-between
                   align-items-center
                   mb-4">

            <div>

                <h2 class="fw-bold mb-1">

                    Placement Drives

                </h2>

                <p class="text-muted mb-0">

                    Explore all active placement opportunities.

                </p>

            </div>

        </div>


        <!-- Success Message -->

        <div
            v-if="successMessage"
            class="alert alert-success">

            <i
                class="bi bi-check-circle-fill me-2">

            </i>

            {{successMessage}}

        </div>


        <!-- Error Message -->

        <div
            v-if="errorMessage"
            class="alert alert-danger">

            <i
                class="bi bi-exclamation-triangle-fill me-2">

            </i>

            {{errorMessage}}

        </div>


        <!-- Filters -->

        <div
            class="card
                   shadow-sm
                   border-0
                   mb-4">

            <div class="card-body">

                <div class="row g-3">


                    <div class="col-lg-6">

                        <label
                            class="form-label fw-semibold">

                            Search

                        </label>

                        <input

                            class="form-control"

                            placeholder="Search by company, title, location or skill..."

                            v-model="searchQuery"

                            @input="searchDrives">

                    </div>


                    <div class="col-md-3">

                        <label
                            class="form-label fw-semibold">

                            Job Type

                        </label>

                        <select

                            class="form-select"

                            v-model="selectedJobType"

                            @change="searchDrives">

                            <option value="all">

                                All Job Types

                            </option>

                            <option
                                v-for="type in jobTypes"
                                :key="type"
                                :value="type">

                                {{type}}

                            </option>

                        </select>

                    </div>


                    <div class="col-md-3">

                        <label
                            class="form-label fw-semibold">

                            Location

                        </label>

                        <select

                            class="form-select"

                            v-model="selectedLocation"

                            @change="searchDrives">

                            <option value="all">

                                All Locations

                            </option>

                            <option
                                v-for="location in locations"
                                :key="location"
                                :value="location">

                                {{location}}

                            </option>

                        </select>

                    </div>

                </div>

            </div>

        </div>


        <!-- Loading -->

        <div
            v-if="loading"
            class="text-center py-5">

            <div
                class="spinner-border">

            </div>

            <p class="text-muted mt-3">

                Loading placement drives...

            </p>

        </div>


        <!-- Drives -->

        <div
            v-else>

            <drive-card

                v-for="drive in filteredDrives"

                :key="drive.id"

                :drive="drive"

                :applied="
                    appliedDriveIds.includes(drive.id)
                "

                @view="viewDrive"

                @apply="applyDrive">

            </drive-card>


            <div
                v-if="filteredDrives.length === 0"
                class="text-center
                       text-muted
                       py-5">

                <i
                    class="bi bi-briefcase
                           display-5">

                </i>

                <h5 class="mt-3">

                    No placement drives found.

                </h5>

            </div>

        </div>


        <!-- Details Modal -->

        <div
            class="modal fade"
            :class="{ show: showDetails }"
            :style="{
                display: showDetails
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

                            Placement Drive Details

                        </h5>

                        <button

                            type="button"

                            class="btn-close"

                            @click="closeDetails">

                        </button>

                    </div>


                    <div
                        class="modal-body"
                        v-if="selectedDrive">


                        <h4 class="fw-bold">

                            {{selectedDrive.title}}

                        </h4>


                        <p class="text-muted">

                            <i
                                class="bi bi-building me-2">

                            </i>

                            {{selectedDrive.company_name}}

                        </p>


                        <hr>


                        <div class="row g-4">


                            <div class="col-md-6">

                                <label
                                    class="text-muted small">

                                    Job Type

                                </label>

                                <div class="fw-semibold">

                                    {{selectedDrive.job_type}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label
                                    class="text-muted small">

                                    Compensation

                                </label>

                                <div class="fw-semibold">

                                    {{selectedDrive.compensation}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label
                                    class="text-muted small">

                                    Location

                                </label>

                                <div>

                                    {{selectedDrive.location}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label
                                    class="text-muted small">

                                    Minimum CGPA

                                </label>

                                <div>

                                    {{selectedDrive.eligibility_cgpa}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label
                                    class="text-muted small">

                                    Drive Date

                                </label>

                                <div>

                                    {{formatDate(
                                        selectedDrive.drive_date
                                    )}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label
                                    class="text-muted small">

                                    Last Date to Apply

                                </label>

                                <div>

                                    {{formatDate(
                                        selectedDrive.last_date_to_apply
                                    )}}

                                </div>

                            </div>


                            <div class="col-12">

                                <label
                                    class="text-muted small">

                                    Required Skills

                                </label>

                                <div>

                                    {{selectedDrive.required_skills}}

                                </div>

                            </div>


                            <div class="col-12">

                                <label
                                    class="text-muted small">

                                    Selection Process

                                </label>

                                <div>

                                    {{selectedDrive.selection_process}}

                                </div>

                            </div>


                            <div class="col-12">

                                <label
                                    class="text-muted small">

                                    Description

                                </label>

                                <div>

                                    {{selectedDrive.description}}

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
                                selectedDrive &&
                                !appliedDriveIds.includes(
                                    selectedDrive.id
                                )
                            "

                            class="btn btn-primary"

                            @click="
                                closeDetails();
                                openApply(selectedDrive);
                            ">

                            <i
                                class="bi bi-send me-1">

                            </i>

                            Apply Now

                        </button>

                    </div>


                </div>

            </div>

        </div>


        <!-- Apply Modal -->

        <div
            class="modal fade"
            :class="{ show: showApply }"
            :style="{
                display: showApply
                    ? 'block'
                    : 'none'
            }"
            tabindex="-1">


            <div class="modal-dialog">


                <div class="modal-content">


                    <div class="modal-header">

                        <h5 class="modal-title">

                            Apply for Placement Drive

                        </h5>

                        <button

                            type="button"

                            class="btn-close"

                            @click="closeApply">

                        </button>

                    </div>


                    <div
                        class="modal-body"
                        v-if="selectedDrive">


                        <h6 class="fw-bold">

                            {{selectedDrive.title}}

                        </h6>


                        <p class="text-muted">

                            {{selectedDrive.company_name}}

                        </p>


                        <label
                            class="form-label fw-semibold">

                            Cover Letter

                            <span class="text-muted">

                                (Optional)

                            </span>

                        </label>


                        <textarea

                            class="form-control"

                            rows="5"

                            v-model="coverLetter"

                            placeholder="Write a short cover letter...">

                        </textarea>


                        <div
                        v-if="errorMessage"
                        class="alert alert-danger mt-3">

                        <i
                            class="bi bi-exclamation-triangle-fill me-1">

                        </i>

                        {{errorMessage}}

                    </div>


                    <div
                        v-if="successMessage"
                        class="alert alert-success mt-3">

                        <i
                            class="bi bi-check-circle-fill me-1">

                        </i>

                        {{successMessage}}

                    </div>


                    <div
                        v-if="!errorMessage && !successMessage"
                        class="alert alert-info mt-3">

                        <i
                            class="bi bi-info-circle me-1">

                        </i>

                        Your uploaded resume will be
                        submitted with this application.

                    </div>

                    </div>


                    <div class="modal-footer">

                        <button

                            class="btn btn-secondary"

                            @click="closeApply">

                            Cancel

                        </button>


                        <button

                            class="btn btn-primary"

                            :disabled="applying"

                            @click="submitApplication">

                            <span
                                v-if="applying"
                                class="spinner-border
                                       spinner-border-sm
                                       me-2">

                            </span>

                            {{applying
                                ? "Submitting..."
                                : "Submit Application"}}

                        </button>

                    </div>

                </div>

            </div>

        </div>


        <!-- Modal Backdrop -->

        <div

            v-if="showDetails || showApply"

            class="modal-backdrop fade show">

        </div>


    </div>

    `

};