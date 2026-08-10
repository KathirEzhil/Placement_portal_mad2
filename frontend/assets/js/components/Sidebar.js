const Sidebar = {

    props: ["currentUser","currentPage","company"],

    emits: ["navigate"],

    computed: {

        menuItems(){

            if(!this.currentUser) return [];

            if(this.currentUser.role === "student") {
                return [
                    { page: "dashboard", icon: "bi-house-door", label: "Dashboard" },
                    { page: "profile", icon: "bi-person", label: "Profile" },
                    { page: "drives", icon: "bi-briefcase", label: "Placement Drives" },
                    { page: "student-applications", icon: "bi-file-earmark-text", label: "My Applications" },
                    { page: "analytics", icon: "bi-bar-chart", label: "Analytics" }
                ];
            }

            if (this.currentUser.role === "company") {

                const menu = [

                    {
                        page: "dashboard",
                        icon: "bi-house-door",
                        label: "Dashboard"
                    },

                    {
                        page: "profile",
                        icon: "bi-building",
                        label: "Company Profile"
                    }

                ];

                if (this.company?.approval_status === "approved") {

                    menu.push(

                        {
                            page: "create-drive",
                            icon: "bi-plus-circle",
                            label: "Create Drive"
                        },

                        {
                            page: "manage-drives",
                            icon: "bi-list-task",
                            label: "Manage Drives"
                        },

                        {
                            page: "analytics",
                            icon: "bi-people",
                            label: "Analytics"
                        }

                    );

                }

    return menu;

}

            else if(this.currentUser.role === "admin"){

                return [

                    {
                        page:"dashboard",
                        icon:"bi-house-door",
                        label:"Dashboard"
                    },

                    {
                        page:"approve-companies",
                        icon:"bi-building-check",
                        label:"Approve Companies"
                    },

                    {
                        page:"approve-drives",
                        icon:"bi-briefcase",
                        label:"Approve Drives"
                    },

                    {
                        page:"students",
                        icon:"bi-mortarboard",
                        label:"Students"
                    },

                    {
                        page:"analytics",
                        icon:"bi-bar-chart-line",
                        label:"Analytics"
                    },

                    {
                        page:"reports",
                        icon:"bi-file-earmark-bar-graph",
                        label:"Reports"
                    }

                ];

            }
        }
    },

    template:
    `
    <div class="bg-dark text-white p-3 h-100" style="overflow-y:auto;">
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