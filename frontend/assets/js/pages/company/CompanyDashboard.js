const CompanyDashboard = {

    emits: ["navigate","company-loaded"],

    components: {
        "company-hero": CompanyHero,
        "company-stats": CompanyStats,
        "company-hiring-overview": CompanyHiringOverview,
        "company-recent-drives": CompanyRecentDrives
    },

    data() {

        return {

            company: {},
            profileExists: false,
            stats: {

                total_drives: 0,
                total_applications: 0,
                shortlisted: 0,
                selected: 0

            },

            recentDrives: [],

            loading: true,

            accountDeactivated: false,

        }

    },

    async mounted(){

        await this.loadDashboard();

        //  this.loading = false;

    },

    methods:{

        async loadDashboard(){

            try{

                const response = await fetch("/company/dashboard",{

                    method: "GET",
                    credentials: "include"

                });

                const result = await response.json();


                // Handle deactivated account first
                if(result.account_active === false){

                    this.accountDeactivated = true;

                    return;

                }


                if(result.success){

                    this.company = result.company;

                    this.$emit(
                        "company-loaded",
                        result.company
                    );

                    this.stats = result.stats;

                    this.recentDrives =
                        result.recent_drives;

                    this.profileExists =
                        !!result.company.company_name;

                }

                else{

                    alert(
                        result.message ||
                        "Unable to load company dashboard."
                    );

                }

            }

            catch(error){

                console.error(
                    "Company dashboard error:",
                    error
                );

            }

            finally{

                this.loading = false;

            }

        }

    },

    template:

    `
    <!-- Loading -->

        <div
            v-if="loading"
            class="text-center py-5">

            <div class="spinner-border text-primary"></div>

        </div>


        <!-- Deactivated Account -->

        <div
            v-else-if="accountDeactivated"
            class="card border-0 shadow-sm rounded-4">

            <div class="card-body text-center py-5">

                <div
                    class="rounded-circle bg-danger bg-opacity-10
                        d-inline-flex justify-content-center
                        align-items-center mx-auto mb-4"
                    style="width:90px;height:90px;">

                    <i
                        class="bi bi-building-slash text-danger"
                        style="font-size:2.5rem;">
                    </i>

                </div>


                <h3 class="fw-bold mb-2">
                    Account Deactivated
                </h3>


                <p class="text-muted mb-2">

                    Your company account has been
                    deactivated by the administrator.

                </p>


                <p class="text-muted small mb-4">

                    Your company profile and placement history
                    have been preserved, but portal functions
                    are currently unavailable.

                    Please contact the administrator for
                    further assistance.

                </p>


                <button
                    class="btn btn-outline-danger"
                    @click="$root.logout">

                    <i class="bi bi-box-arrow-right me-2"></i>

                    Logout

                </button>

            </div>

        </div>


        <!-- Normal Company Dashboard -->

        <div v-else>

            <company-hero
                :company="company"
                :profile-exists="profileExists"
                @navigate="$emit('navigate', $event)">
            </company-hero>


            <company-stats
                :stats="stats">
            </company-stats>


            <div
                v-if="company.approval_status === 'approved'"
                class="row">

                <div class="col-lg-8">

                    <company-recent-drives
                        :drives="recentDrives"
                        @navigate="$emit('navigate',$event)">
                    </company-recent-drives>

                </div>


                <div class="col-lg-4">

                    <company-hiring-overview
                        :stats="stats">
                    </company-hiring-overview>

                </div>

            </div>

        </div>

    `

}