const placementCalendar = {

    props: ["events"],

    emits: ["view-all"],

    template: `

    <div class="card shadow-sm border-0 h-80">

        <div class="card-header bg-white d-flex justify-content-between align-items-center">

            <h5 class="mb-0">
                Placement Calendar
            </h5>

            <button
                class="btn"
                @click="$emit('view-all')">

                View All →

            </button>

        </div>

        <div class="card-body">

            <div
                v-if="events.length === 0"
                class="text-center text-muted py-4">

                <i class="bi bi-calendar-x fs-2 d-block mb-2"></i>

                <div class="fw-semibold">
                    No upcoming recruitment events
                </div>

                <small>
                    Your scheduled interviews and assessments will appear here.
                </small>

            </div>

            <div
                v-else
                v-for="event in events"
                :key="event.company + event.role"
                class="d-flex align-items-center justify-content-between py-2 border-bottom">

                <div class="d-flex align-items-center">

                    <div
                        class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3"
                        style="width:40px;height:40px;font-weight:bold;">

                        {{ event.company.charAt(0) }}

                    </div>

                    <div>

                        <h6 class="mb-1">
                            {{ event.company }}
                        </h6>

                        <small class="text-muted">
                            {{ event.role }}
                        </small>

                    </div>

                </div>

                <span
                    class="badge rounded-pill px-3"
                    :class="'bg-' + event.badge">

                    {{ event.deadline }}

                </span>

            </div>

        </div>

    </div>

    `

};
            