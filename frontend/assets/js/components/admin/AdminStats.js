const AdminStats = {

    props: ["stats"],

    computed: {

        statCards() {

            return [

                {
                    title: "Students",
                    value: this.stats.total_students,
                    subtitle: "Registered Students",
                    icon: "bi bi-mortarboard-fill",
                    color: "text-primary"
                },

                {
                    title: "Companies",
                    value: this.stats.total_companies,
                    subtitle: "Approved Companies",
                    icon: "bi bi-buildings-fill",
                    color: "text-success"
                },

                {
                    title: "Placement Drives",
                    value: this.stats.total_drives,
                    subtitle: "Active Drives",
                    icon: "bi bi-briefcase-fill",
                    color: "text-warning"
                },

                {
                    title: "Applications",
                    value: this.stats.total_applications,
                    subtitle: "Applications Submitted",
                    icon: "bi bi-file-earmark-text-fill",
                    color: "text-info"
                },

                {
                    title: "Placements",
                    value: this.stats.total_placements,
                    subtitle: "Students Selected",
                    icon: "bi bi-patch-check-fill",
                    color: "text-success"
                },

                {
                    title: "Pending Companies",
                    value: this.stats.pending_companies,
                    subtitle: "Awaiting Approval",
                    icon: "bi bi-hourglass-split",
                    color: "text-danger"
                },

                {
                    title: "Pending Drives",
                    value: this.stats.pending_drives,
                    subtitle: "Need Review",
                    icon: "bi bi-clock-history",
                    color: "text-warning"
                },

                {
                    title: "Placement Rate",
                    value: this.stats.placement_rate + "%",
                    subtitle: "Overall Success",
                    icon: "bi bi-graph-up-arrow",
                    color: "text-primary"
                }

            ];

        }

    },

    template: `

    <div class="row g-4 mb-4">

        <div
            class="col-xl-3 col-lg-4 col-md-6"
            v-for="card in statCards"
            :key="card.title">

            <stat-card

                :title="card.title"
                :value="card.value"
                :subtitle="card.subtitle"
                :icon="card.icon"
                :color="card.color">

            </stat-card>

        </div>

    </div>

    `
}