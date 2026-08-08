const DriveApprovals = {

    data(){

        return{

            loading:true,

            drives:[],

            filteredDrives:[],

            searchQuery:"",

            selectedJobType:"all",

            selectedSort:"newest",

            currentPage:1,

            itemsPerPage:6,

            selectedDrive:null,

            rejectReason:"",

            rejectDriveId:null,

            detailsModal:null,

            rejectModal:null

        }

    },

    computed:{

        paginatedDrives(){

            const start=(this.currentPage-1)*this.itemsPerPage;

            return this.filteredDrives.slice(
                start,
                start+this.itemsPerPage
            );

        },

        totalPages(){

            return Math.ceil(
                this.filteredDrives.length/
                this.itemsPerPage
            );

        }
    },

    async mounted(){

        this.detailsModal=new bootstrap.Modal(

            document.getElementById(
                "driveDetailsModal"
            )

        );

        this.rejectModal=new bootstrap.Modal(

            document.getElementById(
                "rejectDriveModal"
            )

        );

        await this.loadDrives();

    },

    methods:{

        async loadDrives(){

            this.loading=true;

            try{

                const result=
                    await adminService.getPendingDrives();

                if(result.success){

                    this.drives=result.drives || [];

                    this.applyFilters();

                }

            }

            finally{

                this.loading=false;

            }

        },

        applyFilters(){

            let data=[...this.drives];

            if(this.searchQuery){

                const q=this.searchQuery.toLowerCase();

                data=data.filter(drive=>

                    drive.title
                        .toLowerCase()
                        .includes(q)

                );

            }

            if(this.selectedJobType!="all"){

                data=data.filter(drive=>

                    drive.job_type==
                    this.selectedJobType

                );

            }

            if(this.selectedSort=="newest"){

                data.sort(

                    (a,b)=>

                    new Date(b.created_at)-

                    new Date(a.created_at)

                );

            }

            if(this.selectedSort=="oldest"){

                data.sort(

                    (a,b)=>

                    new Date(a.created_at)-

                    new Date(b.created_at)

                );

            }

            this.filteredDrives=data;

            this.currentPage=1;

        },

        async approveDrive(id){

            const result=
                await adminService.approveDrive(id);

            if(result.success){

                await this.loadDrives();

            }

            else{

                alert(result.message);

            }

        },

        async openDetails(id){

            const result=
                await adminService.getDrive(id);

            if(result.success){

                this.selectedDrive=result.drive;

                this.detailsModal.show();

            }

        },

        openReject(id){

            this.rejectDriveId=id;

            this.rejectReason="";

            this.rejectModal.show();

        },

        async submitReject(){

            const result=
                await adminService.rejectDrive(

                    this.rejectDriveId,

                    this.rejectReason

                );

            if(result.success){

                this.rejectModal.hide();

                await this.loadDrives();

            }

            else{

                alert(result.message);

            }

        }

    },

    template:
    `
    <div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">

        <div>

            <h2 class="fw-bold">

                Placement Drive Approval Center

            </h2>

            <p class="text-muted mb-0">

                Review and approve placement drives submitted by companies

            </p>

        </div>

        <span class="badge bg-warning text-dark fs-6">

            {{filteredDrives.length}} Pending

        </span>

    </div>



    <div class="card border-0 shadow-sm rounded-4 mb-4">

        <div class="card-body">

            <div class="row g-3">

                <div class="col-lg-5">

                    <div class="input-group">

                        <span class="input-group-text">

                            <i class="bi bi-search"></i>

                        </span>

                        <input

                            class="form-control"

                            placeholder="Search Placement Drive"

                            v-model="searchQuery"

                            @input="applyFilters">

                    </div>

                </div>

                <div class="col-lg-3">

                    <select

                        class="form-select"

                        v-model="selectedJobType"

                        @change="applyFilters">

                        <option value="all">

                            All Job Types

                        </option>

                        <option value="Intern">

                            Internship

                        </option>

                        <option value="Full Time">

                            Full Time

                        </option>

                        <option value="Intern + Full Time">

                            Internship + Full Time

                        </option>

                    </select>

                </div>

                <div class="col-lg-4">

                    <select

                        class="form-select"

                        v-model="selectedSort"

                        @change="applyFilters">

                        <option value="newest">

                            Newest First

                        </option>

                        <option value="oldest">

                            Oldest First

                        </option>

                    </select>

                </div>

            </div>

        </div>

    </div>



    <div

        v-if="loading"

        class="text-center py-5">

        <div

            class="spinner-border text-primary">

        </div>

    </div>



    <div

        v-else

        class="row g-4">
        
        <div

        class="col-lg-4"

        v-for="drive in paginatedDrives"

        :key="drive.id">

        <approval-card

            :item-id="drive.id"

            :title="drive.title"

            :subtitle="drive.company_name"

            :primary-info="drive.job_type"

            :secondary-info="drive.location"

            :tertiary-info="drive.package_lpa + ' LPA'"

            :date="drive.created_at"

            @details="openDetails"

            @approve="approveDrive"

            @reject="openReject">

        </approval-card>

    </div>

    </div>

    </div>
        <div
        v-if="!loading"
        class="mt-4">

        <nav
            v-if="totalPages>1">

            <ul class="pagination justify-content-center">

                <li
                    class="page-item"
                    :class="{disabled:currentPage===1}">

                    <button

                        class="page-link"

                        @click="currentPage--"

                        :disabled="currentPage===1">

                        Previous

                    </button>

                </li>

                <li

                    v-for="page in totalPages"

                    :key="page"

                    class="page-item"

                    :class="{active:page===currentPage}">

                    <button

                        class="page-link"

                        @click="currentPage=page">

                        {{page}}

                    </button>

                </li>

                <li

                    class="page-item"

                    :class="{disabled:currentPage===totalPages}">

                    <button

                        class="page-link"

                        @click="currentPage++"

                        :disabled="currentPage===totalPages">

                        Next

                    </button>

                </li>

            </ul>

        </nav>

    </div>



    <!-- Drive Details Modal -->

<div
    class="modal fade"
    id="driveDetailsModal"
    tabindex="-1">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <div class="modal-header">

                <h5 class="modal-title">
                    Placement Drive Details
                </h5>

                <button
                    class="btn-close"
                    data-bs-dismiss="modal">
                </button>

            </div>

            <div
                class="modal-body"
                v-if="selectedDrive">

                <div class="row g-4">

                    <div class="col-md-6">

                        <label class="fw-semibold text-muted">
                            Job Title
                        </label>

                        <p class="fs-5 fw-bold mb-0">
                            {{selectedDrive.title}}
                        </p>

                    </div>

                    <div class="col-md-6">

                        <label class="fw-semibold text-muted">
                            Company
                        </label>

                        <p class="mb-0">
                            {{selectedDrive.company_name}}
                        </p>

                    </div>

                    <div class="col-md-6">

                        <label class="fw-semibold text-muted">
                            Job Type
                        </label>

                        <p class="mb-0">
                            {{selectedDrive.job_type}}
                        </p>

                    </div>

                    <div class="col-md-6">

                        <label class="fw-semibold text-muted">
                            Compensation
                        </label>

                        <p class="mb-0">
                            {{selectedDrive.compensation}}
                        </p>

                    </div>

                    <div class="col-md-6">

                        <label class="fw-semibold text-muted">
                            Eligibility CGPA
                        </label>

                        <p class="mb-0">
                            {{selectedDrive.eligibility_cgpa}}
                        </p>

                    </div>

                    <div class="col-md-6">

                        <label class="fw-semibold text-muted">
                            Location
                        </label>

                        <p class="mb-0">
                            {{selectedDrive.location}}
                        </p>

                    </div>

                    <div class="col-md-6">

                        <label class="fw-semibold text-muted">
                            Drive Date
                        </label>

                        <p class="mb-0">
                            {{selectedDrive.drive_date}}
                        </p>

                    </div>

                    <div class="col-md-6">

                        <label class="fw-semibold text-muted">
                            Last Date To Apply
                        </label>

                        <p class="mb-0">
                            {{selectedDrive.last_date_to_apply}}
                        </p>

                    </div>

                    <div class="col-12">

                        <label class="fw-semibold text-muted">
                            Required Skills
                        </label>

                        <div class="border rounded-3 p-3 bg-light">
                            {{selectedDrive.required_skills}}
                        </div>

                    </div>

                    <div class="col-12">

                        <label class="fw-semibold text-muted">
                            Selection Process
                        </label>

                        <div class="border rounded-3 p-3 bg-light">
                            {{selectedDrive.selection_process}}
                        </div>

                    </div>

                    <div class="col-12">

                        <label class="fw-semibold text-muted">
                            Recruitment Rounds
                        </label>

                        <div class="row g-2">

                            <div
                                class="col-md-3"
                                v-if="selectedDrive.round1_required">

                                <span class="badge bg-primary w-100 py-2">
                                    {{selectedDrive.round1_name}}
                                </span>

                            </div>

                            <div
                                class="col-md-3"
                                v-if="selectedDrive.round2_required">

                                <span class="badge bg-success w-100 py-2">
                                    {{selectedDrive.round2_name}}
                                </span>

                            </div>

                            <div
                                class="col-md-3"
                                v-if="selectedDrive.round3_required">

                                <span class="badge bg-warning text-dark w-100 py-2">
                                    {{selectedDrive.round3_name}}
                                </span>

                            </div>

                            <div
                                class="col-md-3"
                                v-if="selectedDrive.round4_required">

                                <span class="badge bg-danger w-100 py-2">
                                    {{selectedDrive.round4_name}}
                                </span>

                            </div>

                        </div>

                    </div>

                    <div class="col-12">

                        <label class="fw-semibold text-muted">
                            Job Description
                        </label>

                        <div class="border rounded-3 p-3 bg-light">
                            {{selectedDrive.description}}
                        </div>

                    </div>

                </div>

            </div>

            <div class="modal-footer">

                <button
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">

                    Close

                </button>

            </div>

        </div>

    </div>

</div>



    <!-- Reject Modal -->

    <div

        class="modal fade"

        id="rejectDriveModal"

        tabindex="-1">

        <div class="modal-dialog">

            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="modal-title">

                        Reject Drive

                    </h5>

                    <button

                        class="btn-close"

                        data-bs-dismiss="modal">

                    </button>

                </div>

                <div class="modal-body">

                    <label class="form-label">

                        Rejection Reason

                    </label>

                    <textarea

                        class="form-control"

                        rows="5"

                        v-model="rejectReason">

                    </textarea>

                </div>

                <div class="modal-footer">

                    <button

                        class="btn btn-secondary"

                        data-bs-dismiss="modal">

                        Cancel

                    </button>

                    <button

                        class="btn btn-danger"

                        @click="submitReject">

                        Reject Drive

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>


    `




}