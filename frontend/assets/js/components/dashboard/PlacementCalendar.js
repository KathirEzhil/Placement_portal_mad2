const placementCalendar = {
    props: ["events"],

    template: `
        <div class="card shadow-sm border-0 h-80">

            <!-- Header -->
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                     Placement Calendar
                </h5>

                <a href="#" class="text-decoration-none small">
                    View All →
                </a>
            </div>

            <!-- Body -->
            <div class="card-body">

                <div
                    v-for="event in events"
                    :key="event.company"
                    class="d-flex align-items-center justify-content-between py-2 border-bottom">

                    <!-- Left Section -->
                    <div class="d-flex align-items-center">

                        <!-- Company Avatar -->
                        <div
                            class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3"
                            style="width:40px;height:40px;font-weight:bold;">

                            {{ event.company.charAt(0) }}

                        </div>

                        <!-- Company Details -->
                        <div>

                            <h6 class="mb-1">
                                {{ event.company }}
                            </h6>

                            <small class="text-muted">
                                {{ event.role }}
                            </small>

                        </div>

                    </div>

                    <!-- Right Section -->
                    <span
                        class="badge rounded-pill px-3"
                        :class="'bg-' + event.badge">

                        {{ event.deadline }}

                    </span>

                </div>

            </div>

        </div>
    `
}