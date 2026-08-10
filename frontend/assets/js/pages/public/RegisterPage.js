const RegisterPage = {

    props: ["registerForm"],

    emits: ["register","navigate"],

    data(){
        return {
            showPassword: false,
            showConfirmPassword: false
        }
    },

    template: 
    `
    <div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow">
                <div class="card-body p-4">

                    <button
                        type="button"
                        class="btn btn-outline-secondary mb-3"
                        @click="$emit('navigate','landing')">

                        <i class="bi bi-arrow-left me-2"></i>
                        Back to Home

                    </button>
                
                    <h2 class="text-center mb-4">Create Account</h2>

                    <p class="text-center text-muted mb-4">Join Placement Park</p>

                    <div class="mb-3">
                        <label class="form-label">Email Address</label>
                        <input
                        type="email"
                        class="form-control"
                        placeholder="Enter your email"
                        v-model="registerForm.email">
                    </div>

                    <div class="mb-3">

                        <label class="form-label">
                            Password
                        </label>

                        <div class="input-group">

                            <input
                                :type="showPassword ? 'text' : 'password'"
                                class="form-control"
                                placeholder="Create a strong password"
                                v-model="registerForm.password">

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


                    <div class="mb-4">

                        <label class="form-label">
                            Confirm Password
                        </label>

                        <div class="input-group">

                            <input
                                :type="showConfirmPassword ? 'text' : 'password'"
                                class="form-control"
                                placeholder="Confirm your password"
                                v-model="registerForm.confirm_password">

                            <button
                                type="button"
                                class="btn btn-outline-secondary"
                                @click="showConfirmPassword = !showConfirmPassword">

                                <i
                                    :class="showConfirmPassword
                                        ? 'bi bi-eye-slash'
                                        : 'bi bi-eye'">
                                </i>

                            </button>

                        </div>

                    </div>


                    <div class="mb-4">
                        <label class="form-label d-block">Register As</label>
                        <div class="form-check form-check-inline">
                            <input
                            type="radio"
                            class="form-check-input"
                            value="student"
                            v-model="registerForm.role">
                            <label class="form-check-label">Student</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input
                            type="radio"
                            class="form-check-input"
                            value="company"
                            v-model="registerForm.role">
                            <label class="form-check-label">Company</label>
                        </div>
                    </div>

                    <div class="d-grid">
                        <button class="btn btn-success" @click="$emit('register')">Register</button>
                    </div>

                    <p class="text-center mt-4 mb-0">
                        Already have an account?
                        <a href="#" @click.prevent="$emit('navigate','login')">Login</a></p>

                </div>
            </div>
        </div>
    </div>
    </div>
    `

}