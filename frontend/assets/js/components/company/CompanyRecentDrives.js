const CompanyRecentDrives = {

props:["drives"],

emiits: ["navigate"],

template:`

<div class="card shadow-sm border-0">

    <div class="card-header bg-white">

        <h5 class="mb-0">

            Recent Placement Drives

        </h5>

    </div>

    <div class="card-body">

        <div
            v-if="drives.length==0"
            class="text-center text-muted py-5">

            <div
                class="text-center py-5">

                    <i
                    class="bi bi-folder2-open display-4 text-primary">
                    </i>

                    <h5 class="mt-3">

                        No Placement Drives Yet

                    </h5>

                    <p class="text-muted">

                        Create your first placement drive
                        to start hiring students.

                    </p>

                    <button
                        class="btn btn-primary"
                        @click="$emit('navigate','create-drive')">

                        <i class="bi bi-plus-circle me-2"></i>

                        Create Drive

                    </button>

                </div>

        </div>

        <div
            v-for="drive in drives"
            :key="drive.id"
            class="border rounded p-3 mb-3">

            <h6 class="fw-bold">

                {{ drive.title }}

            </h6>

            <small class="text-muted">

                {{ drive.job_type }}

                •

                {{ drive.location }}

            </small>

            <br>

            <span
                class="badge bg-warning text-dark mt-2">

                {{ drive.status }}

            </span>

        </div>

    </div>

</div>

`

}