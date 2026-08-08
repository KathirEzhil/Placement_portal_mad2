const DashboardHero = {

    props: ["title","subtitle","buttonText","buttonIcon","currentUser"],

    emits: ["action"],

    template:
    `
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
        <div class="card-body p-3 px-4">
            <div class="row align-items-center">
                <div class="col-lg-7">

                    <h5 class="text-primary fw-bold mb-3">Hi {{ title }}</h5>

                    <h1 class="fw-bold mb-3">{{ currentUser.email }}</h1>

                    <p class="text-muted fs-5">{{ subtitle }}</p>

                    <button
                        class="btn btn-primary btn px-4 py-2 mt-3 rounded-pill px-4"
                        @click="$emit('action')">

                        <i :class="buttonIcon"></i>{{ buttonText }}
                    </button>
                </div>

                <div class="col-lg-5 d-flex justify-content-center align-items-center position-relative">

                    <i class="bi bi-person-workspace text-primary"
                    style="font-size:150px;">
                    </i>

                    <i class="bi bi-stars text-warning position-absolute"
                    style="font-size:40px; top:20px; right:120px;">
                    </i>

                </div>
            </div>
        </div>
    </div>

    `
}