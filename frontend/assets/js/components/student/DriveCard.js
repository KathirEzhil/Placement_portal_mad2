const DriveCard = {

    props: [
        "drive",
        "applied"
    ],

    emits: [
        "view",
        "apply"
    ],

    template:`

    <div class="card shadow-sm border-0 mb-4 drive-card">

        <div class="card-body">

            <div class="d-flex justify-content-between align-items-start">

                <div>

                    <h5 class="fw-bold mb-1">

                        {{ drive.title }}

                    </h5>

                    <p class="text-muted mb-2">

                        <i class="bi bi-building me-2"></i>

                        {{ drive.company_name }}

                    </p>

                </div>

                <span
                    class="badge bg-success">

                    Open

                </span>

            </div>

            <div class="row mt-3">

                <div class="col-md-3">

                    <small class="text-muted">

                        <i class="bi bi-geo-alt"></i>

                        {{ drive.location }}

                    </small>

                </div>

                <div class="col-md-3">

                    <small class="text-muted">

                        <i class="bi bi-cash-stack"></i>

                        {{ drive.compensation }}

                    </small>

                </div>

                <div class="col-md-3">

                    <small class="text-muted">

                        <i class="bi bi-briefcase"></i>

                        {{ drive.job_type }}

                    </small>

                </div>

                <div class="col-md-3">

                    <small class="text-danger">

                        <i class="bi bi-calendar-event"></i>

                        {{ drive.last_date_to_apply }}

                    </small>

                </div>

            </div>

            <hr>

            <div class="mb-3">

                <span class="badge bg-light text-dark border">

                    CGPA ≥ {{ drive.eligibility_cgpa }}

                </span>

            </div>

            <div class="mb-3">

                <small class="text-muted">

                    {{ drive.required_skills }}

                </small>

            </div>

            <div class="d-flex justify-content-end">

                <button
                    class="btn btn-outline-primary me-2"
                    @click="$emit('view', drive)">

                    View Details

                </button>

                <button
                    v-if="!applied"
                    class="btn btn-primary"
                    @click="$emit('apply', drive)">

                    Apply

                </button>

                <button
                    v-else
                    disabled
                    class="btn btn-success">

                    Already Applied

                </button>

                

            </div>

        </div>

    </div>

    `
}