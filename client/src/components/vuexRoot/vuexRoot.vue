<!--vuex 状态数据集数据维护组价-->
<template>
  <div>

  </div>
</template>

<script>

import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  data() {
    return {
      localCount: 10,
      socketClient: null,//连接对象
      count:this.$store.state.count
    }
  },

  mounted() {

    var _this = this;
    // 统一维护sotre
    var client = io.connect('http://localhost:3000');
    client.on('connect', function () {
      _this.socketClient = client;
      console.log('服务器连接成功');
    });

    // 收到服务器数据更新推送，更新store的数据
    client.on('dataSource', function (data) {
      //console.log(_this.$store.state.dataSource.dataSourceList);
       _this.$store.commit("dataSource/updateSourceData",data);
      //console.log(data);

    });

  },

  components: {

  },

  computed: {
    // ...mapState(
    //   {
    //     getCount(state) {
    //       return state.count + this.localCount
    //     }
    //   }),
     ...mapGetters(['getStateCount']),
    // ...mapMutations({
    //   updateSourceData: "dataSource/updateSourceData"
    // }),
    // getStateCount()
    // {
    //   //return this.$store.state.count;
    //   return this.$store.getters['getStateCount'];
    // }
  }
}
</script>

<style scoped>

</style>
