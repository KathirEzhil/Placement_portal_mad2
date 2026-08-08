const CompanyApprovals = {

    data() {

        return {

            loading: true,

            companies: [],

            filteredCompanies: [],

            searchQuery: "",

            selectedFilter: "all",

            selectedSort: "newest",

            currentPage: 1,

            itemsPerPage: 6,

            selectedCompany: null,

            rejectReason: "",

            rejectCompanyId: null,

            detailsModal: null,

            rejectModal: null

        }

    },

    computed: {

        paginatedCompanies() {

            const start =
                (this.currentPage - 1) *
                this.itemsPerPage;

            return this.filteredCompanies.slice(
                start,
                start + this.itemsPerPage
            );

        },

        totalPages() {

            return Math.ceil(

                this.filteredCompanies.length /

                this.itemsPerPage

            );

        }

    },

    async mounted() {

        this.detailsModal = new bootstrap.Modal(
            document.getElementById("companyDetailsModal")
        );

        this.rejectModal = new bootstrap.Modal(
            document.getElementById("rejectCompanyModal")
        );

        if(this.$root.selectedCompanyId){

            this.openDetails(this.$root.selectedCompanyId);

        }

        await this.loadCompanies();

    },

    methods: {

        async loadCompanies() {

            this.loading = true;

            try {

                const result =
                    await adminService.getPendingCompanies();

                if (result.success) {

                    this.companies =
                        result.companies || [];

                    this.applyFilters();

                }

            }

            finally {

                this.loading = false;

            }

        },

        applyFilters() {

            let data = [...this.companies];

            if (this.searchQuery) {

                const query =
                    this.searchQuery.toLowerCase();

                data = data.filter(company =>

                    company.company_name
                        .toLowerCase()
                        .includes(query)

                );

            }

            if (this.selectedFilter === "large") {

                data = data.filter(company =>

                    company.company_size >= 1000

                );

            }

            if (this.selectedFilter === "small") {

                data = data.filter(company =>

                    company.company_size < 1000

                );

            }

            if (this.selectedSort === "name") {

                data.sort((a, b) =>

                    a.company_name.localeCompare(
                        b.company_name
                    )

                );

            }

            if (this.selectedSort === "newest") {

                data.sort((a, b) =>

                    new Date(b.created_at) -

                    new Date(a.created_at)

                );

            }

            if (this.selectedSort === "oldest") {

                data.sort((a, b) =>

                    new Date(a.created_at) -

                    new Date(b.created_at)

                );

            }

            this.filteredCompanies = data;

            this.currentPage = 1;

        },

        async approveCompany(companyId) {

            const result =
                await adminService.approveCompany(
                    companyId
                );

            if (result.success) {

                await this.loadCompanies();

            }

            else {

                alert(result.message);

            }

        },

        async openDetails(companyId) {

            console.log("Company ID:", companyId);

            const result = await adminService.getCompany(companyId);

            console.log("API Result:", result);

            if(result.success){

                this.selectedCompany = result.company;

                console.log(this.detailsModal);
                console.log(this.selectedCompany);

                this.detailsModal.show();

            }else{

                alert(result.message);

            }

        },

        openReject(companyId) {

            this.rejectCompanyId =
                companyId;

            this.rejectReason = "";

            this.rejectModal.show();

        },

        async submitReject() {

            if (!this.rejectReason.trim()) {

                alert(
                    "Please enter rejection reason."
                );

                return;

            }

            const result =
                await adminService.rejectCompany(

                    this.rejectCompanyId,

                    this.rejectReason

                );

            if (result.success) {

                this.rejectModal.hide();

                await this.loadCompanies();

            }

            else {

                alert(result.message);

            }

        }

    },

    template:`

<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">

        <div>

            <h2 class="fw-bold">

                Company Approval Center

            </h2>

            <p class="text-muted mb-0">

                Review and verify newly registered companies

            </p>

        </div>

        <span class="badge bg-warning text-dark fs-6">

            {{filteredCompanies.length}} Pending

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

                            placeholder="Search Company"

                            v-model="searchQuery"

                            @input="applyFilters">

                    </div>

                </div>

                <div class="col-lg-3">

                    <select

                        class="form-select"

                        v-model="selectedFilter"

                        @change="applyFilters">

                        <option value="all">

                            All Companies

                        </option>

                        <option value="large">

                            Large Companies

                        </option>

                        <option value="small">

                            Small Companies

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

                        <option value="name">

                            Company Name

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

            v-for="company in paginatedCompanies"

            :key="company.id">

            <approval-card

                :item-id="company.id"

                :title="company.company_name"

                :subtitle="company.industry_type"

                :primary-info="company.website"

                :secondary-info="company.location"

                :tertiary-info="company.company_size + ' Employees'"

                :date="company.created_at"

                @approve="approveCompany"

                @details="openDetails"

                @reject="openReject">

            </approval-card>

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



    <!-- Company Details Modal -->

    <div

        class="modal fade"

        id="companyDetailsModal"

        tabindex="-1">

        <div class="modal-dialog modal-lg">

            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="modal-title">

                        Company Details

                    </h5>

                    <button

                        class="btn-close"

                        data-bs-dismiss="modal">

                    </button>

                </div>

                <div
                    class="modal-body"
                    v-if="selectedCompany">

                    <div class="row g-3">

                        <div class="col-md-6">

                            <label class="fw-semibold">

                                Company Name

                            </label>

                            <p>

                                {{selectedCompany.company_name}}

                            </p>

                        </div>

                        <div class="col-md-6">

                            <label class="fw-semibold">

                                Industry

                            </label>

                            <p>

                                {{selectedCompany.industry_type}}

                            </p>

                        </div>

                        <div class="col-md-6">

                            <label class="fw-semibold">

                                Website

                            </label>

                            <p>

                                {{selectedCompany.website}}

                            </p>

                        </div>

                        <div class="col-md-6">

                            <label class="fw-semibold">

                                Domain

                            </label>

                            <p>

                                {{selectedCompany.company_domain}}

                            </p>

                        </div>

                        <div class="col-md-6">

                            <label class="fw-semibold">

                                HR Email

                            </label>

                            <p>

                                {{selectedCompany.hr_email}}

                            </p>

                        </div>

                        <div class="col-md-6">

                            <label class="fw-semibold">

                                HR Contact

                            </label>

                            <p>

                                {{selectedCompany.hr_contact}}

                            </p>

                        </div>

                        <div class="col-md-6">

                            <label class="fw-semibold">

                                Employees

                            </label>

                            <p>

                                {{selectedCompany.company_size}}

                            </p>

                        </div>

                        <div class="col-md-6">

                            <label class="fw-semibold">

                                Location

                            </label>

                            <p>

                                {{selectedCompany.location}}

                            </p>

                        </div>

                        <div class="col-12">

                            <label class="fw-semibold">

                                Description

                            </label>

                            <p>

                                {{selectedCompany.description}}

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>



    <!-- Reject Modal -->

    <div

        class="modal fade"

        id="rejectCompanyModal"

        tabindex="-1">

        <div class="modal-dialog">

            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="modal-title">

                        Reject Company

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

                        Reject Company

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>

`

}