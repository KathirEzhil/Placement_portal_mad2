const CompanyHero = {

    props: ["company", "profileExists"],

    emits: ["navigate"],

    template: `

    <div class="card border-0 shadow-sm mb-4">

        <div class="card-body p-4">

            <div class="row align-items-center">

                <div class="col-lg-8">

                    <h2 class="fw-bold">

                        <span v-if="company && company.company_name">
                            Welcome, {{ company.company_name }}
                        </span>

                        <span v-else>
                            Welcome, Company
                        </span>

                    </h2>

                    <div v-if="company && company.approval_status === 'approved'">

                        <p class="text-muted mb-4">

                            Manage your recruitment drives, applicants,
                            and hiring process from one place.

                        </p>

                        <button
                            class="btn btn-primary me-2"
                            @click="$emit('navigate','create-drive')">

                            <i class="bi bi-plus-circle me-2"></i>

                            Create Drive

                        </button>

                        <button
                            class="btn btn-outline-primary"
                            @click="$emit('navigate','manage-drives')">

                            <i class="bi bi-list-task me-2"></i>

                            Manage Drives

                        </button>

                    </div>

                    <div
                        v-else
                        class="alert alert-warning mt-3 mb-0">

                        <div class="d-flex align-items-start">

                            <i class="bi bi-clock-history fs-4 me-3"></i>

                            <div>

                                <strong>
                                    Company Verification Pending
                                </strong>

                                <p class="mb-2 mt-1">

                                    Your company profile has been submitted successfully
                                    and is currently awaiting administrator approval.

                                </p>

                                <small>

                                    You can continue updating your company profile.
                                    Once your company is approved, you'll be able to:

                                </small>

                                <ul class="mt-2 mb-0">

                                    <li>Create Placement Drives</li>

                                    <li>Manage Drives</li>

                                    <li>View Applicants</li>

                                    <li>Conduct Recruitment Process</li>

                                    <li>Generate & Send Offer Letters</li>

                                </ul>

                            </div>

                        </div>

                    </div>

                </div>

                <div class="col-lg-4 text-center">

                    <i
                        class="bi bi-buildings text-primary"
                        style="font-size:7rem;">
                    </i>

                </div>

            </div>

        </div>

    </div>

    `

}