const StatCard = {

    props: ["title","value","subtitle","icon","color"],

    template:
    `
    <div class="card stat-card border-0 shadow-sm rounded-4 h-100">
        <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="text-secondary fw-semibold mb-2">{{ title }}</h6>

                    <h3 class="fw-bold mb-1">{{ value }}</h3>

                    <small class="text-muted">{{ subtitle }}</small>
                </div>

                <div class="stat-icon" :class="color">
                    <i :class="icon"></i>

                </div>
            </div>
        </div>
    </div>

    `

}