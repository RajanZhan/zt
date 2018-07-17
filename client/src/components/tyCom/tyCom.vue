<template>
    <div>
      {{ getStoreCount }}
    </div>
</template>

<script>
    export default {
        data() {
          return {
            count:1,
          }
        },
      mounted(){
          console.log('work 1');
          var _this = this;
          setInterval(function () {
           // _this.$store.state.count ++;
          },1000)

      },
      computed:{
        getStoreCount(){
          return "store count is :"+ this.$store.state.count;
        },
        getCount(){
          return "count: " + this.count;
        },
      },
    }
</script>

<style scoped>

</style>
