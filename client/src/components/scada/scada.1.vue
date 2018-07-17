<template >
  <div>
    <vuexRoot></vuexRoot>
     <dataSource></dataSource>

  </div>
</template>

<script>

import vuexRoot from '../vuexRoot/vuexRoot'
import dataSource from '../dataSourceCom/dataSourceCom'

//import

export default {
  data() {
    return {
      client: null,
      dataSourceList: [],// 数据源列表
      deviceSourceList: [],// 设备源列表
      tyList: [],// 图元列表
    }
  },
  mounted() {
    var client = io.connect('http://localhost:3000');
    var _this = this;
    client.on('connect', function () {

      _this.client = client;
      console.log('client connect')

    });

    client.on('scada/toClient/dataSourcePublish', function (data) {

      /*console.log('get the data source');
      console.log(data)*/
      for (var i in _this.dataSourceList) {
        if (_this.dataSourceList[i].topic == data.topic) {
          _this.dataSourceList[i].v = data.value;
        }
      }
    });

    client.on('scada/toClient/updateData', function (data) {
      /*console.log('update');
      console.log(data);*/
      // 更新数据源列表
      var tmp_arr = [];
      for (let i of data.data_source) {
        let d = JSON.parse(i);
        tmp_arr.push(d);
      }
      _this.dataSourceList = tmp_arr;


      // 更新设备列表
      _this.deviceSourceList = data.device_list;
    });

    //console.log(io);
  },
  methods: {
    // 添加数据源
    addDataSource() {
      let id = $("#data_source_id").val();
      let attr = $("#data_source_attr").val();
      if (id) {
        let data = { topic: id, attr: attr, };
        this.client.emit('scada/toServer/addDataSource', data, function (data) {
          console.log(data);
          alert(data.msg);
        });
      }
    },

    // 添加设备
    addDevice() {

      let id = $("#device_id").val();
      let attr = $("#device_attr").val();
      var data_list = [];
      $(".data_source_list_checkbox").each(function (v) {
        if ($(this).prop('checked')) {
          data_list.push($(this).attr('data-value'));
        }
      })
      if (id && (data_list.length > 0)) {
        this.client.emit('scada/toServer/addDevice',
          { device_id: id, attr: attr, data_list: data_list }, function (data) {
            console.log(data);
            alert(data.msg);
          });
      }
    },

    // 添加图元
    addTy() {

      let id = $("#ty_id").val();
      let attr = $("#ty_attr").val();
      let code_str = $("#ty_code").val().replace(/\r\n/g, "").replace(/\n/g, "");
      console.log(code_str);
      let code = JSON.parse(code_str);
      var devices = [];
      $(".devices_checkbox").each(function (v) {
        if ($(this).prop('checked')) {
          devices.push($(this).attr('data-device_id'));
        }
      })
      console.log(id, devices);
      if (id && (devices.length > 0)) {
        this.client.emit('scada/toServer/addTy',
          { ty_id: id, ty_attr: attr, code: code, devices: devices }, function (data) {
            console.log(data);
            alert(data.msg);
          });
      }
    },

  },
  components:{
    vuexRoot,
    dataSource,
  }
}
</script>

<style  scoped>
.main {
  display: flex;
}

.main fieldset {
  flex: 1;
}

.data_source_list li {
  background: darkgrey;
  margin: 5px;
}
</style>
