const Sidebar = {

    props: ["currentUser","currentPage"],

    emits: ["navigate"],

    computed: {

        menuItems(){

            if(!this.currentUser) return [];

            if(this.currentUser.role === "student") {
                return [
                    { page: "dashboard", icon: "bi-house-door", label: "Dashboard" },
                    { page: "profile", icon: "bi-person", label: "Profile" },
                    { page: "drives", icon: "bi-briefcase", label: "Placement Drives" },
                    { page: "applications", icon: "bi-file-earmark-text", label: "My Applications" },
                    { page: "analytics", icon: "bi-bar-chart", label: "Analytics" }
                ];
            }

            if(this.currentUser.role === "company") {
                return [
                    { page: "dashboard", icon: "bi-house-door", label: "Dashboard" },
                    { page: "profile", icon: "bi-building", label: "Company Profile" },
                    { page: "create-drive", icon: "bi-plus-circle", label: "Create Drive" },
                    { page: "manage-drives", icon: "bi-list-task", label: "Manage Drives" },
                    { page: "applicants", icon: "bi-people", label: "Applicants" }
                ];
            }

            else if(this.currentUser.role === "admin"){
                return [
                { page: "dashboard", icon: "bi-house-door", label: "Dashboard" },
                { page: "companies", icon: "bi-building-check", label: "Companies" },
                { page: "drives", icon: "bi-briefcase", label: "Drives" },
                { page: "users", icon: "bi-people", label: "Users" },
                { page: "statistics", icon: "bi-bar-chart", label: "Statistics" }
            ];
            }
        }
    },

    template:
    `
    <div class="bg-dark text-white vh-100 p-3" style="width:250px;">
        <h5 class="mb-4">Menu</h5>
        <div v-for="item in menuItems" :key="item.page">
            <button
                class="btn w-100 text-start mb-2"
                :class="currentPage===item.page ? 'btn-primary' : 'btn-outline-light'"
                @click="$emit('navigate',item.page)">
                
                <i :class="'bi '+item.icon"></i>
                {{ item.label }}
            </button>
        </div>
    </div>

    `
}