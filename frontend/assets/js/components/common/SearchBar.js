const SearchBar = {

    props:{

        modelValue:{
            type:String,
            default:""
        },

        placeholder:{
            type:String,
            default:"Search..."
        }

    },

    emits:["update:modelValue"],

    template:`

    <div class="input-group">

        <span class="input-group-text bg-white">

            <i class="bi bi-search"></i>

        </span>

        <input

            type="text"

            class="form-control"

            :placeholder="placeholder"

            :value="modelValue"

            @input="$emit('update:modelValue',$event.target.value)">

    </div>

    `

}