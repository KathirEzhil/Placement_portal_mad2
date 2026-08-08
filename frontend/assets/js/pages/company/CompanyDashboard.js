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

            loading: true

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
                    credentials:"include"

                });

                const result = await response.json();

                if(result.success){

                    this.company = result.company;
                    this.$emit("company-loaded", result.company);
                    this.stats = result.stats;
                    this.recentDrives = result.recent_drives;
                    this.profileExists = !!result.company.company_name;

                }

                else{

                    alert(result.message);

                }

            }

            catch(error){

                console.error(error);

            }

            finally{

                this.loading = false;

            }

        }

    },

    template:`

<div v-if="loading"
class="text-center py-5">

    <div class="spinner-border text-primary"></div>

</div>

<div v-else>

    <company-hero
        :company="company"
        :profile-exists="profileExists"
        @navigate="$emit('navigate', $event)">
    </company-hero>

    <company-stats
        :stats="stats">
    </company-stats>


    <div v-if="company.approval_status==='approved'" class="row">

        <div class="col-lg-8">


            <company-recent-drives
                :drives="recentDrives"
                @navigate="$emit('navigate',$event)">
            </company-recent-drives>

        </div>

        <div class="col-lg-4">

            <company-hiring-overview :stats="stats">

            </company-hiring-overview>

        </div>

    </div>

</div>

`

}