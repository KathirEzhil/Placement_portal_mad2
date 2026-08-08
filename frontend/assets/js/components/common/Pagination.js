const Pagination = {

    props:{

        currentPage:Number,

        totalPages:Number

    },

    emits:["change"],

    template:`

    <nav
        v-if="totalPages>1"
        class="mt-4">

        <ul class="pagination justify-content-center">

            <li
                class="page-item"
                :class="{disabled:currentPage===1}">

                <button

                    class="page-link"

                    @click="$emit('change',currentPage-1)">

                    Previous

                </button>

            </li>

            <li

                v-for="page in totalPages"

                :key="page"

                class="page-item"

                :class="{active:page===currentPage}">

                <button

                    class="page-link"

                    @click="$emit('change',page)">

                    {{page}}

                </button>

            </li>

            <li

                class="page-item"

                :class="{disabled:currentPage===totalPages}">

                <button

                    class="page-link"

                    @click="$emit('change',currentPage+1)">

                    Next

                </button>

            </li>

        </ul>

    </nav>

    `

}