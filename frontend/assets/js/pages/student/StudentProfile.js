const StudentProfile = {

    data() {
        return {
            student: {},
            loading: true,
            editMode: false,
            profileExists:false
        }
    },

    async mounted() {

        await this.loadProfile();

    },

    methods: {

        async loadProfile() {

            try{
                const response = await fetch("/student/profile",{
                    credentials:"include"
                });
                const result = await response.json();
                if(result.success){
                    this.student = result.data;
                    this.profileExists=result.profile_exists;
                }
                else{
                    alert(result.message);
                }
            }
            catch(error){
                console.log(error);
            }
            finally{
                this.loading=false;
            }
        },

        async saveProfile(){
            try{
                const response=await fetch("/student/profile",{
                    method:"PUT",
                    headers:{
                        "Content-Type":"application/json"
                    },

                    credentials:"include",
                    body:JSON.stringify(this.student)
                });

                const result=await response.json();

                if(result.success){
                    alert("Profile Updated Successfully");
                    this.editMode=false;
                }

                else{
                    alert(result.message);
                }

            }
            catch(error){
                console.log(error);
            }
        },

        async uploadResume() {

            const file = this.$refs.resumeInput.files[0];
            if (!file) {
                alert("Please choose a PDF file.");
                return;
            }

            const formData = new FormData();

            formData.append("resume", file);

            try {
                const response = await fetch("/student/upload-resume", {
                    method: "POST",
                    credentials: "include",
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    await this.loadProfile();
                    this.$refs.resumeInput.value = "";
                }

                else {
                    alert(result.message);
                }
            }

            catch (error) {
                console.error(error);
                alert("Resume upload failed.");
            }
        },
        viewResume(){

            window.open("/student/view-resume","_blank");

        }
    },

    template:`

        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="height:70vh;">

            <div class="spinner-border text-primary"></div>

        </div>

        <div v-else class="profile-scroll">

            <!-- ========================= -->
            <!-- EMPTY STATE -->
            <!-- ========================= -->

            <div
                v-if="!profileExists && !editMode"
                class="card shadow-sm border-0 text-center p-5">

                <i class="bi bi-person-vcard display-1 text-primary"></i>

                <h2 class="mt-4 fw-bold">

                    Welcome to Placement Park

                </h2>

                <p class="text-muted fs-5">

                    Complete your profile before applying to placement drives.

                </p>

                <div class="mt-3">

                    <button
                        class="btn btn-primary btn-lg px-4"
                        @click="profileExists=true; editMode=true">

                        Complete Profile

                    </button>

                </div>

            </div>


            <!-- ========================= -->
            <!-- PROFILE FORM -->
            <!-- ========================= -->

            <div
                v-else
                class="container-fluid">

                <div class="card shadow-sm border-0">

                    <div class="card-body">

                        <!-- Header -->

                        <div class="d-flex justify-content-between align-items-center mb-4">

                            <div>

                                <h2 class="fw-bold mb-1">

                                    {{ student.full_name || "Student Profile" }}

                                </h2>

                                <p class="text-muted mb-0">

                                    {{ student.branch || "Branch" }}

                                    <span v-if="student.college_name">

                                        • {{ student.college_name }}

                                    </span>

                                </p>

                            </div>

                            <div>

                                <button
                                    v-if="!editMode"
                                    class="btn btn-primary"
                                    @click="editMode=true">

                                    Edit Profile

                                </button>

                                <div v-else>

                                    <button
                                        class="btn btn-success me-2"
                                        @click="saveProfile">

                                        Save

                                    </button>

                                    <button
                                        class="btn btn-secondary"
                                        @click="editMode=false">

                                        Cancel

                                    </button>

                                </div>

                            </div>

                        </div>

                        <hr>

                        <!-- Basic Information -->

                        <h5 class="mb-3">

                            Basic Information

                        </h5>

                        <div class="row">

                            <div class="col-md-6 mb-3">

                                <label class="form-label">Full Name</label>

                                <input
                                    class="form-control"
                                    v-model="student.full_name"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-6 mb-3">

                                <label class="form-label">College Email</label>

                                <input
                                    class="form-control"
                                    v-model="student.college_email"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-6 mb-3">

                                <label class="form-label">Personal Email</label>

                                <input
                                    class="form-control"
                                    v-model="student.personal_email"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-6 mb-3">

                                <label class="form-label">Roll Number</label>

                                <input
                                    class="form-control"
                                    v-model="student.roll_number"
                                    :disabled="!editMode">

                            </div>

                        </div>

                        <hr>

                        <!-- Academic -->

                        <h5 class="mb-3">

                            Academic Information

                        </h5>

                        <div class="row">

                            <div class="col-md-4 mb-3">

                                <label class="form-label">College</label>

                                <input
                                    class="form-control"
                                    v-model="student.college_name"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-4 mb-3">

                                <label class="form-label">Stream</label>

                                <input
                                    class="form-control"
                                    v-model="student.stream"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-4 mb-3">

                                <label class="form-label">Branch</label>

                                <input
                                    class="form-control"
                                    v-model="student.branch"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-4 mb-3">

                                <label class="form-label">CGPA</label>

                                <input
                                    type="number"
                                    class="form-control"
                                    v-model="student.cgpa"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-4 mb-3">

                                <label class="form-label">Year</label>

                                <input
                                    class="form-control"
                                    v-model="student.year"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-4 mb-3">

                                <label class="form-label">Graduation Year</label>

                                <input
                                    class="form-control"
                                    v-model="student.graduation_year"
                                    :disabled="!editMode">

                            </div>

                        </div>

                        <hr>

                        <!-- Contact -->

                        <h5 class="mb-3">

                            Contact

                        </h5>

                        <div class="row">

                            <div class="col-md-6 mb-3">

                                <label class="form-label">Phone</label>

                                <input
                                    class="form-control"
                                    v-model="student.phone"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-6 mb-3">

                                <label class="form-label">Permanent Address</label>

                                <textarea
                                    rows="2"
                                    class="form-control"
                                    v-model="student.permanent_address"
                                    :disabled="!editMode">

                                </textarea>

                            </div>

                        </div>

                        <hr>

                        <!-- Professional -->

                        <h5 class="mb-3">

                            Professional Information

                        </h5>

                        <div class="row">

                            <div class="col-md-4 mb-3">

                                <label class="form-label">Github</label>

                                <input
                                    class="form-control"
                                    v-model="student.github_url"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-4 mb-3">

                                <label class="form-label">LinkedIn</label>

                                <input
                                    class="form-control"
                                    v-model="student.linkedin_url"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-4 mb-3">

                                <label class="form-label">Portfolio</label>

                                <input
                                    class="form-control"
                                    v-model="student.portfolio_url"
                                    :disabled="!editMode">

                            </div>

                            <div class="col-md-12 mb-3">

                                <label class="form-label">Skills</label>

                                <textarea
                                    rows="3"
                                    class="form-control"
                                    v-model="student.skills"
                                    :disabled="!editMode">

                                </textarea>

                            </div>

                        </div>

                        <!-- Resume Card -->

                        <div class="card shadow-sm border-0 mt-4">

                            <div class="card-header bg-white">

                                <h5 class="mb-0">
                                    <i class="bi bi-file-earmark-pdf text-danger me-2"></i>
                                    Resume
                                </h5>

                            </div>

                            <div class="card-body">


                                   <div class="d-flex align-items-center mb-3">

                                        <i class="bi bi-file-earmark-pdf-fill text-danger fs-2 me-3"></i>

                                        <div>

                                            <h6 class="mb-1">

                                                Resume

                                            </h6>

                                            <small class="text-muted">

                                                {{ student.resume ? "Resume Uploaded" : "No Resume Uploaded" }}

                                            </small>

                                        </div>

                                    </div>

                                <div class="row align-items-center">

                                    <div class="col-md-8">

                                        <input
                                            type="file"
                                            class="form-control"
                                            ref="resumeInput"
                                            accept=".pdf"
                                            :disabled="!editMode">

                                    </div>

                                    <div class="col-md-4 text-end">

                                        <button
                                            class="btn btn-primary"
                                            :disabled="!editMode"
                                            @click="uploadResume">

                                            <i class="bi bi-upload me-2"></i>

                                            Upload Resume

                                        </button>

                                        <button
                                            v-if="student.resume"
                                            class="btn btn-outline-success ms-2"
                                            @click="viewResume">

                                            <i class="bi bi-eye me-2"></i>

                                            View

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>    

                    </div>

                </div>

            </div>

        </div>

`

}