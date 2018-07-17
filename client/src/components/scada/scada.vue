<template >
  <div>
    <div class="main">
      <fieldset>
        <legend>数据源添加</legend>
        <div>
          数据ID: <input id="data_source_id" value="device1-1" type="text"/> <br>
          自定义属性: <textarea id="data_source_attr">{}</textarea> <br>
          <br>
          已添加数据源:
          <ul class='data_source_list'>
            <li :id="data.topic" v-for="data in dataSourceList">key :{{ data.topic }}  value: {{ data.v }} attr :{{ data.attr }}</li>
          </ul>
          <button @click="addDataSource">添加</button>
        </div>
      </fieldset>
      <fieldset>
        <legend>设备生成</legend>
        <div>
          设备ID: <input id="device_id" type="text"/> <br>
          自定义属性: <textarea id="device_attr"></textarea> <br>
          数据源列表:
          <ul class='data_source_list'>
            <li :id="data.topic" v-for="data in dataSourceList">
              <input :data-value="data.topic" class="data_source_list_checkbox" type="checkbox"/>
              key :{{ data.topic }}  value: {{ data.v }} attr :{{ data.attr }}
            </li>
          </ul>

          <br>
          <button @click="addDevice"> 添加设备</button>
          <br>
          <br>
          设备列表:
          <ul class='data_source_list'>
            <li :id="device.device_id" v-for="device in deviceSourceList">
              <input type="checkbox"/>
              ID :{{ device.device_id }}  attr :{{ device.attr }} <br>
              <h4>数据源</h4>
              <ul>
                <li v-for="data in device.data_list">
                  ID: {{ data.topic}}  value {{data.v}}
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </fieldset>
    </div>
    <div class="main">
      <fieldset>
        <legend>图元组态</legend>
        <div>
          <canvas id="c"></canvas>
        </div>
      </fieldset>
       <fieldset>
        <legend>项目编辑</legend>
        <div>
          项目ID: <input id="pro_id" type="text" :value= 'getProject.pro_id'/> <br>
          项目名称: <input id="pro_name" type="text"/> <br>
          项目备注: <textarea id="pro_remark"></textarea> <br>
          图元代码: <!-- <textarea style="width: 200px;height: 300px"  id="ty_code">
                  {"yw_methods":"function(data){data = JSON.parse(data); var sum = 0;for(var i of data){sum += Number(i.v);}return (sum /data.length).toFixed(2);}","act_methods":"function(data){console.log('数据消费中...');console.log(data);}"}
        </textarea>
        <textarea id="code">
        </textarea> -->

        <fieldset>
          <legend>图元编辑</legend>
          图元id: <input id="guid" type="text" :value="getProject.active_pixel.pixel.guid"/> <br>
          图元名称: <input id="ty_name" type="text" :value="getProject.active_pixel.pixel.pname"/> <br>
          图元脚本：<Editor @contentUpdate='editorContentUpdate'  @initEditor='initEditor'></Editor>
          <br>
          图元设备列表:
          <ul class='data_source_list'>
            <li :key="device.device_id" :id="device.device_id" v-for="device in deviceSourceList">
              <input :data-device_id="device.device_id" type="checkbox" class="devices_checkbox"/>
              ID :{{ device.device_id }}  attr :{{ device.attr }} <br>
              <h4>数据源</h4>
              <ul>
                <li v-for="data in device.data_list">
                  ID: {{ data.topic}}  value {{data.v}}
                </li>
              </ul>
            </li>
          </ul>
        </fieldset>

          <br>
          <button @click="addTy">保存项目</button>
          <br>
         <!--  <br>
          图元列表:
          <ul class='data_source_list'>
            <li  v-for="ty in tyList">
              <input type="checkbox"/>
              {{ tyList }}
            </li>
          </ul> -->
        </div>
      </fieldset>
    </div>
  </div>

</template>

<script>

  import { serialize } from '@/common/util'
  import { mapGetters,mapMutations} from 'vuex'
  import Editor from '@/components/editor/editor'
  export  default {
    data(){
      return {
        client :null,
        dataSourceList:[],// 数据源列表
        deviceSourceList:[],// 设备源列表
        tyList:[],// 图元列表
        codeEditor:{},//
      }
    },
    mounted()
    {
      var _this = this;

      // 初始化canvas画布
      this.initCanvas();
      //console.log(io);

      this.initEditor();

      // 测试对象的序列化
      /* var obj = {
        name:"rajan",
        data:new Map([ ['data1',12],['data2',13],['getName',function(){alert('hahah')}] ]),
        getName(){
          return this.name;
        }
      }

      var new_obj = new Object();;
      var str = serialize(obj,'new_obj'); */
      //console.log(str);
    },
    methods:{
      ...mapMutations({
        setProjectDoc:"project/setProDoc",// 将文档添加到项目的state中
        setActivePixel:"project/setActivePixel",
      }),
      // 添加数据源
      addDataSource(){
        let id = $("#data_source_id").val();
        let attr = $("#data_source_attr").val();
        if(id)
        {
          let data = {topic:id,attr:attr,};
          this.client.emit('scada/toServer/addDataSource',data,function (data) {
            console.log(data);
            alert(data.msg);
          });
        }
      },

      // 添加设备
      addDevice(){

        let id = $("#device_id").val();
        let attr = $("#device_attr").val();
        var data_list = [];
        $(".data_source_list_checkbox").each(function (v) {
          if($(this).prop('checked')){
            data_list.push($(this).attr('data-value'));
          }
        })
        if(id &&(data_list.length > 0))
        {
          this.client.emit('scada/toServer/addDevice',
            {device_id:id,attr:attr,data_list:data_list},function (data) {
            console.log(data);
            alert(data.msg);
          });
        }
      },

      // 添加图元
      addTy(){

        let id = $("#ty_id").val();
        let attr = $("#ty_attr").val();
        let code_str = $("#ty_code").val().replace(/\r\n/g,"").replace(/\n/g,"");
        console.log(code_str);
        let code = JSON.parse(code_str);
        var devices = [];
        $(".devices_checkbox").each(function (v) {
          if($(this).prop('checked')){
            devices.push($(this).attr('data-device_id'));
          }
        })
        console.log(id,devices);
        if(id &&(devices.length > 0))
        {
          this.client.emit('scada/toServer/addTy',
            {ty_id:id,ty_attr:attr,code:code,devices:devices},function (data) {
              console.log(data);
              alert(data.msg);
            });
        }
      },

      // fabric 载入 svg
      initCanvas(){
        var _this = this;
        var canvas = new fabric.Canvas('c',{
          width:400,
          height:300
        });

        var circle = new fabric.Circle({
          radius: 100,
          fill: '#eef',
          scaleY: 0.5,
          originX: 'center',
          originY: 'center'
        });

        var text = new fabric.Text('风机', {
          fontSize: 30,
          originX: 'center',
          originY: 'center'
        });

        var group = new fabric.Group([ circle, text ], {
          left: 150,
          top: 100,
          angle: -10,
          guid:'fengji',
          code:`
            {
              // 绑定了哪些设备
              Devices:[],

              // 图元处理数据的方法，参数data为所有设备的数据源
              Data_deal_method:function(data){

              },

              //图元消费数据的方法，参数data为data_deal_method 处理好的数据
              Action:function(data){

              },

              //图元事件的监听
              Event:function(event_name){
                if(event_name="mouse:up") // 鼠标弹起的事件
                {
                }
              }
            }
          `,
          pname : "风机",// 图元的名称
        });
        group.on({"mouse:up":function(){
          console.log("ty up ");
        }});

        group.on('mouse:up',function(){
           console.log("fengji up ");
        });
        canvas.isMainDoc = true;// 标志是主文档。
        canvas.guid = 'doc1'

        canvas.add(group);
        /* setInterval(function(){
          group.angle += 10
          canvas.renderAll();
        },20) */

         var elArr = canvas.toJSON(['guid','code','isMainDoc','pname']).objects;
         canvas.on({
           "mouse:up":function(){
             //console.log('mouse up');
           },

           //元素被选中触发的代码
           "object:selected":function(object){
             _this.pixelSelected(object.target,canvas.guid);
           }
         });

         // 将文档存入 state
         this.setProjectDoc({id:'main_doc',canvas:canvas});

         /* canvas.on('click',function(e){
           console.log(e.target);
         }) */
         //elArr[0].guid

       // console.log(elArr[0].guid);

      },
      // 激活选中图元
      pixelSelected(pixel,canvas_guid){

        console.log('物体被选中');
        console.log(pixel);
        console.log(pixel.pname);
        /* console.log(this.client);
         console.log('selected'); */
         //console.log(this.getProject.active_pixel);
        this.setActivePixel({pixel:pixel,doc_id:canvas_guid}); // 更新被激活的图元到state
        this.codeEditor.setValue(pixel.code);
        //console.log(this.getProject.active_pixel.guid);
        //console.log(pixel);
      },

      // 初始化脚本编辑器
      initEditor(editor) {
        /* var editor = CodeMirror.fromTextArea(document.getElementById("ty_code"), {
          lineNumbers: true,
          mode: "javascript",
          gutters: ["CodeMirror-lint-markers"],
          keyMap: "sublime",
          theme: "monokai",
          lint: true
        }); */
        //console.log("editor init");
        //console.log(editor);
        if(editor)
        {
           console.log(editor);
           this.codeEditor = editor;
        }

        //this.codeEditor.setValue('121212')
       // console.log(this.codeEditor.getValue());
      },

      //代码编辑器的代码的更新的回掉函数
      editorContentUpdate(content){
        // 将新的代码更新到项目的state 中
      },

      // 初始化网络连接
      initConnection(){
        var _this = this;
        var client = io.connect('http://localhost:3000');
        client.on('connect',function () {
          _this.client = client;
          console.log('client connect')

        });

        client.on('scada/toClient/dataSourcePublish',function (data) {

          for(var i in _this.dataSourceList )
          {
            if(_this.dataSourceList[i].topic == data.topic)
            {
              _this.dataSourceList[i].v = data.value;
            }
          }
        });

        client.on('scada/toClient/updateData',function (data) {

          // 更新数据源列表
          var tmp_arr = [];
          for(let i of data.data_source)
          {
            let d = JSON.parse(i);
            tmp_arr.push(d);
          }
          _this.dataSourceList = tmp_arr;


          // 更新设备列表
          _this.deviceSourceList = data.device_list;
        });
        this.client = client;
      }

    },
    components:{
      Editor,
    },
    computed:{
      ...mapGetters({
        getProject:'project/getProject',// 从 state 中获取 项目数据
      }),
    }
  }
</script>

<style  scoped>
  .main{
    display: flex;
  }
  .main fieldset{
    flex: 1;
  }
  .data_source_list li {
    background: darkgrey;
    margin: 5px;
  }
  #c {
    width: 400px;
    height: 300px;
    background: white;
  }
</style>
