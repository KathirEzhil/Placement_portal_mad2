const PendingCompanies = {

    emits:["navigate", "details","approve","reject"],

    data(){

        return{

            loading:true,

            companies:[]
        }

    },

    async mounted(){

        await this.loadCompanies();

    },

    methods:{

        async loadCompanies(){

            this.loading = true;

            try{

                const result =
                    await adminService.getPendingCompanies();

                if(result.success){

                    this.companies = result.companies;

                }

            }

            finally{

                this.loading = false;

            }

        },

        async approve(id){

            const result =
                await adminService.approveCompany(id);

            if(result.success){

                this.loadCompanies();

            }

            else{

                alert(result.message);

            }

        },


    },

    template:`

    <div>

        <div
            v-if="loading"
            class="text-center py-5">

            <div
                class="spinner-border text-primary">
            </div>

        </div>

        <div
            v-else-if="companies.length==0"
            class="text-center py-5">

            <i
                class="bi bi-patch-check display-4 text-success">
            </i>

            <h6 class="mt-3">

                No Pending Companies

            </h6>

        </div>

        <div
            v-else
            class="row g-3">

            <div

                class="col-xl-6"

                v-for="company in companies.slice(0,3)"

                :key="company.id">

                <approval-card

                    :item-id="company.id"

                    :title="company.company_name"

                    subtitle="Company Registration"

                    icon="bi bi-buildings"

                    badge="Pending"

                    badge-class="bg-warning text-dark"

                    :primary-info="company.website"
                    :secondary-info="company.location"
                    :tertiary-info="company.company_size + ' Employees'"
                    :date="company.created_at"

                    @details="$emit('details', $event)"

                    @approve="$emit('approve', $event)"

                    @reject="$emit('reject', $event)">


                </approval-card>

            </div>

        </div>

    </div>

    `
}