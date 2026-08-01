const app = Vue.createApp({

    data() {
        return{
            appName: "PLACEMENT PARK",
            currentPage: "landing",

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
                this.navigateToDashboard(result.data.role);

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
                this.navigateToDashboard(result.user.role);
            }

            console.log(result);
        },

        navigateToDashboard(role){

            // if(role === "student"){
            //     this.currentPage = "student-dashboard";
            // }
            // else if(role === "company"){
            //     this.currentPage = "company-dashboard";
            // }
            // else if(role === "admin"){
            //     this.currentPage = "admin-dashboard";
            // }
            this.currentPage = "dashboard";
        },

        navigate(page) {

            this.currentPage = page;
        }
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
            @login="login">
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

        <div class="d-flex">

            <sidebar-component
                :current-user="currentUser"
                :current-page="currentPage"
                @navigate="navigate">
            </sidebar-component>

            <div class="flex-grow-1 p-3">

                <student-dashboard
                    v-if="currentUser.role==='student' &&
                           currentPage==='dashboard'"
                    :current-user="currentUser">
                </student-dashboard>

                <company-dashboard
                    v-if="currentUser.role==='company' &&
                           currentPage==='dashboard'">
                </company-dashboard>

                <admin-dashboard
                    v-if="currentUser.role==='admin' &&
                           currentPage==='dashboard'">
                </admin-dashboard>
            </div>
        </div>
    </template>

    `,
    
})

app.component("landing-page", LandingPage);
app.component("login-page", LoginPage);
app.component("register-page", RegisterPage);

app.component("student-dashboard", StudentDashboard);
app.component("company-dashboard", CompanyDashboard);
app.component("admin-dashboard", AdminDashboard);

app.component("navbar-component", Navbar);
app.component("sidebar-component", Sidebar);

app.component("dashboard-hero", DashboardHero);
app.component("stat-card", StatCard);
app.component("placement-calendar", placementCalendar);
app.component("recruitment-progress", RecruitmentProgress);


app.mount("#app");

