<!--状态管理组件-->
<template>
    <div>

      <fieldset>
        <legend>数据源列表 </legend>
        <ul>
          <li :key="item.key" v-for="item in getDataSourceList ">{{ item.key }} -- {{ item.value }}</li>
        </ul>
      </fieldset>
    </div>
</template>

<script>


import { mapState, mapGetters, mapMutations } from 'vuex'

import {mapToArr} from '../../common/util'
  export default {
    data() {
        //console.log(this.$store.state.dataSource.count);
      return {
        dataSourceList:this.$store.state.dataSource.dataSourceList,
        count: this.$store.state.dataSource.count,

      }
    },
    created(){
      //this.dataSourceList = this.$store.state.dataSource.dataSourceList;
    },
    mounted(){
      console.log("状态管理组件已经启动");
     // console.log(this.getDataSourceList);
     var _this = this;
     setInterval(function(){
       //console.log(_this.getDataSourceList);
     },10000)
    },
    computed:{

      ...mapGetters({
        getDataSourceList:"dataSource/getDataSourceList",
        getDataSourceCount:'dataSource/getCount',
        //getDataSourceList:'dataSource/getDataSourceList'
      })
    },
    watch:{
      "dataSourceList":{
        deep:true,
        handler:function(){
          console.log('data source update');
        }
      },
      "count":function(){
          console.log('count update');
      }
    }

  }
</script>

<style scoped>

</style>
