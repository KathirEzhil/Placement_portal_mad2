const PendingDrives = {

    emits:["navigate","details","approve","reject"],

    data(){

        return{

            loading:true,

            drives:[]
        }

    },

    async mounted(){

        await this.loadDrives();

    },

    methods:{

        async loadDrives(){

            this.loading = true;

            try{

                const result =
                    await adminService.getPendingDrives();

                if(result.success){

                    // Backend currently returns "companies"
                    this.drives = result.drives || [];

                }

            }

            finally{

                this.loading = false;

            }

        },

        async approve(id){

            const result =
                await adminService.approveDrive(id);

            if(result.success){

                this.loadDrives();

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

            v-else-if="drives.length==0"

            class="text-center py-5">

            <i

                class="bi bi-patch-check display-4 text-success">

            </i>

            <h6 class="mt-3">

                No Pending Drives

            </h6>

        </div>


        <div

            v-else

            class="row g-3">

            <div

                class="col-xl-6"

                v-for="drive in drives.slice(0,3)"

                :key="drive.id">

                <approval-card

                    :item-id="drive.id"

                    :title="drive.title"

                    :subtitle="drive.job_type"

                    icon="bi bi-briefcase-fill"

                    badge="Pending"

                    badge-class="bg-warning text-dark"

                    :primary-info="drive.compensation"
                    :secondary-info="drive.location"
                    :tertiary-info="'Minimum CGPA : ' + drive.eligibility_cgpa"
                    :date="drive.drive_date"

                    @details="$emit('details',$event)"

                    @approve="$emit('approve',$event)"

                    @reject="$emit('reject',$event)">

                </approval-card>

            </div>

        </div>

    </div>

    `

}