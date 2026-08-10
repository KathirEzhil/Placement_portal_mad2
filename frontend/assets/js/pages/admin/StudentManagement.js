const StudentManagement = {

    data() {

        return {

            loading: true,

            students: [],

            filteredStudents: [],

            searchQuery: "",

            selectedBranch: "all",

            selectedStatus: "all",

            currentPage: 1,

            itemsPerPage: 8,

            selectedStudent: null,

            showDetails: false,

            applications: [],

            loadingApplications: false,

            showApplications: false,

            activeTab: "students",

            companies: [],

            filteredCompanies: [],

            companySearchQuery: "",

            selectedCompany: null,

            showCompanyDetails: false,

            loadingCompanies: false

            // studentService: window.studentService

        };

    },


    computed: {

        branches() {

            const values = this.students
                .map(student => student.branch)
                .filter(Boolean);

            return [...new Set(values)].sort();

        },


        paginatedStudents() {

            const start =
                (this.currentPage - 1) *
                this.itemsPerPage;

            return this.filteredStudents.slice(
                start,
                start + this.itemsPerPage
            );

        },


        totalPages() {

            return Math.ceil(
                this.filteredStudents.length /
                this.itemsPerPage
            );

        }

    },


    async mounted() {

        await this.loadStudents();

        await this.loadCompanies();

    },


    methods: {

        async loadStudents() {

            this.loading = true;

            try {

                const result =
                    await studentService.getStudents();

                if (result.success) {

                    this.students =
                        result.students || [];

                    this.filterStudents();

                }

                else {

                    alert(
                        result.message ||
                        "Failed to load students."
                    );

                }

            }

            catch(error) {

                console.error(
                    "Student loading error:",
                    error
                );

            }

            finally {

                this.loading = false;

            }

        },


        filterStudents() {

            const search =
                this.searchQuery
                    .trim()
                    .toLowerCase();


            this.filteredStudents =
                this.students.filter(student => {

                    const matchesSearch =
                        !search ||

                        (student.full_name || "")
                            .toLowerCase()
                            .includes(search) ||

                        (student.roll_number || "")
                            .toLowerCase()
                            .includes(search) ||

                        (student.college_email || "")
                            .toLowerCase()
                            .includes(search);


                    const matchesBranch =
                        this.selectedBranch === "all" ||

                        student.branch ===
                        this.selectedBranch;


                    const matchesStatus =
                        this.selectedStatus === "all" ||

                        student.placement_status ===
                        this.selectedStatus;


                    return (
                        matchesSearch &&
                        matchesBranch &&
                        matchesStatus
                    );

                });


            this.currentPage = 1;

        },


        async openDetails(student) {

            try {

                const result =
                    await studentService
                        .getStudentDetails(
                            student.id
                        );


                if (result.success) {

                    this.selectedStudent =
                        result.student;

                    this.showDetails = true;

                }

                else {

                    alert(
                        result.message ||
                        "Unable to load student details."
                    );

                }

            }

            catch(error) {

                console.error(
                    "Student details error:",
                    error
                );

            }

        },


        closeDetails() {

            this.showDetails = false;

            this.selectedStudent = null;

        },


        async openApplications(student) {

            this.loadingApplications = true;

            this.showApplications = true;

            this.applications = [];


            try {

                const result =
                    await studentService
                        .getStudentApplications(
                            student.id
                        );


                if (result.success) {

                    this.applications =
                        result.applications || [];

                }

                else {

                    alert(
                        result.message ||
                        "Unable to load applications."
                    );

                }

            }

            catch(error) {

                console.error(
                    "Application loading error:",
                    error
                );

            }

            finally {

                this.loadingApplications = false;

            }

        },


        closeApplications() {

            this.showApplications = false;

            this.applications = [];

        },


        previousPage() {

            if (this.currentPage > 1) {

                this.currentPage--;

            }

        },


        nextPage() {

            if (
                this.currentPage <
                this.totalPages
            ) {

                this.currentPage++;

            }

        },


        formatDate(value) {

            if (!value) {

                return "-";

            }

            return new Date(value)
                .toLocaleDateString();

        },


        statusClass(status) {

            if (status === "Placed") {

                return "bg-success";

            }

            if (status === "Applied") {

                return "bg-warning text-dark";

            }

            return "bg-secondary";

        },


        applicationStatusClass(status) {

            if (status === "selected") {

                return "bg-success";

            }

            if (status === "shortlisted") {

                return "bg-info text-dark";

            }

            if (status === "rejected") {

                return "bg-danger";

            }

            if (status === "withdrawn") {

                return "bg-secondary";

            }

            return "bg-primary";

        },

        getResumeUrl(studentId){

            return `/admin/student/${studentId}/resume`;

        },

        async loadCompanies() {

            this.loadingCompanies = true;

            try {

                const result =
                    await adminService.getAllCompanies();

                if (result.success) {

                    this.companies =
                        result.companies || [];

                    this.filterCompanies();

                }

                else {

                    alert(
                        result.message ||
                        "Failed to load companies."
                    );

                }

            }

            catch(error) {

                console.error(
                    "Company loading error:",
                    error
                );

            }

            finally {

                this.loadingCompanies = false;

            }

        },

        filterCompanies() {

            const search =
                this.companySearchQuery
                    .trim()
                    .toLowerCase();

            this.filteredCompanies =
                this.companies.filter(company => {

                    if (!search) {
                        return true;
                    }

                    return (

                        (company.company_name || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (company.industry_type || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (company.location || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (company.hr_email || "")
                            .toLowerCase()
                            .includes(search)

                    );

                });

        },

        async toggleStudentStatus(student) {

            const action =
                student.is_active
                    ? "deactivate"
                    : "activate";

            const confirmed = confirm(
                `Are you sure you want to ${action} ${student.full_name}?`
            );

            if (!confirmed) {
                return;
            }

            try {

                const result =
                    await studentService.updateStudentStatus(
                        student.id,
                        !student.is_active
                    );

                if (result.success) {

                    student.is_active =
                        result.is_active;

                }

                else {

                    alert(
                        result.message ||
                        "Unable to update student status."
                    );

                }

            }

            catch(error) {

                console.error(
                    "Student status error:",
                    error
                );

                alert(
                    "Unable to update student status."
                );

            }

        },

        async toggleCompanyStatus(company) {

            const action =
                company.is_active
                    ? "deactivate"
                    : "activate";

            const confirmed = confirm(
                `Are you sure you want to ${action} ${company.company_name}?`
            );

            if (!confirmed) {
                return;
            }

            try {

                const result =
                    await adminService.updateCompanyStatus(
                        company.id,
                        !company.is_active
                    );

                if (result.success) {

                    company.is_active =
                        result.is_active;

                }

                else {

                    alert(
                        result.message ||
                        "Unable to update company status."
                    );

                }

            }

            catch(error) {

                console.error(
                    "Company status error:",
                    error
                );

                alert(
                    "Unable to update company status."
                );

            }

        },

        accountStatusClass(isActive) {

            return isActive
                ? "bg-success"
                : "bg-danger";

        },

        accountStatusText(isActive) {

            return isActive
                ? "Active"
                : "Deactivated";

        },

    },


    template: `

    <div class="container-fluid py-4">


        <!-- Header -->

        <div class="d-flex
                    justify-content-between
                    align-items-center
                    mb-4">

            <div>

                <h2 class="fw-bold mb-1">

                    <i class="bi bi-people-fill me-2"></i>

                    User Management

                </h2>

                <p class="text-muted mb-0">

                    Search and manage students and companies

                </p>

            </div>


            <span
                v-if="activeTab === 'students'"
                class="badge bg-primary rounded-pill px-3 py-2">

                {{ filteredStudents.length }} Students

            </span>

            <span
                v-else
                class="badge bg-primary rounded-pill px-3 py-2">

                {{ filteredCompanies.length }} Companies

            </span>

        </div>

        <!-- USER TYPE TABS -->

            <div class="d-flex gap-2 mb-4">

                <button
                    class="btn"
                    :class="
                        activeTab === 'students'
                            ? 'btn-primary'
                            : 'btn-outline-primary'
                    "
                    @click="activeTab = 'students'">

                    <i class="bi bi-mortarboard me-2"></i>

                    Students

                    <span class="badge bg-light text-dark ms-2">

                        {{ students.length }}

                    </span>

                </button>


                <button
                    class="btn"
                    :class="
                        activeTab === 'companies'
                            ? 'btn-primary'
                            : 'btn-outline-primary'
                    "
                    @click="activeTab = 'companies'">

                    <i class="bi bi-building me-2"></i>

                    Companies

                    <span class="badge bg-light text-dark ms-2">

                        {{ companies.length }}

                    </span>

                </button>

            </div>


        <!-- Filters -->

        <!-- student section -->

        <div v-if="activeTab === 'students'">

        <div class="card
                    border-0
                    shadow-sm
                    rounded-4
                    mb-4">

            <div class="card-body">

                <div class="row g-3">


                    <div class="col-lg-6">

                        <label class="form-label fw-semibold">

                            Search Students

                        </label>

                        <div class="input-group">

                            <span class="input-group-text">

                                <i class="bi bi-search"></i>

                            </span>

                            <input

                                type="text"

                                class="form-control"

                                placeholder="Name, roll number or email"

                                v-model="searchQuery"

                                @input="filterStudents">

                        </div>

                    </div>


                    <div class="col-md-3">

                        <label class="form-label fw-semibold">

                            Branch

                        </label>

                        <select

                            class="form-select"

                            v-model="selectedBranch"

                            @change="filterStudents">

                            <option value="all">

                                All Branches

                            </option>

                            <option

                                v-for="branch in branches"

                                :key="branch"

                                :value="branch">

                                {{branch}}

                            </option>

                        </select>

                    </div>


                    <div class="col-md-3">

                        <label class="form-label fw-semibold">

                            Placement Status

                        </label>

                        <select

                            class="form-select"

                            v-model="selectedStatus"

                            @change="filterStudents">

                            <option value="all">

                                All Students

                            </option>

                            <option value="Placed">

                                Placed

                            </option>

                            <option value="Applied">

                                Applied

                            </option>

                            <option value="Not Placed">

                                Not Placed

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

                class="spinner-border text-primary">

            </div>

            <p class="text-muted mt-3">

                Loading students...

            </p>

        </div>


        <!-- Empty -->

        <div

            v-else-if="filteredStudents.length === 0"

            class="card
                   border-0
                   shadow-sm
                   rounded-4">

            <div class="card-body text-center py-5">

                <i class="bi bi-people
                          display-4
                          text-muted">

                </i>

                <h5 class="mt-3">

                    No Students Found

                </h5>

                <p class="text-muted">

                    Try changing your search or filters.

                </p>

            </div>

        </div>


        <!-- Student Table -->

        <div

            v-else

            class="card
                   border-0
                   shadow-sm
                   rounded-4">

            <div class="card-body">


                <div class="table-responsive">

                    <table class="table
                                  align-middle
                                  mb-0">

                        <thead>

                            <tr>

                                <th>Student</th>

                                <th>Roll Number</th>

                                <th>Branch</th>

                                <th>CGPA</th>

                                <th>Applications</th>

                                <th>Placement</th>

                                <th>Account</th>

                                

                                <th class="text-end">

                                    Actions

                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            <tr

                                v-for="student
                                in paginatedStudents"

                                :key="student.id">


                                <td>

                                    <div class="fw-semibold">

                                        {{student.full_name}}

                                    </div>

                                    <small class="text-muted">

                                        {{student.college_email}}

                                    </small>

                                </td>


                                <td>

                                    {{student.roll_number}}

                                </td>


                                <td>

                                    {{student.branch}}

                                </td>


                                <td>

                                    <span class="fw-semibold">

                                        {{student.cgpa}}

                                    </span>

                                </td>


                                <td>

                                    {{student.application_count}}

                                </td>


                                <td>

                                    <span

                                        class="badge"

                                        :class="
                                            statusClass(
                                                student.placement_status
                                            )">

                                        {{student.placement_status}}

                                    </span>

                                </td>

                                <td>

                                    <span
                                        class="badge"
                                        :class="
                                            accountStatusClass(
                                                student.is_active
                                            )
                                        ">

                                        {{
                                            accountStatusText(
                                                student.is_active
                                            )
                                        }}

                                    </span>

                                </td>


                                <td class="text-end">

                                    <div class="btn-group">


                                        <button

                                            class="btn
                                                   btn-sm
                                                   btn-outline-primary"

                                            title="View Details"

                                            @click="
                                                openDetails(student)
                                            ">

                                            <i
                                                class="bi bi-eye">

                                            </i>

                                        </button>


                                        <button

                                            class="btn
                                                   btn-sm
                                                   btn-outline-secondary"

                                            title="Applications"

                                            @click="
                                                openApplications(student)
                                            ">

                                            <i
                                                class="bi bi-file-earmark-text">

                                            </i>

                                        </button>

                                        <button
                                            class="btn btn-sm"
                                            :class="
                                                student.is_active
                                                    ? 'btn-outline-danger'
                                                    : 'btn-outline-success'
                                            "
                                            :title="
                                                student.is_active
                                                    ? 'Deactivate Student'
                                                    : 'Activate Student'
                                            "
                                            @click="
                                                toggleStudentStatus(student)
                                            ">

                                            <i
                                                :class="
                                                    student.is_active
                                                        ? 'bi bi-person-slash'
                                                        : 'bi bi-person-check'
                                                ">

                                            </i>

                                        </button>


                                    </div>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>


                <!-- Pagination -->

                <div

                    class="d-flex
                           justify-content-between
                           align-items-center
                           mt-4">

                    <small class="text-muted">

                        Page {{currentPage}}
                        of {{totalPages || 1}}

                    </small>


                    <div>

                        <button

                            class="btn
                                   btn-sm
                                   btn-outline-secondary
                                   me-2"

                            :disabled="currentPage === 1"

                            @click="previousPage">

                            <i class="bi bi-chevron-left"></i>

                            Previous

                        </button>


                        <button

                            class="btn
                                   btn-sm
                                   btn-outline-primary"

                            :disabled="
                                currentPage >= totalPages
                            "

                            @click="nextPage">

                            Next

                            <i class="bi bi-chevron-right"></i>

                        </button>

                    </div>

                </div>


            </div>

        </div>

        </div>

        <!-- COMPANY SECTION -->

        <div
            v-if="activeTab === 'companies'">

            


            <!-- COMPANY SEARCH -->

            <div
                class="card border-0 shadow-sm
                    rounded-4 mb-4">

                <div class="card-body">

                    <label
                        class="form-label fw-semibold">

                        Search Companies

                    </label>

                    <div class="input-group">

                        <span class="input-group-text">

                            <i class="bi bi-search"></i>

                        </span>

                        <input
                            type="text"
                            class="form-control"
                            placeholder="Company name, industry,location or HR email"
                            v-model="companySearchQuery"
                            @input="filterCompanies">

                    </div>

                </div>

            </div>


            <!-- COMPANY LOADING -->

            <div
                v-if="loadingCompanies"
                class="text-center py-5">

                <div
                    class="spinner-border text-primary">
                </div>

                <p class="text-muted mt-3">

                    Loading companies...

                </p>

            </div>


            <!-- COMPANY EMPTY -->

                <div
                    v-else-if="filteredCompanies.length === 0"
                    class="card border-0 shadow-sm rounded-4">

                    <div class="card-body text-center py-5">

                        <i
                            class="bi bi-building
                                display-4
                                text-muted">
                        </i>

                        <h5 class="mt-3">

                            No Companies Found

                        </h5>

                        <p class="text-muted">

                            Try changing your search.

                        </p>

                    </div>

                </div>


                <!-- COMPANY TABLE -->

                <div
                    v-else
                    class="card border-0 shadow-sm rounded-4">

                    <div class="card-body">

                        <div class="table-responsive">

                            <table
                                class="table
                                    align-middle
                                    mb-0">

                                <thead>

                                    <tr>

                                        <th>Company</th>

                                        <th>Industry</th>

                                        <th>Location</th>

                                        <th>Approval</th>

                                        <th>Account</th>

                                        <th class="text-end">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    <tr
                                        v-for="
                                            company
                                            in filteredCompanies
                                        "
                                        :key="company.id">

                                        <td>

                                            <div class="fw-semibold">

                                                {{ company.company_name }}

                                            </div>

                                            <small
                                                class="text-muted">

                                                {{ company.hr_email }}

                                            </small>

                                        </td>


                                        <td>

                                            {{ company.industry_type || "-" }}

                                        </td>


                                        <td>

                                            {{ company.location || "-" }}

                                        </td>


                                        <td>

                                            <span
                                                class="badge"
                                                :class="
                                                    company.approval_status
                                                    === 'approved'
                                                        ? 'bg-success'
                                                        : company.approval_status
                                                            === 'pending'
                                                            ? 'bg-warning text-dark'
                                                            : 'bg-danger'
                                                ">

                                                {{
                                                    company.approval_status
                                                }}

                                            </span>

                                        </td>


                                        <td>

                                            <span
                                                class="badge"
                                                :class="
                                                    accountStatusClass(
                                                        company.is_active
                                                    )
                                                ">

                                                {{
                                                    accountStatusText(
                                                        company.is_active
                                                    )
                                                }}

                                            </span>

                                        </td>


                                        <td class="text-end">

                                            <div class="btn-group">

                                                <button
                                                    class="btn
                                                        btn-sm
                                                        btn-outline-primary"
                                                    title="View Details"
                                                    @click="
                                                        selectedCompany = company;
                                                        showCompanyDetails = true;
                                                    ">

                                                    <i
                                                        class="bi bi-eye">
                                                    </i>

                                                </button>


                                                <button
                                                    class="btn btn-sm"
                                                    :class="
                                                        company.is_active
                                                            ? 'btn-outline-danger'
                                                            : 'btn-outline-success'
                                                    "
                                                    :title="
                                                        company.is_active
                                                            ? 'Deactivate Company'
                                                            : 'Activate Company'
                                                    "
                                                    @click="
                                                        toggleCompanyStatus(
                                                            company
                                                        )
                                                    ">

                                                    <i
                                                        :class="
                                                            company.is_active
                                                                ? 'bi bi-building-slash'
                                                                : 'bi bi-building-check'
                                                        ">
                                                    </i>

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>


        <!-- Student Details Modal -->

        <div

            class="modal fade"

            :class="{show: showDetails}"

            :style="{
                display: showDetails ? 'block' : 'none'
            }"

            tabindex="-1">

            <div class="modal-dialog modal-lg modal-dialog-scrollable">

                <div class="modal-content">


                    <div class="modal-header">

                        <h5 class="modal-title">

                            <i class="bi bi-person-badge me-2"></i>

                            Student Details

                        </h5>


                        <button

                            type="button"

                            class="btn-close"

                            @click="closeDetails">

                        </button>

                    </div>


                    <div

                        class="modal-body"

                        v-if="selectedStudent">


                        <div class="row g-4">


                            <div class="col-md-6">

                                <label class="text-muted small">

                                    Full Name

                                </label>

                                <div class="fw-semibold">

                                    {{selectedStudent.full_name}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="text-muted small">

                                    Roll Number

                                </label>

                                <div class="fw-semibold">

                                    {{selectedStudent.roll_number}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="text-muted small">

                                    College Email

                                </label>

                                <div>

                                    {{selectedStudent.college_email}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="text-muted small">

                                    Personal Email

                                </label>

                                <div>

                                    {{selectedStudent.personal_email || "-"}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="text-muted small">

                                    Branch

                                </label>

                                <div>

                                    {{selectedStudent.branch}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="text-muted small">

                                    Stream

                                </label>

                                <div>

                                    {{selectedStudent.stream}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="text-muted small">

                                    CGPA

                                </label>

                                <div class="fw-semibold">

                                    {{selectedStudent.cgpa}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="text-muted small">

                                    Graduation Year

                                </label>

                                <div>

                                    {{selectedStudent.graduation_year}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="text-muted small">

                                    Phone

                                </label>

                                <div>

                                    {{selectedStudent.phone}}

                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="text-muted small">

                                    Academic Year

                                </label>

                                <div>

                                    {{selectedStudent.year}}

                                </div>

                            </div>


                            <div class="col-12">

                                <label class="text-muted small">

                                    Skills

                                </label>

                                <div>

                                    {{selectedStudent.skills || "Not provided"}}

                                </div>

                            </div>


                            <div class="col-12">

                                <label class="text-muted small">

                                    Permanent Address

                                </label>

                                <div>

                                    {{selectedStudent.permanent_address}}

                                </div>

                            </div>


                            <div class="col-md-4">

                                <a

                                    v-if="selectedStudent.linkedin_url"

                                    :href="selectedStudent.linkedin_url"

                                    target="_blank"

                                    class="btn
                                           btn-outline-primary
                                           w-100">

                                    <i class="bi bi-linkedin me-1"></i>

                                    LinkedIn

                                </a>

                            </div>


                            <div class="col-md-4">

                                <a

                                    v-if="selectedStudent.github_url"

                                    :href="selectedStudent.github_url"

                                    target="_blank"

                                    class="btn
                                           btn-outline-dark
                                           w-100">

                                    <i class="bi bi-github me-1"></i>

                                    GitHub

                                </a>

                            </div>


                            <div class="col-md-4">

                                <a

                                    v-if="selectedStudent.portfolio_url"

                                    :href="selectedStudent.portfolio_url"

                                    target="_blank"

                                    class="btn
                                           btn-outline-secondary
                                           w-100">

                                    <i class="bi bi-globe me-1"></i>

                                    Portfolio

                                </a>

                            </div>

                            <div class="col-12">

                            <a
                            v-if="selectedStudent.resume"
                            :href="getResumeUrl(selectedStudent.id)"
                            target="_blank"
                            class="btn btn-primary">

                            <i class="bi bi-file-earmark-pdf me-1"></i>

                            View Resume

                        </a>

                        <span
                            v-else
                            class="text-muted">

                            <i class="bi bi-file-earmark-x me-1"></i>

                            Resume not uploaded

                        </span>

                        </div>


                        </div>

                    </div>


                    <div class="modal-footer">

                        <button

                            class="btn btn-secondary"

                            @click="closeDetails">

                            Close

                        </button>

                    </div>


                </div>

            </div>

        </div>

        <!-- COMPANY DETAILS MODAL -->

            <div
                class="modal fade"
                :class="{show: showCompanyDetails}"
                :style="{
                    display:
                        showCompanyDetails
                            ? 'block'
                            : 'none'
                }"
                tabindex="-1">

                <div
                    class="modal-dialog modal-lg
                        modal-dialog-scrollable">

                    <div class="modal-content">

                        <div class="modal-header">

                            <h5 class="modal-title">

                                <i
                                    class="bi bi-building
                                        me-2">
                                </i>

                                Company Details

                            </h5>

                            <button
                                type="button"
                                class="btn-close"
                                @click="
                                    showCompanyDetails = false;
                                    selectedCompany = null;
                                ">
                            </button>

                        </div>


                        <div
                            class="modal-body"
                            v-if="selectedCompany">

                            <div class="row g-4">

                                <div class="col-md-6">

                                    <label
                                        class="text-muted small">

                                        Company Name

                                    </label>

                                    <div class="fw-semibold">

                                        {{
                                            selectedCompany
                                            .company_name
                                        }}

                                    </div>

                                </div>


                                <div class="col-md-6">

                                    <label
                                        class="text-muted small">

                                        Industry

                                    </label>

                                    <div>

                                        {{
                                            selectedCompany
                                            .industry_type || "-"
                                        }}

                                    </div>

                                </div>


                                <div class="col-md-6">

                                    <label
                                        class="text-muted small">

                                        Domain

                                    </label>

                                    <div>

                                        {{
                                            selectedCompany
                                            .company_domain || "-"
                                        }}

                                    </div>

                                </div>


                                <div class="col-md-6">

                                    <label
                                        class="text-muted small">

                                        Company Size

                                    </label>

                                    <div>

                                        {{
                                            selectedCompany
                                            .company_size || "-"
                                        }}

                                    </div>

                                </div>


                                <div class="col-md-6">

                                    <label
                                        class="text-muted small">

                                        HR Email

                                    </label>

                                    <div>

                                        {{
                                            selectedCompany
                                            .hr_email || "-"
                                        }}

                                    </div>

                                </div>


                                <div class="col-md-6">

                                    <label
                                        class="text-muted small">

                                        HR Contact

                                    </label>

                                    <div>

                                        {{
                                            selectedCompany
                                            .hr_contact || "-"
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
                                            selectedCompany
                                            .location || "-"
                                        }}

                                    </div>

                                </div>


                                <div class="col-md-6">

                                    <label
                                        class="text-muted small">

                                        Approval Status

                                    </label>

                                    <div>

                                        {{ selectedCompany.approval_status }}

                                    </div>

                                </div>


                                <div class="col-md-6">

                                    <label
                                        class="text-muted small">

                                        Account Status

                                    </label>

                                    <div>

                                        <span
                                            class="badge"
                                            :class="
                                                accountStatusClass(
                                                    selectedCompany.is_active
                                                )
                                            ">

                                            {{
                                                accountStatusText(
                                                    selectedCompany.is_active
                                                )
                                            }}

                                        </span>

                                    </div>

                                </div>


                                <div class="col-md-6">

                                    <label
                                        class="text-muted small">

                                        Website

                                    </label>

                                    <div>

                                        <a
                                            v-if="
                                                selectedCompany.website
                                            "
                                            :href="
                                                selectedCompany.website
                                            "
                                            target="_blank">

                                            Visit Website

                                        </a>

                                        <span v-else>
                                            -
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>


                        <div class="modal-footer">

                            <button
                                class="btn btn-secondary"
                                @click="
                                    showCompanyDetails = false;
                                    selectedCompany = null;
                                ">

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            </div>


        <!-- Applications Modal -->

        <div

            class="modal fade"

            :class="{show: showApplications}"

            :style="{
                display: showApplications ? 'block' : 'none'
            }"

            tabindex="-1">

            <div class="modal-dialog modal-xl modal-dialog-scrollable">

                <div class="modal-content">


                    <div class="modal-header">

                        <h5 class="modal-title">

                            <i
                                class="bi bi-file-earmark-text me-2">

                            </i>

                            Student Applications

                        </h5>


                        <button

                            type="button"

                            class="btn-close"

                            @click="closeApplications">

                        </button>

                    </div>


                    <div class="modal-body">


                        <div

                            v-if="loadingApplications"

                            class="text-center py-5">

                            <div
                                class="spinner-border text-primary">

                            </div>

                        </div>


                        <div

                            v-else-if="applications.length === 0"

                            class="text-center py-5">

                            <i
                                class="bi bi-file-earmark-x
                                       display-5
                                       text-muted">

                            </i>

                            <p class="text-muted mt-3">

                                No applications found.

                            </p>

                        </div>


                        <div

                            v-else

                            class="table-responsive">

                            <table class="table align-middle">

                                <thead>

                                    <tr>

                                        <th>Drive</th>

                                        <th>Company</th>

                                        <th>Job Type</th>

                                        <th>Status</th>

                                        <th>Recruitment</th>

                                        <th>Applied</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    <tr

                                        v-for="application
                                        in applications"

                                        :key="application.id">


                                        <td>

                                            {{application.drive_title}}

                                        </td>


                                        <td>

                                            {{application.company_name}}

                                        </td>


                                        <td>

                                            {{application.job_type}}

                                        </td>


                                        <td>

                                            <span

                                                class="badge"

                                                :class="
                                                    applicationStatusClass(
                                                        application.status
                                                    )">

                                                {{application.status}}

                                            </span>

                                        </td>


                                        <td>

                                            {{application.recruitment_status}}

                                        </td>


                                        <td>

                                            {{formatDate(
                                                application.applied_at
                                            )}}

                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>


                    <div class="modal-footer">

                        <button

                            class="btn btn-secondary"

                            @click="closeApplications">

                            Close

                        </button>

                    </div>


                </div>

            </div>

        </div>


        <!-- Modal Backdrop -->

        <div

            v-if="
                showDetails ||
                showApplications ||
                showCompanyDetails
            "

            class="modal-backdrop fade show">

        </div>

        


    </div>

    `

};