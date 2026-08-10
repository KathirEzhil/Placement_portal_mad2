const app = Vue.createApp({

    data() {
        return{
            appName: "PLACEMENT PARK",
            currentPage: "landing",
            
            editingDriveId: null,
            selectedDriveId: null,

            features: [

                {
                    title: "Students",
                    icon: "bi bi-mortarboard-fill",
                    color: "text-primary",
                    description: "Apply for placement drives, upload resumes, and track your recruitment journey."
                },
                {
                    title: "Companies",
                    icon: "bi bi-building",
                    color: "text-success",
                    description: "Create placement drives, manage applicants, and recruit talented students."
                },
                {
                    title: "Administrators",
                    icon: "bi bi-shield-check",
                    color: "text-warning",
                    description: "Approve companies, monitor drives, and manage the placement platform."
                }
            ],
            showFeatures: true,

            isLoggedIn: false,

            student: null,

            company: null,

            admin: null,

            currentUser: null,

            loginMessage: "",

            loginForm: {
                email: "",
                password: ""
            },

            registerForm: {
                email: "",
                password: "",
                confirm_password: "",
                role: ""
            }
        }
    },

    created() {
        
        console.log("Vue App created");
        this.checkSession();
    },

    

    methods:{

        toggleLogin(){

            this.isLoggedIn = !this.isLoggedIn;

        },

        openApplicants(driveId) {

            this.selectedDriveId = driveId;

            this.currentPage = "applicants";

        },

        async login(){
            
            const response = await fetch("/auth/login",{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(this.loginForm)
            });
            const result = await response.json();

            console.log(result);
            if (result.success){

                this.isLoggedIn = true;

                this.currentUser = result.data;

                await this.checkProfileAndNavigate(result.data.role);

                this.loginMessage = result.message;
            }
            else{
                this.loginMessage = result.message;
            }
        },

        async logout(){

            const response = await fetch("/auth/logout",{
                method: "POST",
                credentials: "include"
            });

            const result = await response.json();

            if(result.success){
                this.isLoggedIn = false;
                this.currentUser = null;
                this.loginMessage = "";
                this.currentPage = "landing";
            }
            else{
                this.loginMessage = result.message;
            }

        },

        async register(){

            if (this.registerForm.password !== this.registerForm.confirm_password) {
                alert("Passwords do not match");
                return;
            }

            const response = await fetch("/auth/register",{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(this.registerForm)
            });

            const result = await response.json()

            if(result.success){

                alert(result.message);
                this.registerForm = {
                    email:"",
                    password:"",
                    confirm_password:"",
                    role:""
                };
                this.currentPage = "login";
            }
            else{
                alert(result.message);
            }

        },

        async checkSession() {

            console.log("Checking Session...")

            const response = await fetch("/auth/session",{
                method: "GET",
                credentials: "include"
            });

            const result = await response.json();

            if(result.authenticated){

                this.isLoggedIn = true;

                this.currentUser = result.user;

                await this.checkProfileAndNavigate(
                    result.user.role
                );
            }

            console.log(result);
        },

        // navigateToDashboard(role){

        //     // if(role === "student"){
        //     //     this.currentPage = "student-dashboard";
        //     // }
        //     // else if(role === "company"){
        //     //     this.currentPage = "company-dashboard";
        //     // }
        //     // else if(role === "admin"){
        //     //     this.currentPage = "admin-dashboard";
        //     // }
        //     this.currentPage = "dashboard";
        // },

        async navigate(page) {

            if (page === "create-drive") {

                this.editingDriveId = null;

            }

            if (
                page === "dashboard" &&
                this.currentUser &&
                (
                    this.currentUser.role === "student" ||
                    this.currentUser.role === "company"
                )
            ) {

                await this.checkProfileAndNavigate(
                    this.currentUser.role
                );

                return;
            }

            this.currentPage = page;

        },

        startEditDrive(driveId) {

            this.editingDriveId = driveId;

            this.currentPage = "create-drive";

        },
    

        async checkProfileAndNavigate(role){

            try{

                let endpoint = "";

                if(role === "student"){
                    endpoint = "/student/profile";
                }

                else if(role === "company"){
                    endpoint = "/company/profile";
                }

                else{
                    this.currentPage = "dashboard";
                    return;
                }

                const response = await fetch(endpoint, {
                    method: "GET",
                    credentials: "include"
                });

                const result = await response.json();

                if(result.profile_exists === false){

                    this.currentPage = "profile";

                    return;
                }

                this.currentPage = "dashboard";

            }

            catch(error){

                console.error(
                    "Profile check failed:",
                    error
                );

                this.currentPage = "profile";
            }

        },
    },

    


    template: `

    <!-- Public pages -->        

    <template v-if="!isLoggedIn">

        <landing-page
            v-if="currentPage === 'landing'"
            :app-name="appName"
            :features="features"
            :show-features="showFeatures"
            :is-logged-in="isLoggedIn"
            :current-user="currentUser"
            @navigate="currentPage = $event"
            @logout="logout">
        </landing-page>

        <login-page
            v-else-if="currentPage === 'login'"
            :login-form="loginForm"
            :login-message="loginMessage"
            @login="login"
             @navigate="currentPage = $event">
        </login-page>
        
        <register-page
            v-else-if="currentPage === 'register'"
            :register-form="registerForm"
            @register="register"
            @navigate="currentPage = $event">
        </register-page>
    
        </template>

    <!-- Logged in Layout -->

    <template v-else>

        <navbar-component
            v-if="isLoggedIn"
            :app-name="appName"
            :current-user="currentUser"
            @logout="logout">
        </navbar-component>

        <div class="app-layout">

            <div class="sidebar-wrapper">

                <sidebar-component
                    :current-user="currentUser"
                    :current-page="currentPage"
                    :company="company"
                    @navigate="navigate">
                </sidebar-component>
            </div>

            <div class="main-content">

                <student-dashboard
                    v-if="currentUser.role==='student' &&
                           currentPage==='dashboard'"
                    :current-user="currentUser">
                </student-dashboard>

                <student-profile v-if="currentUser.role==='student' && currentPage==='profile'"></student-profile>
                <student-placement-drives v-if="currentUser.role==='student' && currentPage==='drives'"></student-placement-drives>

                <student-applications
                    v-if="currentPage === 'student-applications'">
                </student-applications>
                <student-applications
                    v-if="
                        currentUser.role === 'student' &&
                        currentPage === 'applications'
                    ">
                </student-applications>

                <student-analytics
                    v-if="
                        currentUser.role === 'student' &&
                        currentPage === 'analytics'
                    ">
                </student-analytics>

                <company-dashboard
                    v-if="currentUser.role==='company' &&
                        currentPage==='dashboard'"
                    @navigate="currentPage = $event"
                    @company-loaded="company = $event">
                </company-dashboard>

                <company-profile
                    v-if="currentUser.role==='company' &&
                        currentPage==='profile'"
                    @navigate="currentPage = $event">
                </company-profile>

                <company-create-drive
                    v-if="currentUser.role==='company' &&
                        currentPage==='create-drive'"
                    :edit-drive-id="editingDriveId"
                    @navigate="currentPage = $event">
                </company-create-drive>

                <company-manage-drives
                    v-if="currentUser.role==='company' &&
                        currentPage==='manage-drives'"
                    @navigate="currentPage=$event"
                    @edit-drive="startEditDrive"
                    @open-applicants="openApplicants">
                </company-manage-drives>

                <company-applicants

                    v-if="currentUser.role === 'company' &&
                        currentPage === 'applicants'"

                    :drive-id="selectedDriveId"

                    @navigate="currentPage = $event">

                </company-applicants>

                <company-analytics
                    v-if="
                        currentPage === 'analytics' &&
                        currentUser &&
                        currentUser.role === 'company'
                    "
                ></company-analytics>


                <!-- Admin -->

                <admin-dashboard
                    v-if="currentUser.role==='admin' &&
                        currentPage==='dashboard'"
                    @navigate="navigate">
                </admin-dashboard>

                <company-approvals
                    v-else-if="currentUser.role==='admin' &&
                            currentPage==='approve-companies'">
                </company-approvals>

                <drive-approvals
                    v-else-if="currentUser.role==='admin' &&
                            currentPage==='approve-drives'">
                </drive-approvals>

                <student-management
                    v-if="currentUser.role==='admin' &&
                        currentPage==='students'">
                </student-management>

                <admin-analytics
                    v-else-if="currentUser.role==='admin' &&
                            currentPage==='analytics'">
                </admin-analytics>

                <admin-reports
                    v-else-if="currentUser.role==='admin' &&
                            currentPage==='reports'">
                </admin-reports>

                <admin-recruitment
                    v-else-if="
                        currentUser.role === 'admin' &&
                        currentPage === 'recruitment'
                    ">
                </admin-recruitment>
                
                            </div>
                        </div>
                    </template>

    `,
    
})

app.component("landing-page", LandingPage);
app.component("login-page", LoginPage);
app.component("register-page", RegisterPage);

app.component("student-dashboard", StudentDashboard);

app.component("admin-dashboard", AdminDashboard);

app.component("company-dashboard",CompanyDashboard);
app.component("company-profile", CompanyProfile);

app.component("company-hero",CompanyHero);
app.component("company-create-drive", CompanyCreateDrive);
app.component("company-manage-drives",CompanyManageDrives);

// common components
app.component("navbar-component", Navbar);
app.component("sidebar-component", Sidebar);
app.component("search-bar", SearchBar);
app.component("pagination-component",Pagination);

app.component("drive-card", DriveCard);

// student pages
app.component("dashboard-hero", DashboardHero);
app.component("stat-card", StatCard);
app.component("placement-calendar", placementCalendar);
app.component("recruitment-progress", RecruitmentProgress);
app.component("student-profile", StudentProfile);
app.component("student-placement-drives", StudentPlacementDrives);
app.component(
    "student-applications",
    StudentApplications
);
app.component(
    "student-analytics",
    StudentAnalytics
);



app.component("admin-hero", AdminHero);
app.component("admin-stats", AdminStats);
app.component("quick-actions", QuickActions);
app.component("approval-card",ApprovalCard);

app.component("company-filters",CompanyFilters);



app.component("company-approvals", CompanyApprovals)
app.component("pending-companies", PendingCompanies);
app.component("pending-drives",PendingDrives);


app.component(
    "drive-approvals",
    DriveApprovals
);

app.component(
    "student-management",
    StudentManagement
);

app.component(
    "admin-analytics",
    AdminAnalytics
);


app.component(
    "admin-reports",
    AdminReports
);

app.component(
    "admin-recruitment",
    AdminRecruitment
);

app.component(
    "company-applicants",
    CompanyApplicants
);
app.component(
    "company-analytics",
    CompanyAnalytics
);



app.mount("#app");

