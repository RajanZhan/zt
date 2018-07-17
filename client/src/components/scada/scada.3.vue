<template >
  <div>
    <!-- <div class="main">
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
    </div> -->
    <div class="main">
      <fieldset>
        <legend>图元设计</legend>
        <div>
          <button @click="addNewPixel('showWindow')">添加新图元</button>
          <div id="addNewPixelWindow">
            <table>
              <tr>
                <td>图元文本:</td>
                <td> <input id="new_pixel_text" class="easyui-textbox" data-options="" style="width:300px"></td>
              </tr>
              <tr>
                <td>图元ID:</td>
                <td> <input id="new_pixel_id" class="easyui-textbox" data-options="" style="width:300px"></td>
              </tr>
              <tr>
                <td>
                  图元模板
                </td>
                <td>
                  <select id="new_pixel_template"  class="easyui-combobox template_list_combox" name="dept" style="width:200px;">
                  </select>
                </td>
              </tr>
              <tr>
                <td>图元描述:</td>
                <td> <input id="new_pixel_desc" class="easyui-textbox" data-options="" style="width:300px"></td>
              </tr>
            </table>
            <button @click="addNewPixel" class="easyui-linkbutton">添加空图元</button>
          </div>
          <button @click="addPixelByTemplate">添加模板图元</button>
          <canvas id="c"></canvas>
        </div>
      </fieldset>


      <fieldset>
          <legend>图元属性</legend>
           图元id: <input id="id" type="text" value='fengji1'/> <br>
           图元类型: <input id="pixel_type" type="text" value='fengji' /> <br>
           图元脚本：<Editor  @initEditor='initEditor'></Editor>
          <br>

          <br>
          <button @click="">保存</button>
          <br>
        </fieldset>

    </div>
  </div>

</template>

<script>

  import { serialize } from '@/common/util'
  import { mapGetters,mapMutations} from 'vuex'
  import  scada_option  from './js/scada.js'
  import Editor from '@/components/editor/editor'
  export  default {
    data(){
      return {
        client :null,
        dataSourceList:[],// 数据源列表
        deviceSourceList:[],// 设备源列表
        tyList:[],// 图元列表
        codeEditor:{},//
        canvas:null,//当前文档,
        // 空图元默认的脚本代码
        default_script:scada_option.pixel_default_script,

        // 图元模板列表
        template_list:[
          /* ['fengji','风机'],
          ['fengji2','风机2'], */
         /*  {label:'fengji',value:"风机"},
          {label:'wenduji',value:"温度计"}, */
          {'text':'请选择',"value":"0",selected:true},
          {'text':'风机',"value":"fengji"},
          {'text':'风机1',"value":"fengji1"},
         // {label:'wenduji',value:"温度计"},
        ],

        // 子窗口句柄缓存
        sub_window_cache:new Map(),
      }
    },
    mounted()
    {
      var _this = this;

      this.initEasyUi();

      this.initConnection();

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
      //console.log(this.default_script);

      /* setTimeout(function() {
        _this.template_list.push({"text":'风机3',value:'fengji3'});

        //$('#template_list_combox').combobox('setValues',_this.template_list);
        console.log(_this.template_list);
        //console.log('add');
      }, 5000); */
    },
    methods:{
      ...mapMutations({
        setProjectDoc:"project/setProDoc",// 将文档添加到项目的state中
        setActivePixel:"project/setActivePixel",
      }),

      // 初始化easyui 组件
      initEasyUi()
      {
        var _this = this;
        $("#addNewPixelWindow").window({
          width:400,
          height:300,
          modal:true,
          closed:true,
          resizable:false,
          collapsible:false,
          maximizable:false,
          minimizable:false,
          title:'添加新图元'
        });
        $.parser.onComplete = function(){
          $('.template_list_combox').combobox('loadData',_this.template_list);
        }
        this.sub_window_cache.set('newPixelWin',$("#addNewPixelWindow"));

      },

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

      // 向画布中添加新图元
      addNewPixel(handle_type){

        if(handle_type == 'showWindow') // 弹出添加图元窗口
        {
          let newPixelWin = this.sub_window_cache.get('newPixelWin');
          if(!newPixelWin)
          {
            return;
          }
          newPixelWin.window('open');
          return;
        }
        else
        {
          var new_pixel_text = $("#new_pixel_text").textbox('getValue');
          var new_pixel_id = $("#new_pixel_id").textbox('getValue');
          var new_pixel_desc = $("#new_pixel_desc").textbox('getValue');
          var template = $("#new_pixel_template").combobox('getValue');
          //console.log(new_pixel_text,new_pixel_id,new_pixel_desc,template);
          if(new_pixel_id && new_pixel_text)
          {
            let script = this.default_script;
            let attr = {};
            if(new_pixel_template != "0") // 说明选了模板图元
            {
               //获取模板的图元脚本以及属性
            }
            var pixel = createNewPixel(new_pixel_id,new_pixel_text,new_pixel_desc,script);
            if(pixel)
            {
              this.canvas.add(pixel);
              this.sub_window_cache.get('newPixelWin').window('close');
            }
          }

          //alert('添加数据');
        }

        // 生成图元的局部方法
        function createNewPixel (id,text,desc,script)
        {
          // 生成新的图元
              var circle = new fabric.Circle({
                radius: 100,
                fill: '#eef',
                scaleY: 0.5,
                originX: 'center',
                originY: 'center'
              });

            var text = new fabric.Text(text, {
              fontSize: 30,
              originX: 'center',
              originY: 'center'
             });
            var group = new fabric.Group([ circle, text ], {
              left: 150,
              top: 100,
              angle: -10,
              guid:id,
              script:script,
              desc : desc,// 图元的描述
            });
            return group;
        }



      },

      // 通过模板添加图元
      addPixelByTemplate(){

      },

      // fabric 载入 svg
      initCanvas(){
        var _this = this;
        var canvas = new fabric.Canvas('c',{
          width:600,
          height:700
        });
        this.canvas = canvas;
        return;
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
          guid:'fengji1',
          code:``,
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

         var canvas_object = canvas.toJSON(['guid','code','isMainDoc','pname']).objects;
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

        return;
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
        if(editor)
        {
           //console.log(editor);
           this.codeEditor = editor;
           this.codeEditor.setValue(``);
        }
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
    },
    watch:{
      "template_list":{
        deep:true,
        handler:function(){
          console.log('change ');
          $('.template_list_combox').combobox('loadData',this.template_list);
        }
      }
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
