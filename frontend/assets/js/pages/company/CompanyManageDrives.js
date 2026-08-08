const CompanyManageDrives = {

    emits: ["navigate", "edit-drive", "open-applicants"],

    data() {

        return {

            loading: true,

            selectedDrive: null,

            showModal: false,

            drives: []

        }

    },

    async mounted() {

        await this.loadDrives();

    },

    methods: {

        async loadDrives() {

            this.loading = true;

            try {

                const response = await fetch("/company/drives", {

                    credentials: "include"

                });

                const result = await response.json();

                if(result.success){

                    this.drives = result.drives;

                }

                else{

                    alert(result.message);

                }

            }

            catch(error){

                console.error(error);

                alert("Failed to load placement drives.");

            }

            finally{

                this.loading = false;

            }

        },

        editDrive(driveId) {

            this.$emit("edit-drive", driveId);

        },

        async viewDrive(driveId){

            try{

                const response = await fetch(`/company/drives/${driveId}`,{

                    credentials:"include"

                });

                const result = await response.json();

                if(result.success){

                    this.selectedDrive = result.drive;

                    this.showModal = true;

                }

                else{

                    alert(result.message);

                }

            }

            catch(error){

                console.error(error);

            }

        }

    },

    template:`

<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">

        <h2 class="fw-bold">

            <i class="bi bi-list-task text-primary me-2"></i>

            Manage Placement Drives

        </h2>

        <button
        class="btn btn-primary"
        @click="$emit('navigate','create-drive')">

            <i class="bi bi-plus-circle me-2"></i>

            Create Drive

        </button>

    </div>

    <div
    v-if="loading"
    class="text-center py-5">

        <div class="spinner-border text-primary"></div>

    </div>

    <div
    v-else-if="drives.length===0"
    class="card shadow-sm">

        <div class="card-body text-center py-5">

            <i
            class="bi bi-folder2-open display-3 text-primary">
            </i>

            <h4 class="mt-3">

                No Placement Drives

            </h4>

            <p class="text-muted">

                Create your first placement drive.

            </p>

        </div>

    </div>

    <div
    v-else
    class="row">

        <div
        class="col-lg-6 mb-4"
        v-for="drive in drives"
        :key="drive.id">

            <div class="card shadow-sm h-100">

                <div class="card-body">

                    <div
                    class="d-flex justify-content-between">

                        <h5 class="fw-bold">

                            {{ drive.title }}

                        </h5>

                        <span
                        class="badge"
                        :class="{

                            'bg-warning text-dark': drive.status==='pending',

                            'bg-success': drive.status==='approved',

                            'bg-secondary': drive.status==='closed'

                        }">

                            {{ drive.status }}

                        </span>

                    </div>

                    <hr>

                    <p>

                        <i class="bi bi-briefcase me-2"></i>

                        {{ drive.job_type }}

                    </p>

                    <p>

                        <i class="bi bi-geo-alt me-2"></i>

                        {{ drive.location }}

                    </p>

                    <p>

                        <i class="bi bi-currency-rupee me-2"></i>

                        {{ drive.compensation }}

                    </p>

                    <p>

                        <i class="bi bi-calendar-event me-2"></i>

                        {{ drive.drive_date }}

                    </p>

                    <div class="mt-3">

                        <button
                        class="btn btn-outline-primary btn-sm me-2"
                        @click="viewDrive(drive.id)">

                            View

                        </button>

                        <button
                        v-if="drive.status ==='pending'"
                        class="btn btn-warning btn-sm"
                        @click="$emit('edit-drive', drive.id)">

                        <i class="bi bi-pencil me-1"></i>

                            Edit

                        </button>

                        <button
                            v-else
                            class="btn btn-success btn-sm"
                            @click="$emit('open-applicants', drive.id)">

                            <i class="bi bi-people me-1"></i>

                            Applicants

                        </button>

                    </div>

                </div>

            </div>
            <div
            v-if="showModal"
            class="modal fade show d-block"
            style="background:rgba(0,0,0,.5);">

            <div class="modal-dialog modal-lg">

            <div class="modal-content">

            <div class="modal-header">

            <h5>

            {{ selectedDrive.title }}

            </h5>

            <button
            class="btn-close"
            @click="showModal=false">

            </button>

            </div>

            <div class="modal-body">

            <p>

            <b>Job Type :</b>

            {{ selectedDrive.job_type }}

            </p>

            <p>

            <b>Compensation :</b>

            {{ selectedDrive.compensation }}

            </p>

            <p>

            <b>Location :</b>

            {{ selectedDrive.location }}

            </p>

            <p>

            <b>CGPA :</b>

            {{ selectedDrive.eligibility_cgpa }}

            </p>

            <p>

            <b>Required Skills :</b>

            {{ selectedDrive.required_skills }}

            </p>

            <p>

            <b>Description :</b>

            {{ selectedDrive.description }}

            </p>

            <p>

            <b>Selection Process :</b>

            {{ selectedDrive.selection_process }}

            </p>

            <p>

            <b>Drive Date :</b>

            {{ selectedDrive.drive_date }}

            </p>

            <p>

            <b>Apply Before :</b>

            {{ selectedDrive.last_date_to_apply }}

            </p>

            </div>

            <div class="modal-footer">

            <button
            class="btn btn-secondary"
            @click="showModal=false">

            Close

            </button>

            </div>

            </div>

            </div>

            </div>

        </div>

    </div>

</div>

`

}