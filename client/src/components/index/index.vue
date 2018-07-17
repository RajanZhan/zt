<template>
  <div>
    <h2>项目运行</h2>
    <div></div>
    <select id="selectedProject">
      <option value="0">请选择</option>
      <option :value="project" v-for="project in projectList">{{ project }}</option>
    </select>
    <button @click="runProject">运行</button>
    <div id="doc-tab" class="easyui-tabs" style="width: 100%;height: 100%;border: 0px;">
      <input type="hidden" id="docChange" value="0">
      <input type="hidden" id="editAttributeId">
      <!-- <span class="dragbox" style="width: 70px!important;height: 40px!important;">
              			<input type="button" value="按钮1">
              		</span> -->
    </div>
  </div>
</template>

<script>

import scada_model from '../scada/js/scada.model';
export default {
  data() {
    return {
      client: null,
      tyList: [],
      runningTyList: new Map(),
      canvas: null,
      pixel_arr: new Map(),// 缓存图元对象
      projectList: [],
      canvasList: [],// 缓存所有文档的canvas属性
    }
  },
  mounted() {

    this.initEasyui();
    var client = io.connect('http://localhost:3000');
    var _this = this;
    client.on('connect', function() {
      _this.client = client;
      console.log('client connect')
      client.emit('scada/toServer/getProjectList', {}, function(data) {
        //alert(data.msg);
        if (data.status == 1) {
          //_this.tyList = data.data
          _this.projectList = data.data.projectList;
        }
      });

    });


    client.on('scada/toClient/updateData', function(data) {

      //console.log(data);
       //console.log( _this.pixel_arr);
      // 获取图元的对象
      var obj = _this.pixel_arr.get(data.id);
      if (obj) {
        obj.state = data.data;
        obj.consume_data(data.data);
        //console.log('consume data');
        //console.log(data.data);
       // console.log(obj.state);

        //console.log( _this.pixel_arr);
        // _this.pixel_arr.set(data.id,obj)
        //console.log('call consume_data');
      }
      //console.log('get opc data');
      //console.log(obj.animate);


    });

    var canvas = new fabric.Canvas('runCanvas', {
      width: 400,
      height: 300
    });
    canvas.selection = false;
    //初始化 canvas 的事件监听
    canvas.on({
      'mouse:over': function(obj) {
        //console.log('mouse over');
        if (!obj.target) {
          return;
        }
        //console.log(obj);
        if (typeof (obj.target) != 'undefined') {
          //obj.Event("mouse:over");
          var pixel_obj = _this.pixel_arr.get(obj.target.guid);
          if (pixel_obj) {
            pixel_obj.Event("mouse:over");
          }
        }
      },
      'mouse:down': function(obj) {
        //console.log('mouse down');
        //console.log(obj);
        if (!obj.target) {
          return;
        }
        if (typeof (obj.target) != 'undefined') {
          //obj.Event("mouse:down");
          var pixel_obj = _this.pixel_arr.get(obj.target.guid);
          if (pixel_obj) {
            pixel_obj.Event("mouse:down");
          }
        }
      },
      "mouse:up": function(obj) {
        //console.log('mouse up');
        if (!obj.target) {
          return;
        }
        if (typeof (obj.target) != 'undefined') {
          var pixel_obj = _this.pixel_arr.get(obj.target.guid);
          if (pixel_obj) {
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
          this.client.emit('scada/toServer/runTy', { ty: ty[0] }, function(data) {

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
              for (let obj of group) {
                if (obj.guid) {
                  //console.log(obj.guid);
                  //console.log(pixel_result_object.id);
                  if (pixel_result_object.id == obj.guid) {
                    obj.consume_data = pixel_result_object.consume_data;// 数据消费的方法
                    obj.animate = { rotate: 0 };// 初始化图元对象的动画值 0 停止、1 正传、2 反正
                    obj.client = _this.client;//网络连接对象
                    obj.Event = pixel_result_object.Event;
                    obj.setCtr = pixel_result_object.setCtr;
                    obj._getState = pixel_result_object._getState;
                    //console.log(obj.Event);
                    //console.log('set');
                    obj.set('selectable', false);// 禁止被选中
                  }
                  _this.pixel_arr.set(obj.guid, obj);
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

    runProject() {
      var _this = this;
      var selected = $("#selectedProject").val();
      if (selected == '0') {
        $.messager.alert({
          title: '警告',
          msg: '请选择要运行的项目',
        });
        return;
      }
      //console.log(selected);
      this.client.emit("scada/toServer/getProjectDetail", { pro_name: selected }, function(data) {

        //console.log(data.data.project);
        (async function() {
          if (data.status == 1) {
            let project = JSON.parse(data.data.project);
            for (let doc of project.pro_docs) {
              //console.log(doc);
              let canvas = await _this.addTab(doc);
              _this.canvasList.push(canvas);

              // 分析每个canvas 的图元
              var pixelList = new Object();
              eval(data.data.pixelList); // 反序列化 图元对象
             // console.log(pixelList);

              var group = canvas.getObjects();
              //console.log(group);
              //console.log(group[0].scada_attr);
              //console.log(pixelList[0]);
              /* for (var obj in pixelList) {
                console.log(pixelList[obj]);
                console.log(group[0]);

              } */
              //console.log("run project");
              // 遍历图元对象 并且生成Map映射
              for (let index in group) {
                let obj = group[index];

                for (let pixel_index in pixelList) {
                  let pixel = pixelList[pixel_index];
                  console.log(pixel);
                  //console.log(pixel);continue;
                  //console.log(pixel,obj);
                  if ((obj.scada_attr.guid == pixel.guid) && (obj.scada_attr.doc_id == pixel.doc_id)) {
                     console.log("set pixel map");
                    //console.log(obj.guid);
                    //console.log(pixel_result_object.id);
                    obj.consume_data = pixel.consume_data;// 数据消费的方法
                    obj.animate = { rotate: 0 };// 初始化图元对象的动画值 0 停止、1 正传、2 反正
                    obj.client = _this.client;//网络连接对象
                    obj.Event = pixel.Event;
                    obj.getState = pixel.getState;
                    obj.getAttr = pixel.getAttr;
                    obj.setCtr = pixel.setCtr;
                    obj.attr = pixel.attr;
                    obj.showDialog = pixel.showDialog;
                    obj.removeDialog = pixel.removeDialog;
                    obj.state = null;
                    _this.pixel_arr.set("state_" + project.pro_id + "_" + obj.scada_attr.doc_id + "_" + obj.scada_attr.guid, obj);
                    _this.pixel_arr.set(obj.scada_attr.guid, obj);// 冗余索引
                  }
                }
              }
            }
          }
        })()

      })

    },

    addTab(doc) {
      var _this = this;
      return new Promise(async function(resolove, reject) {
        var title = doc.doc_name;
        var id = doc.doc_id;
        //var _this = this;
        var tabDom = $("#doc-tab");
        if (tabDom.tabs('exists', title)) {
          tabDom.tabs('select', title);
          console.log('select');
        }
        else {
          var content = '<canvas id="' + id + '" width="1920" height="860"></canvas>';
          tabDom.tabs('add', {
            title: title,
            content: content,
            closable: false,
            tabWidth: 120,
            //id: id,
          });

          //var canvas = scada_model.initCanvas(id, { selection: false });
          var canvas = await scada_model.initCanvasSync(id, { selection: false });
          if (doc.canvas) {
            // canvas = fab
            doc.canvas.selection = false;
            canvas.loadFromJSON(doc.canvas, function() {
              //console.log('load ok');
              //canvas.selection = false;
              var group = canvas.getObjects();
              //console.log(group);
              for (let obj of group) {
                //console.log(obj);
                //console.log('set selectable');
                obj.set('selectable', false);// 禁止被选中
              }
              resolove(canvas);
            });
          }


          canvas.on({
            'mouse:over': function(obj) {
              //console.log('mouse over');
              if (!obj.target) {
                return;
              }
              //console.log(obj);
              console.log("mouse over");
              if (typeof (obj.target) != 'undefined') {
                //obj.Event("mouse:over");
                var pixel_obj = _this.pixel_arr.get(obj.target.scada_attr.guid);
                if (pixel_obj) {
                  pixel_obj.Event("mouse:over",obj);
                }
              }
            },
            "mouse:out":function(obj){
              //console.log("mouse out");
              if (!obj.target) {
                return;
              }
              //console.log(obj);
              //console.log("mouse out");
              if (typeof (obj.target) != 'undefined') {
                //obj.Event("mouse:over");
                var pixel_obj = _this.pixel_arr.get(obj.target.scada_attr.guid);
                if (pixel_obj) {
                  pixel_obj.Event("mouse:out",obj);
                }
              }
            },
            "mouse:move":function(obj){
              //consle.log("mouse out");
               //console.log('mouse over');
              if (!obj.target) {
                return;
              }
              //console.log(obj);
              console.log("mouse move");
              if (typeof (obj.target) != 'undefined') {
                //obj.Event("mouse:over");
                var pixel_obj = _this.pixel_arr.get(obj.target.scada_attr.guid);
                if (pixel_obj) {
                  pixel_obj.Event("mouse:move",obj);
                }
              }
            },
            'mouse:down': function(obj) {
              console.log('mouse down');
              //console.log(obj);
              if (!obj.target) {
                return;
              }
              if (typeof (obj.target) != 'undefined') {
                //obj.Event("mouse:down");

                var pixel_obj = _this.pixel_arr.get(obj.target.scada_attr.guid);
                //console.log(_this.pixel_arr);
                //console.log(obj.target.guid);
                if (pixel_obj) {
                  pixel_obj.Event("mouse:down",obj);
                }
              }
            },
            "mouse:up": function(obj) {
              //console.log('mouse up');
              if (!obj.target) {
                return;
              }
              if (typeof (obj.target) != 'undefined') {
                var pixel_obj = _this.pixel_arr.get(obj.target.scada_attr.guid);
                if (pixel_obj) {
                  pixel_obj.Event("mouse:up",obj);
                }

              }
            }

          });
          return canvas;
        }
      })
    },

    initEasyui() {
      var _this = this;
      $('#doc-tab').tabs({
        height: 1000,
        onClose: function(title, id) {
          console.log(title, id);
          var doc = _this.delDocFromOpen({ doc_name: title });
          _this.publish({ topic: 'docTabClose', message: '' });
          /* if (doc) {
            _this.canvas.delete(doc.doc_id);
          } */
        }
      })
    },
    // 画布 动画循环调用方法
    animateLoop() {

      requestAnimFrame(this.animateLoop);

      for (let canvas of this.canvasList) {
        // 遍历canvas 中的对象 ，并且查看对象的动画情况
        /* for (let obj of this.pixel_arr.values()) {
          if (obj.animate.rotate == 1) // 正传
          {
            obj.angle += 10;
          }
          else if (obj.animate.rotate == 2) // 反转
          {
            obj.angle -= 10;
          }
        } */
        let objs = canvas.getObjects();
        for (let obj of objs) {
          //obj.angle += 10;
          if (obj.animate.rotate == 1) // 正传
          {
            obj.angle += 10;
          }
          else if (obj.animate.rotate == 2) // 反转
          {
            obj.angle -= 10;
          }
        }
        canvas.renderAll();
      }
    }

  },
}
</script>

<style scoped>

</style>
