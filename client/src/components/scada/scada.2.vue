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
          <button @click="addTy">保存</button>
          <br>
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
        canvas:null,//当前文档
      }
    },
    mounted()
    {
      var _this = this;

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
        var _this = this;
        let id = $("#id").val();
        let type = $("#pixel_type").val();
        //let code_str = $("#ty_code").val().replace(/\r\n/g,"").replace(/\n/g,"");
        let code_str = this.codeEditor.getValue();
        //console.log(JSON.stringify(_this.canvas.toJSON(['guid','code','isMainDoc','pname'])));
        if(code_str)
        {
          this.client.emit('scada/toServer/addTy',
            {id:id,type:type,script:code_str,canvas:JSON.stringify(_this.canvas.toJSON(['guid','code','isMainDoc','pname']))},function (data) {
              console.log(data);
              alert(data.msg);
            });
        }
        return;

        if(id && type && code_str)
        {
           this.client.emit('scada/toServer/addTy',
            {id:id,type:type,code:code_str},function (data) {
              console.log(data);
              alert(data.msg);
            });
        }
        else{
          alert('数据不完整');
        }

        //this.codeEditor.setValue(code_str);
        //console.log(this.codeEditor.getValue());
        //console.log($(this.codeEditor.getTextArea()).val());
        //console.log(JSON.parse());
        return;
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

         this.canvas = canvas;

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
           this.codeEditor.setValue(`{
  // 自定义属性，属性值要与数据源的tag进行绑定
  attr:{
    zz:{tagName:"device1-1",value:0},
    fz:{tagName:"device1-2",value:0},
    st:{tagName:"device1-3",value:0},
  },

  //事件捕捉回调
  Event:function(event){
    // event.name 可能是 mouse:down、mouse:up、mouse:over
    //this.setCtr('cecece');
    if(event == "mouse:down")
    {
        var state = this._getState();
        if(state)
        {
          if(state == 'zz')
          {
            this.setCtr('device1-2','1');
            this.setCtr('device1-1','0');
            this.setCtr('device1-3','0');
          }
          else if(state == 'fz')
          {
            this.setCtr('device1-3','1');
            this.setCtr('device1-2','0');
            this.setCtr('device1-1','0');
          }
          else if(state == 'st')
          {
            this.setCtr('device1-1','1');
            this.setCtr('device1-2','0');
            this.setCtr('device1-3','0');
          }
        }
    }

  },
  // 数据组态的方法，每次有属性（tag数据）的更新都将触发此方法
  data_handle:function (){
    if(this.attr.zz.value == '1')
    {
      this.setState('zz');
    }
     if(this.attr.fz.value == '1')
    {
      this.setState('fz');
    }
    if(this.attr.st.value == '1')
    {
      this.setState('st');
    }

  },
  // 数据消费的方法
  consume_data:function(state){
    //console.log('数据驱动');
    //console.log(state);
    switch(state )
    {
      case 'zz':
        this.animate.rotate = 1;
        break;
      case 'fz':
         this.animate.rotate = 2;
        break;
      case 'st':
         this.animate.rotate = 0;
        break;
    }
  },

  //自定义方法 获取当前状态
  _getState:function(){
    if(this.animate.rotate == 1)
    {
      return 'zz';
    }
    else if(this.animate.rotate == 2)
    {
       return 'fz';
    }
    else if(this.animate.rotate == 0)
    {
       return 'st';
    }
    else {
      return null;
    }
  },

}`);
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
