<template>
  <div>
    <h2>项目运行</h2>
    <div></div>
    <select id="ty">
      <option value="0">请选择</option>
      <option :value="ty" v-for="ty in tyList">{{ ty }}</option>
    </select>
    <button @click="runTy">运行</button>

     <canvas id="runCanvas"></canvas>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        client: null,
        tyList: [],
        runningTyList: new Map(),
        canvas:null,
        pixel_arr:new Map(),// 缓存图元对象
      }
    },
    mounted() {

      var client = io.connect('http://localhost:3000');
      var _this = this;
      client.on('connect', function () {
        _this.client = client;
        console.log('client connect')
        client.emit('scada/toServer/getTyList', {}, function (data) {
          //alert(data.msg);
          if (data.status == 1) {
            _this.tyList = data.data
          }
        });

      });


      client.on('scada/toClient/updateData', function (data) {

        // 获取图元的对象
        var obj = _this.pixel_arr.get(data.id);
        if(obj)
        {
          obj.consume_data(data.data);
         // _this.pixel_arr.set(data.id,obj)
          //console.log('call consume_data');
        }
        //console.log('get opc data');
        //console.log(obj.animate);
        //console.log(obj.);

      });

      var canvas = new fabric.Canvas('runCanvas',{
          width:400,
          height:300
        });
      canvas.selection = false;
      //初始化 canvas 的事件监听
      canvas.on({
        'mouse:over':function(obj){
          //console.log('mouse over');
          if(!obj.target)
          {
            return;
          }
          console.log(obj);
          if(typeof(obj.target) != 'undefined')
          {
            //obj.Event("mouse:over");
            var pixel_obj = _this.pixel_arr.get(obj.target.guid);
            if(pixel_obj)
            {
              pixel_obj.Event("mouse:over");
            }
          }
        },
        'mouse:down':function(obj){
          //console.log('mouse down');
          //console.log(obj);
          if(!obj.target)
          {
            return;
          }
          if(typeof(obj.target) != 'undefined')
          {
            //obj.Event("mouse:down");
            var pixel_obj = _this.pixel_arr.get(obj.target.guid);
            if(pixel_obj)
            {
              pixel_obj.Event("mouse:down");
            }
          }
        },
        "mouse:up":function(obj){
          //console.log('mouse up');
          if(!obj.target)
          {
            return;
          }
          if(typeof(obj.target) != 'undefined')
          {
            var pixel_obj = _this.pixel_arr.get(obj.target.guid);
            if(pixel_obj)
            {
              pixel_obj.Event("mouse:up");
            }

          }
        }
        });

      this.canvas = canvas;
      setTimeout(function() {
        _this.animateLoop();
      }, 1000);
    },
    methods: {
      runTy() {
        var _this = this;
        if (this.client) {
          var ty = $("#ty").val();
          if (ty) {
            ty = ty.split('.');
            this.client.emit('scada/toServer/runTy', {ty: ty[0]}, function (data) {

              if (data.status == 1) {
                //_this.runningTyList.set(data.data.id + "_ty_", data.data.act_attr_desc);
                var pixel_result_object = new Object();
                eval(data.data.pixel); // 反序列化 图元对象
               // console.log(data.data.canvas);
                //console.log(data.data.pixel);return;
                //console.log(pixel_result_object.consume_data);
                //console.log(JSON.parse("'"+data.data.canvas+"'"));
                //console.log("'"+data.data.canvas+"'");
                //JSON.parse();
                //console.log(data.data.canvas);
                _this.canvas.loadFromJSON(data.data.canvas);
                var group = _this.canvas.getObjects();
                //console.log(group);return;

                // 遍历图元对象 并且生成Map映射
                for(let obj of group)
                {
                  if(obj.guid)
                  {
                    //console.log(obj.guid);
                    //console.log(pixel_result_object.id);
                    if(pixel_result_object.id == obj.guid)
                    {
                      obj.consume_data = pixel_result_object.consume_data;// 数据消费的方法
                      obj.animate = {rotate:0};// 初始化图元对象的动画值 0 停止、1 正传、2 反正
                      obj.client = _this.client;//网络连接对象
                      obj.Event = pixel_result_object.Event;
                      obj.setCtr = pixel_result_object.setCtr;
                      obj._getState = pixel_result_object._getState;
                      //console.log(obj.Event);
                      //console.log('set');
                      obj.set('selectable', false);// 禁止被选中
                    }
                    _this.pixel_arr.set(obj.guid,obj);
                  }
                }
                //console.log(_this.pixel_arr.get('fengji1'));
                /* if(group[0])
                {
                  setInterval(function(){
                    group[0].angle -= 10
                  },20);
                  (function animloop(){
                    requestAnimFrame(animloop);
                   _this.canvas.renderAll()
                  })();
                  //requestAnimationFrame(_this.canvas.renderAll())
                } */

              }

            });
          }
        }

      },

      // 画布 动画循环调用方法
      animateLoop(){

        requestAnimFrame(this.animateLoop);
        // 遍历canvas 中的对象 ，并且查看对象的动画情况
        for(let obj of this.pixel_arr.values())
        {
          if(obj.animate.rotate == 1) // 正传
          {
            obj.angle += 10;
          }
          else if(obj.animate.rotate == 2) // 反转
          {
            obj.angle -= 10;
          }
        }
        this.canvas.renderAll()
      }

    },
  }
</script>

<style scoped>

</style>
