const RegisterPage = {

    props: ["registerForm"],

    emits: ["register","navigate"],

    template: 
    `
    <div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow">
                <div class="card-body p-4">
                
                    <h2 class="text-center mb-4">Create Account</h2>

                    <p class="text-center text-muted mb-4">Join Placement Park</p>

                    <div class="mb-3">
                        <label class="form-label">Email Adress</label>
                        <input
                        type="email"
                        class="form-control"
                        placeholder="Enter your email"
                        v-model="registerForm.email">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input
                        type="password"
                        class="form-control"
                        placeholder="Create a strong password(minimum 8 char)"
                        v-model="registerForm.password">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Confirm Password</label>
                        <input
                        type="password"
                        class="form-control"
                        placeholder="Confirm your password"
                        v-model="registerForm.confirm_password">
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