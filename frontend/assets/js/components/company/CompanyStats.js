const CompanyStats = {

    props:[
        "stats"
    ],

    template:`

<div class="row g-4 mb-4">

    <div class="col-lg-3">

        <div class="card shadow-sm border-0 text-center p-3">

            <i class="bi bi-briefcase fs-1 text-primary"></i>

            <h3>{{ stats.total_drives }}</h3>

            <small>Total Drives</small>

        </div>

    </div>

    <div class="col-lg-3">

        <div class="card shadow-sm border-0 text-center p-3">

            <i class="bi bi-people fs-1 text-success"></i>

            <h3>{{ stats.total_applications }}</h3>

            <small>Applicants</small>

        </div>

    </div>

    <div class="col-lg-3">

        <div class="card shadow-sm border-0 text-center p-3">

            <i class="bi bi-person-check fs-1 text-warning"></i>

            <h3>{{ stats.shortlisted }}</h3>

            <small>Shortlisted</small>

        </div>

    </div>

    <div class="col-lg-3">

        <div class="card shadow-sm border-0 text-center p-3">

            <i class="bi bi-award fs-1 text-danger"></i>

            <h3>{{ stats.selected }}</h3>

            <small>Selected</small>

        </div>

    </div>

</div>

`
}