const CompanyFilters = {

    props:{

        filter:String,

        sort:String

    },

    emits:[

        "update:filter",

        "update:sort"

    ],

    template:`

    <div class="row g-3">

        <div class="col-md-6">

            <select

                class="form-select"

                :value="filter"

                @change="$emit('update:filter',$event.target.value)">

                <option value="all">

                    All Companies

                </option>

                <option value="today">

                    Registered Today

                </option>

                <option value="week">

                    Registered This Week

                </option>

                <option value="large">

                    Large Companies

                </option>

                <option value="small">

                    Small Companies

                </option>

            </select>

        </div>

        <div class="col-md-6">

            <select

                class="form-select"

                :value="sort"

                @change="$emit('update:sort',$event.target.value)">

                <option value="newest">

                    Newest First

                </option>

                <option value="oldest">

                    Oldest First

                </option>

                <option value="name">

                    Company Name

                </option>

            </select>

        </div>

    </div>

    `

}