const ApprovalCard = {

    props: {

        itemId: Number,

        title: String,

        subtitle: String,

        icon: {
            type: String,
            default: "bi bi-buildings"
        },

        badge: {
            type: String,
            default: "Pending"
        },

        badgeClass: {
            type: String,
            default: "bg-warning text-dark"
        },

        primaryInfo: String,
        secondaryInfo: String,
        tertiaryInfo: String,
        date: String

    },

    emits: [
        "approve",
        "reject",
        "details"
    ],

    template: `

    <div
        class="card border-0 shadow-sm rounded-4 approval-card h-100">

        <div
            class="card-body d-flex flex-column">

            <!-- Header -->

            <div
                class="d-flex justify-content-between align-items-start mb-4">

                <div class="d-flex">

                    <div class="approval-icon me-3">

                        <i :class="icon"></i>

                    </div>

                    <div>

                        <h6 class="fw-bold mb-1">

                            {{ title }}

                        </h6>

                        <small class="text-muted">

                            {{ subtitle }}

                        </small>

                    </div>

                </div>

                <span
                    class="badge rounded-pill px-3 py-2"
                    :class="badgeClass">

                    {{ badge }}

                </span>

            </div>


            <!-- Body -->

            <div class="flex-grow-1">

                <div class="mb-3">

                    <div class="info-row">

                        <i class="bi bi-globe2"></i>

                        <span>{{ primaryInfo }}</span>

                    </div>

                </div>

                <div class="mb-3">

                    <div class="info-row">

                        <i class="bi bi-geo-alt"></i>

                        <span>{{ secondaryInfo }}</span>

                    </div>

                </div>

                <div class="mb-3">

                    <div class="info-row">

                        <i class="bi bi-people"></i>

                        <span>{{ tertiaryInfo }}</span>

                    </div>

                </div>

                <div class="info-row">

                    <i class="bi bi-calendar-event"></i>

                    <span>

                        Registered on {{ date }}

                    </span>

                </div>

            </div>


            <hr class="my-4">


            <!-- Details -->

            <button

                class="btn btn-light border mb-3"

                @click="$emit('details',itemId)">

                <i class="bi bi-eye me-2"></i>

                View Details

            </button>


            <!-- Footer -->

            <div class="row g-2">

                <div class="col-6">

                    <button

                        class="btn btn-outline-danger w-100"

                        @click="$emit('reject',itemId)">

                        <i class="bi bi-x-circle me-2"></i>

                        Reject

                    </button>

                </div>

                <div class="col-6">

                    <button

                        class="btn btn-success w-100"

                        @click="$emit('approve',itemId)">

                        <i class="bi bi-check-circle me-2"></i>

                        Approve

                    </button>

                </div>

            </div>

        </div>

    </div>

    `

}