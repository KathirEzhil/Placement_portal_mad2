const LoginPage = {

    props: ["loginForm","loginMessage"],

    emits: ["login","navigate"],

    data() {
        return {
            showPassword: false
        }

    },

    template:
    `
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-5">
                    <div class="card shadow">
                        <div class="card-body p-4">
                        
                        <button
                                type="button"
                                class="btn btn-outline-secondary mb-3"
                                @click="$emit('navigate','landing')">

                                <i class="bi bi-arrow-left me-2"></i>
                                Back to Home

                            </button>
                            <h2 class="text-center mb-4">Login</h2>
                            
                            <div class="mb-3">
                                <label class="form-label">Email</label>

                                <input 
                                    type="email" 
                                    class="form-control"
                                    v-model="loginForm.email"
                                    placeholder="Enter your email">
                            </div>
                            <div class="mb-4">
                                <label class="form-label">Password</label>

                                <div class="input-group">

                                    <input
                                        :type="showPassword ? 'text' : 'password'"
                                        class="form-control"
                                        placeholder="Enter your password"
                                        v-model="loginForm.password">

                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        @click="showPassword = !showPassword">

                                        <i
                                            :class="showPassword
                                                ? 'bi bi-eye-slash'
                                                : 'bi bi-eye'">
                                        </i>

                                    </button>

                                </div>
                            </div>

                            <button class="btn btn-primary w-100" @click="$emit('login')">Login</button>

                            <p class="text-center mt-3 text-primary">{{ loginMessage }}</p>

                            <hr>

                        </div>
                    </div>
                </div>
            </div>
        </div>

    `

}