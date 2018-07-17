<template>
    <div>
      <ul>
        <li  v-for = "item in options">
          {{ item.name }} <input type="checkbox" v-model="item.selected" :checked="item.selected"/>
        </li>
      </ul>
    </div>
</template>

<script>
    export default {
        data() {
            return {
              options:[
                {
                  name:'one',
                  selected:true,
                },
                {
                  name:'two',
                  selected:false,
                },
                {
                  name:'three',
                  selected:false,
                },
              ]
            }
        },
      watch:{
          "options":{
            deep:true,
            handler(){
              console.log(this.options);
            }
          }

      }
    }
</script>

<style scoped>

</style>
