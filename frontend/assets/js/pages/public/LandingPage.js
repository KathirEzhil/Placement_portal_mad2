const LandingPage = {

    props: ["appName","features","showFeatures","isLoggedIn","currentUser"],

    emits: ["navigate","logout"],

    data() {

        return {

            showAboutModal: false,
            showLearnMoreModal: false

        }

    },

    template: `

        <!-- Navbar -->
    <nav class="navbar navbar-expand-lg bg-white shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold fs-4" href="#">
                <i class="bi bi-briefcase-fill text-primary"></i>
                {{ appName }}
            </a>

            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link active" href="#" @click.prevent="$emit('navigate','landing')">Home</a>
                </li>

                <li class="nav-item">
                    <a
                        class="nav-link"
                        href="#"
                        @click.prevent="showAboutModal = true">
                        About
                    </a>
                </li>

                <li class="nav-item" v-if="!isLoggedIn">
                    <a class="nav-link" href="#" @click.prevent="$emit('navigate','login')">Login</a>
                </li>

                <li class="nav-item" v-if="!isLoggedIn">
                    <a class="nav-link" href="#" @click.prevent="$emit('navigate','register')">Register</a>
                </li>

                <li class="nav-item" v-if="isLoggedIn">
                    <span class="nav-link">{{ currentUser.email }}</span>
                </li>

                <li class="nav-item" v-if="isLoggedIn">
                    <a href="#" class="nav-link" @click.prevent="$emit('logout')">Logout</a>
                </li>

            </ul>

        </div>

    </nav>

    <!-- Hero Section -->

    <div class="container py-5">

        <div class="row align-items-center">

            <!-- left side -->
            <div class="col-lg-6">

                <h1 class="fw-bold fs-1">
                    Connecting Talent
                    <br>
                    with Opportunity
                </h1>
                
                <p class="text-secondary mt-4">
                    Placement Park is a modern placement management platform
                    that connects students, companies, and administrators
                    through one intelligent recruitment ecosystem.
                </p>
                <div class="mt-4">

                    <button
                        class="btn btn-primary btn-lg me-3"
                        @click="$emit('navigate','login')">
                        Get Started
                    </button>

                    <button
                        class="btn btn-outline-dark btn-lg"
                        @click="showLearnMoreModal = true">
                        Learn More
                    </button>

                </div>
            </div>

            <!-- right side -->
            <div class="col-lg-6 text-center">
             
                <i class="bi bi-mortarboard-fill" 
                    style="font-size:220px;color:#0d6efd;">
                </i>
            </div>
        
        </div>

    </div>

    <!-- Features Section -->

    <div class="container py-3" v-if="showFeatures">

        <div class="row g-4">

            <div class="col-lg-4" v-for="feature in features">

                <div class="card h-100 shadow-sm">
                    <div class="card-body text-center">

                        <i v-bind:class="feature.icon + ' fs-1 ' + feature.color"></i>

                        <h4 class="mt-3">{{ feature.title }}</h4>

                        <p class="text-secondary">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Learn More Modal -->

    <div
        v-if="showLearnMoreModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.5);">

        <div class="modal-dialog modal-dialog-centered modal-lg">

            <div class="modal-content border-0 shadow">

                <div class="modal-header">

                    <h5 class="modal-title fw-bold">
                        <i class="bi bi-info-circle-fill text-primary me-2"></i>
                        How Placement Park Works
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        @click="showLearnMoreModal = false">
                    </button>

                </div>

                <div class="modal-body p-4">

                    <div class="row g-4">

                        <div class="col-md-4 text-center">

                            <i
                                class="bi bi-person-badge-fill text-primary"
                                style="font-size:2.5rem;">
                            </i>

                            <h6 class="fw-bold mt-3">
                                1. Students
                            </h6>

                            <p class="text-muted small">
                                Create a profile, upload a resume,
                                explore eligible placement drives,
                                and submit applications.
                            </p>

                        </div>

                        <div class="col-md-4 text-center">

                            <i
                                class="bi bi-building-fill text-success"
                                style="font-size:2.5rem;">
                            </i>

                            <h6 class="fw-bold mt-3">
                                2. Companies
                            </h6>

                            <p class="text-muted small">
                                Create placement drives, review
                                applicants, conduct recruitment rounds,
                                and manage selected candidates.
                            </p>

                        </div>

                        <div class="col-md-4 text-center">

                            <i
                                class="bi bi-shield-check text-warning"
                                style="font-size:2.5rem;">
                            </i>

                            <h6 class="fw-bold mt-3">
                                3. Administrators
                            </h6>

                            <p class="text-muted small">
                                Approve companies and drives,
                                manage users, monitor recruitment,
                                and view platform analytics.
                            </p>

                        </div>

                    </div>

                    <hr class="my-4">

                    <p class="text-muted mb-0 text-center">

                        Placement Park brings the complete placement
                        lifecycle together in one centralized platform,
                        reducing manual coordination and improving
                        visibility for every stakeholder.

                    </p>

                </div>

                <div class="modal-footer">

                    <button
                        class="btn btn-primary"
                        @click="showLearnMoreModal = false">

                        Close

                    </button>

                </div>

            </div>

        </div>

    </div>

    <!-- About Modal -->

    <div
        v-if="showAboutModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.5);">

        <div class="modal-dialog modal-dialog-centered">

            <div class="modal-content border-0 shadow">

                <div class="modal-header">

                    <h5 class="modal-title fw-bold">

                        <i class="bi bi-buildings-fill text-primary me-2"></i>

                        About Placement Park

                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        @click="showAboutModal = false">
                    </button>

                </div>

                <div class="modal-body p-4">

                    <p class="text-muted">

                        <strong>Placement Park</strong> is a centralized
                        placement management platform designed to
                        simplify and organize the campus recruitment
                        process.

                    </p>

                    <h6 class="fw-bold mt-4">
                        What the platform provides
                    </h6>

                    <ul class="text-muted">

                        <li>
                            Role-based access for students, companies,
                            and administrators.
                        </li>

                        <li>
                            Centralized placement drive and application
                            management.
                        </li>

                        <li>
                            Recruitment round tracking and offer-letter
                            management.
                        </li>

                        <li>
                            Analytics, reports, and automated
                            communication.
                        </li>

                        <li>
                            Background processing for scheduled and
                            time-consuming tasks.
                        </li>

                    </ul>

                    <div class="alert alert-primary mt-4 mb-0">

                        <i class="bi bi-lightbulb-fill me-2"></i>

                        Our goal is to make the placement process
                        structured, transparent, and easier to manage
                        for every stakeholder.

                    </div>

                </div>

                <div class="modal-footer">

                    <button
                        class="btn btn-primary"
                        @click="showAboutModal = false">

                        Close

                    </button>

                </div>

            </div>

        </div>

    </div>

    

    `
}