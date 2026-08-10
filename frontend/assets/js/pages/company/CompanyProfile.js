const CompanyProfile = {

    emits: ["navigate"],

    data() {
        return {

            company: {
                company_name: "",
                industry_type: "",
                company_domain: "",
                website: "",
                hr_email: "",
                hr_contact: "",
                company_size: "",
                logo: "",
                location: "",
                govt_verification_id: "",
                description: "",
                approval_status: ""
            },

            loading: true,
            editMode: false,
            profileExists: false
        }
    },

    

    async mounted() {

        await this.loadProfile();

    },

    methods: {

        goBack() {

            this.$emit("navigate", "dashboard");

        },

        async loadProfile() {

            try {

                const response = await fetch("/company/profile", {

                    credentials: "include"

                });

                const result = await response.json();

                if (result.success) {

                    this.profileExists = result.profile_exists;

                    if (this.profileExists) {

                        this.company = result.data;

                    }

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

            }

            finally {

                this.loading = false;

            }

        },

        async saveProfile() {

            try {

                const response = await fetch("/company/profile", {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify(this.company)

                });

                const result = await response.json();

                if (result.success) {

                    alert(result.message);

                    this.editMode = false;

                    await this.loadProfile();

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

            }

        },

        

        async uploadLogo() {

            const file = this.$refs.logoInput.files[0];

            if (!file) {
                alert("Please choose an image.");
                return;
            }

            const formData = new FormData();
            formData.append("logo", file);

            try {

                const response = await fetch("/company/upload-logo", {

                    method: "POST",
                    credentials: "include",
                    body: formData

                });

                const result = await response.json();

                if (result.success) {

                    alert(result.message);

                    await this.loadProfile();

                    this.$refs.logoInput.value = "";

                }

                else {

                    alert(result.message);

                }

            }

            catch (error) {

                console.error(error);

            }

        },

        viewLogo() {

            window.open("/company/view-logo", "_blank");

        },

    },

    template: `

<div v-if="loading"
class="d-flex justify-content-center align-items-center"
style="height:70vh;">

    <div class="spinner-border text-primary"></div>

</div>

<div
v-else
class="profile-scroll">

    <!-- Back Button -->

    <div class="mb-3">

        <button
        class="btn btn-outline-secondary"
        @click="goBack">

            <i class="bi bi-arrow-left me-2"></i>

            Back to Dashboard

        </button>

    </div>

    <!-- Empty State -->

    <div
    v-if="!profileExists && !editMode"
    class="card shadow-sm border-0 text-center p-5">

        <i class="bi bi-buildings display-1 text-primary"></i>

        <h2 class="fw-bold mt-4">

            Welcome to Placement Park

        </h2>

        <p class="text-muted fs-5">

            Complete your company profile before creating placement drives.

        </p>

        <button
        class="btn btn-primary btn-lg px-4"
        @click="profileExists=true; editMode=true">

            Complete Company Profile

        </button>

    </div>

    <div
    v-else
    class="container-fluid">

        <div class="card shadow-sm border-0">

            <div class="card-body">

                <!-- Header -->

                <div
                class="d-flex justify-content-between align-items-center">

                    <div>

                        <h2 class="fw-bold">

                            {{ company.company_name || "Company Profile" }}

                        </h2>

                        <p class="text-muted">

                            {{ company.industry_type || "Industry" }}

                        </p>

                    </div>

                    <div>

                        <button
                        v-if="!editMode"
                        class="btn btn-primary"
                        @click="editMode=true">

                            Edit Profile

                        </button>

                        <div v-else>

                            <button
                            class="btn btn-success me-2"
                            @click="saveProfile">

                                Save

                            </button>

                            <button
                            class="btn btn-secondary"
                            @click="editMode=false">

                                Cancel

                            </button>

                        </div>

                    </div>

                </div>

                <hr>

                <h5 class="mb-3">

                    Company Information

                </h5>

                <div class="row">

                    <div class="col-md-6 mb-3">

                        <label class="form-label">

                            Company Name

                        </label>

                        <input
                        class="form-control"
                        v-model="company.company_name"
                        :disabled="!editMode">

                    </div>

                    <div class="col-md-6 mb-3">

                        <label class="form-label">

                            Industry Type

                        </label>

                        <input
                        class="form-control"
                        v-model="company.industry_type"
                        :disabled="!editMode">

                    </div>

                    <div class="col-md-6 mb-3">

                        <label class="form-label">

                            Company Domain

                        </label>

                        <input
                        class="form-control"
                        v-model="company.company_domain"
                        :disabled="!editMode">

                    </div>

                    <div class="col-md-6 mb-3">

                        <label class="form-label">

                            Company Size

                        </label>

                        <input
                        type="number"
                        class="form-control"
                        v-model="company.company_size"
                        :disabled="!editMode">

                    </div>

                </div>

                <hr>

                <h5 class="mb-3">

                    Contact Information

                </h5>
                <div class="row">

                    <div class="col-md-6 mb-3">

                        <label class="form-label">

                            Website

                        </label>

                        <input
                            class="form-control"
                            v-model="company.website"
                            :disabled="!editMode">

                    </div>

                    <div class="col-md-6 mb-3">

                        <label class="form-label">

                            HR Email

                        </label>

                        <input
                            class="form-control"
                            v-model="company.hr_email"
                            :disabled="!editMode">

                    </div>

                    <div class="col-md-6 mb-3">

                        <label class="form-label">

                            HR Contact

                        </label>

                        <input
                            class="form-control"
                            v-model="company.hr_contact"
                            :disabled="!editMode">

                    </div>

                    <div class="col-md-6 mb-3">

                        <label class="form-label">

                            Location

                        </label>

                        <input
                            class="form-control"
                            v-model="company.location"
                            :disabled="!editMode">

                    </div>

                </div>

                <hr>

                <h5 class="mb-3">

                    Verification

                </h5>

                <div class="row">

                    <div class="col-md-6 mb-3">

                        <label class="form-label">

                            Government Verification ID

                        </label>

                        <input
                            class="form-control"
                            v-model="company.govt_verification_id"
                            :disabled="!editMode">

                    </div>

                    <div class="col-md-6 mb-3">

                        <label class="form-label">

                            Approval Status

                        </label>

                        <input
                            class="form-control"
                            :value="company.approval_status || 'Pending'"
                            disabled>

                    </div>

                </div>

                <hr>

                <h5 class="mb-3">

                    About Company

                </h5>

                <div class="mb-4">

                    <label class="form-label">

                        Description

                    </label>

                    <textarea
                        rows="5"
                        class="form-control"
                        v-model="company.description"
                        :disabled="!editMode">

                    </textarea>

                </div>

                <!-- Logo Card -->

                <div class="card shadow-sm border-0 mt-4">

                    <div class="card-header bg-white">

                        <h5 class="mb-0">

                            <i class="bi bi-building text-primary me-2"></i>

                            Company Logo

                        </h5>

                    </div>

                    <div class="card-body">

                        <div class="d-flex align-items-center mb-3">

                            <i
                                class="bi bi-building-fill text-primary fs-1 me-3">
                            </i>

                            <div>

                                <h6 class="mb-1">

                                    Company Logo

                                </h6>

                                <small class="text-muted">

                                    {{ company.logo ? "Logo Uploaded" : "No Logo Uploaded" }}

                                </small>

                            </div>

                        </div>

                        <div class="row align-items-center">

                            <div class="col-md-8">

                                <input
                                    type="file"
                                    class="form-control"
                                    ref="logoInput"
                                    accept=".png,.jpg,.jpeg"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-4 text-end">

                                <button
                                    class="btn btn-primary"
                                    :disabled="!editMode"
                                    @click="uploadLogo">

                                    <i class="bi bi-upload me-2"></i>

                                    Upload Logo

                                </button>

                                <button
                                    v-if="company.logo"
                                    class="btn btn-outline-success ms-2"
                                    @click="viewLogo">

                                    <i class="bi bi-eye me-2"></i>

                                    View

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>

</div>

`

}