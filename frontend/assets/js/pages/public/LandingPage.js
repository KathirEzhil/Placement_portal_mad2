const LandingPage = {

    props: ["appName","features","showFeatures","isLoggedIn","currentUser"],

    emits: ["navigate","logout"],
    
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
                    <a class="nav-link" href="#">About</a>
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
                    <button class="btn btn-primary btn-lg me-3">Get Started</button>
                    <button class="btn btn-outline-dark btn-lg me-3">Learn More</button>
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

    `
}