const StudentPlacementDrives = {

    components: {
        "drive-card": DriveCard
    },

    data() {

        return {

            drives: [],

            filteredDrives: [],

            searchQuery: "",

            loading: true,

            appliedDriveIds: []

        };

    },

    mounted() {

        this.fetchDrives();

    },

    methods: {

        async fetchDrives() {

            this.loading = true;

            try {

                const response = await fetch("/student/drives", {
                    credentials: "include"
                });

                const result = await response.json();

                if(result.success){

                    this.drives = result.drives;
                    this.filteredDrives = result.drives;

                }

                else{

                    alert(result.message);

                }

            }

            catch(error){

                console.error(error);

                alert("Unable to load placement drives.");

            }

            this.loading = false;

        },

        searchDrives(){

            const query = this.searchQuery.toLowerCase();

            this.filteredDrives = this.drives.filter(drive =>

                drive.title.toLowerCase().includes(query) ||

                drive.company_name.toLowerCase().includes(query) ||

                drive.location.toLowerCase().includes(query)

            );

        },

        viewDrive(drive){

            console.log(drive);

            // We'll replace this with a Bootstrap modal next

        },

        async applyDrive(drive){

            const coverLetter = prompt("Enter a short cover letter (optional):");

            try{

                const response = await fetch(`/student/drives/${drive.id}/apply`,{

                    method:"POST",

                    credentials:"include",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        cover_letter:coverLetter

                    })

                });

                const result = await response.json();

                alert(result.message);

                if(response.ok){

                    this.appliedDriveIds.push(drive.id);

                }

            }

            catch(error){

                console.error(error);

                alert("Failed to apply.");

            }

        }

    },

    template:`

<div class="container-fluid py-4">

    <div class="d-flex justify-content-between align-items-center mb-4">

        <div>

            <h2 class="fw-bold">

                Placement Drives

            </h2>

            <p class="text-muted">

                Explore all active placement opportunities.

            </p>

        </div>

    </div>

    <div class="card shadow-sm border-0 mb-4">

        <div class="card-body">

            <input

                class="form-control"

                placeholder="Search by company, title or location..."

                v-model="searchQuery"

                @input="searchDrives">

        </div>

    </div>

    <div
        v-if="loading"
        class="text-center py-5">

        <div class="spinner-border"></div>

    </div>

    <div
        v-else>

        <drive-card

            v-for="drive in filteredDrives"

            :key="drive.id"

            :drive="drive"

            :applied="appliedDriveIds.includes(drive.id)"

            @view="viewDrive"

            @apply="applyDrive">

        </drive-card>

        <div
            v-if="filteredDrives.length===0"
            class="text-center text-muted py-5">

            No placement drives found.

        </div>

    </div>

</div>

`

}