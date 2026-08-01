const LoginPage = {

    props: ["loginForm","loginMessage"],

    emits: ["login","navigate"],

    template:
    `
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-5">
                    <div class="card shadow">
                        <div class="card-body p-4">
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

                                <input 
                                    type="password" 
                                    class="form-control"
                                    v-model="loginForm.password"
                                    placeholder="Enter your password">
                            </div>

                            <button class="btn btn-primary w-100" @click="$emit('login')">Login</button>

                            <p class="text-center mt-3 text-primary">{{ loginMessage }}</p>

                            <hr>

                            <p>Email: {{ loginForm.email }}</p>
                            <p>Password: {{ loginForm.password }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    `

}