const CompanyHiringOverview = {

    props:["stats"],

    template:`

<div class="card shadow-sm border-0 h-100">

    <div class="card-header bg-white">

        <h5 class="mb-0">

            Hiring Overview

        </h5>

    </div>

    <div class="card-body">

        <div class="d-flex justify-content-between mb-3">

            <span>

                <i class="bi bi-check-circle-fill text-success me-2"></i>

                Profile Status

            </span>

            <span class="badge bg-success">

                Completed

            </span>

        </div>

        <div class="d-flex justify-content-between mb-3">

            <span>

                <i class="bi bi-patch-check-fill text-primary me-2"></i>

                Company Approval

            </span>

            <span class="badge bg-primary">

                Approved

            </span>

        </div>

        <div class="d-flex justify-content-between mb-3">

            <span>

                <i class="bi bi-hourglass-split text-warning me-2"></i>

                Pending Drives

            </span>

            <span class="badge bg-warning text-dark">

                {{ stats.pending_drives || 0 }}

            </span>

        </div>

        <div class="d-flex justify-content-between">

            <span>

                <i class="bi bi-briefcase-fill text-success me-2"></i>

                Active Drives

            </span>

            <span class="badge bg-success">

                {{ stats.total_drives || 0 }}

            </span>

        </div>

    </div>

</div>

`

}