const RecruitmentProgress = {

    props: ["processes"],

    emits: ["view-all"],

    template: 
    `
    <div class="card shadow-sm border-0 h-100">

        <!-- Header -->

        <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Recruitment Progress</h5>

            <button
                class="btn"
                @click="$emit('view-all')">

                View All →

            </button>
        </div>
        
        <!-- Body -->
        <div class="card-body px-4 py-3">
        <div 
            v-for="process in processes"
            :key="process.id"
            class="mb-2">

            <!-- Company -->

            <h6 class="fw-bold mb-1">
                {{ process.company }}
            </h6>

            <div class="d-flex justify-content-between align-items-center mb-2">

                <!-- Current Stage -->

                <small class="text-muted">{{ process.stage }}</small>


                <small class="fw-bold text-primary">
                    {{ process.progress }}%
                </small>

            </div>

            
            <!-- Progress Bar -->

            <div class="progress mt-2" style="height:8px;">
                <div
                    class="progress-bar bg-success"

                    :style="{ width: process.progress + '%' }">
                </div>
            </div>
        </div>
        </div>
    </div>

    `

}