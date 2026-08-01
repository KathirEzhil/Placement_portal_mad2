const Navbar = {

    props: ["appName","currentUser"],

    emits: ["logout"],

    template: 
    `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div class="container-fluid">
            <a class="navbar-brand fw-bold" href="#">{{ appName }}</a>

            <div class="d-flex align-items-center ms-auto">
                <template v-if="currentUser">
                    <span class="badge bg-light text-dark me-3 text-capitalize">
                        {{ currentUser.email }}
                    </span>

                    <button
                        class="btn btn-outline-light btn-sm"
                        @click="$emit('logout')">
                        Logout
                    </button>
                </template>
            </div>
        </div>
    </nav>

    `
}