const AdminHero = {

    props: ["admin"],

    emits: ["navigate"],

    methods: {

        getCurrentDate() {

            return new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });

        }

    },

    template: `

    <div class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">

        <div class="card-body p-4">

            <div class="row align-items-center">

                <div class="col-lg-8">

                    <span class="badge bg-success mb-3 px-3 py-2">

                        <i class="bi bi-check-circle-fill me-2"></i>

                        Platform Status : Healthy

                    </span>

                    <h2 class="fw-bold mb-2">

                        Welcome back,
                        <span class="text-primary">

                            {{ admin?.name || "Administrator" }}

                        </span>

                    </h2>

                    <p class="text-muted mb-4">

                        Manage students, companies, placement drives,
                        recruitment process and platform analytics
                        from one centralized dashboard.

                    </p>

                    <div class="d-flex flex-wrap gap-2">

                        <button
                            class="btn btn-primary"
                            @click="$emit('navigate','approve-companies')">

                            <i class="bi bi-building-check me-2"></i>

                            Approve Companies

                        </button>

                        <button
                            class="btn btn-outline-primary"
                            @click="$emit('navigate','approve-drives')">

                            <i class="bi bi-briefcase-fill me-2"></i>

                            Approve Drives

                        </button>

                        <button
                            class="btn btn-outline-dark"
                            @click="$emit('navigate','analytics')">

                            <i class="bi bi-graph-up-arrow me-2"></i>

                            View Analytics

                        </button>

                    </div>

                </div>

                <div class="col-lg-4 text-center">

                    <div class="mb-3">

                        <i
                            class="bi bi-speedometer2 text-primary"
                            style="font-size:7rem;">
                        </i>

                    </div>

                    <div class="small text-muted">

                        {{ getCurrentDate() }}

                    </div>

                </div>

            </div>

        </div>

    </div>

    `
}