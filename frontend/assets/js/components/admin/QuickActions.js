const QuickActions = {

    emits: ["navigate"],

    data() {

        return {

            actions: [

                {
                    title: "Approve Companies",
                    description: "Review newly registered companies",
                    icon: "bi bi-building-check",
                    color: "primary",
                    page: "approve-companies"
                },

                {
                    title: "Approve Drives",
                    description: "Approve placement drives",
                    icon: "bi bi-briefcase-fill",
                    color: "success",
                    page: "approve-drives"
                },

                {
                    title: "Manage Students",
                    description: "View and manage students",
                    icon: "bi bi-mortarboard-fill",
                    color: "warning",
                    page: "students"
                },

                {
                    title: "Analytics",
                    description: "Platform insights & reports",
                    icon: "bi bi-graph-up-arrow",
                    color: "info",
                    page: "analytics"
                },

                {
                    title: "Generate Reports",
                    description: "Monthly & placement reports",
                    icon: "bi bi-file-earmark-bar-graph-fill",
                    color: "secondary",
                    page: "reports"
                },

                {
                    title: "Recruitment",
                    description: "Track recruitment process",
                    icon: "bi bi-diagram-3-fill",
                    color: "danger",
                    page: "recruitment"
                }

            ]

        }

    },

    template: `

    <div class="card border-0 shadow-sm rounded-4">

        <div class="card-body p-4">

            <div class="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h5 class="fw-bold mb-1">

                        <i class="bi bi-lightning-charge-fill text-warning me-2"></i>

                        Quick Actions

                    </h5>

                    <small class="text-muted">

                        Frequently used administrator actions

                    </small>

                </div>

            </div>

            <div class="row g-3">

                <div
                    class="col-lg-6"
                    v-for="action in actions"
                    :key="action.title">

                    <div
                        class="card border h-100 action-card"
                        role="button"
                        @click="$emit('navigate', action.page)">

                        <div class="card-body">

                            <div
                                class="rounded-circle bg-light d-inline-flex justify-content-center align-items-center mb-3"
                                style="width:55px;height:55px;">

                                <i
                                    :class="[action.icon,'text-'+action.color]"
                                    style="font-size:1.5rem;">
                                </i>

                            </div>

                            <h6 class="fw-bold">

                                {{ action.title }}

                            </h6>

                            <p class="text-muted small mb-3">

                                {{ action.description }}

                            </p>

                            <span
                                class="fw-semibold text-primary">

                                Open

                                <i class="bi bi-arrow-right ms-1"></i>

                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>

    `

}