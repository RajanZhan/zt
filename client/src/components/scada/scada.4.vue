<template >
  <div>


    <!-- easyui window -->
     <div data-desc="添加自定义属性窗口" id="addPixelAttrWindow">
        <table>
          <tr>
            <td>attrName:</td>
            <td> <input id="attrName" class="easyui-textbox" data-options="" style="width:300px"></td>
          </tr>
          <tr>
            <td>tagName:</td>
            <td> <input id="tagName" class="easyui-textbox" data-options="" style="width:300px"></td>
          </tr>
          <tr>
            <td>备注:</td>
            <td> <input id="remark" class="easyui-textbox" data-options="" style="width:300px"></td>
          </tr>
         <!--  <tr>
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
          </tr> -->
        </table>
        <button @click="addPixelAttr" class="easyui-linkbutton">添加</button>
    </div>
    <div data-desc="添加文档窗口" id="createNewDocWindow">
        <table>
          <tr>
            <td>文档名称:</td>
            <td> <input id="doc_name" class="easyui-textbox" data-options="" style="width:300px"></td>
          </tr>
          <tr>
            <td>文档描述:</td>
            <td> <input id="doc_desc" class="easyui-textbox" data-options="" style="width:300px"></td>
          </tr>
         <!--  <tr>
            <td>备注:</td>
            <td> <input id="remark" class="easyui-textbox" data-options="" style="width:300px"></td>
          </tr> -->
         <!--  <tr>
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
          </tr> -->
        </table>
        <button @click="createNewDoc" class="easyui-linkbutton">添加</button>
    </div>


    <!-- 项目创建区 -->
    <button @click="createProject">新建项目</button>
    <button @click="saveProject">保存项目</button>

    <div v-if="project"  class="main">
      <fieldset>
        <legend>项目</legend>
        <div>项目名称:{{ project.pro_name }}</div>
        <div>项目描述:{{ project.pro_desc }}</div>
        <div>
          文档列表： <button @click="createNewDoc('showWin')">新建文档</button>
          <ul class="doc_list">
            <li :key="doc.doc_id" @click="changeActiveDoc(doc.doc_id)" :class="checkActiveDoc(doc.doc_id)" v-for="doc in project.pro_docs" :data-doc_id="doc.doc_id">{{ doc.doc_name }}</li>
          </ul>
        </div>

      </fieldset>

      <fieldset style="flex:2">
        <legend>图元设计</legend>
        <div>
          <button @click="addNewPixel">添加新图元</button>
          <canvas  id="c"></canvas>
        </div>
      </fieldset>
      <fieldset   style="flex:3">
          <legend>图元属性</legend>

          <table v-if="active_pixel">
            <tr>
              <td style="text-align:top">
               <tr>图元id: <input id="id" type="text" style="width:80px;" v-model="active_pixel.guid" />
               <tr>图元名: <input id="id" type="text" style="width:80px;" v-model='active_pixel.pname'/>
               <tr>图元备注: <input id="id" type="text" style="width:80px;" v-model='active_pixel.desc'/>
               <tr>
                  图元模板:
                  <select>
                    <option>请选择</option>
                    <option :key="t.value" v-for="t in template_list">{{ t.text }}</option>
                  </select>
               </tr>

               <tr>

                 <td>
                   自定义属性: <button @click="addPixelAttr('showWin')">添加</button>

                   <tr>
                     <td>attr</td>
                     <td>tagName</td>
                     <td>备注</td>
                     <td>操作</td>
                   </tr>
                   <tr :key="item.guid" v-for="item in active_pixel.pixel_object.static.attr">
                     <td><input style="width:40px;" v-model="item.attrName"></td>
                     <td><input style="width:60px;" v-model="item.tagName"></td>
                     <td><input style="width:60px;" v-model="item.remark"></td>
                     <td><button @click="delPixelAttr(item.attrName)">删除</button></td>
                   </tr>
                 </td>
               </tr>

              </td>

              <td>
                图元脚本：<Editor :scada_active_pixel="active_pixel"  @initEditor='initEditor'></Editor>
                <br>
                  <button @click="savePixelAsTemplate">保存为模板</button>
                <br>
              </td>
            </tr>
          </table>

          <br>


        </fieldset>

    </div>
  </div>

</template>

<script>

  import { serialize,getRandomString } from '@/common/util'
  import { mapGetters,mapMutations} from 'vuex'
  import  scada_option  from './js/scada.js'
  import  scada_model  from './js/scada.model'
  import Editor from '@/components/editor/editor'
  export  default {
    data(){
      return {
        client :null,
        dataSourceList:[],// 数据源列表
        deviceSourceList:[],// 设备源列表
        tyList:[],// 图元列表
        codeEditor:{},//

        canvas:null,//当前画布,

        // 空图元默认的脚本代码
        default_script:scada_option.pixel_default_script,

        // 图元模板列表
        template_list:[
          /* ['fengji','风机'],
          ['fengji2','风机2'], */
         /*  {label:'fengji',value:"风机"},
          {label:'wenduji',value:"温度计"}, */
          {'text':'风机',"value":"fengji"},
          {'text':'风机1',"value":"fengji1"},
         // {label:'wenduji',value:"温度计"},
        ],

        // 子窗口句柄缓存
        sub_window_cache:new Map(),

        // 项目缓存组件
        project:null,

        // 缓存当前激活文档
        active_doc:null,

        // 缓存当前激活图元
        active_pixel:null,

      }
    },
    mounted()
    {
      var _this = this;

      this.initEasyUi();

      this.initConnection();

      this.initEditor();
    },
    methods:{
      ...mapMutations({
        setProjectDoc:"project/setProDoc",// 将文档添加到项目的state中
        setActivePixel:"project/setActivePixel",
        setActiveDoc:"project/setActiveDoc",
        updatePixelScript:'project/updatePixelScript', // 更新编辑区的内容
      }),

      // 创建项目
      createProject(){

        // 已经存在项目
        if(this.project){
          if(!confirm('此操作可能会覆盖已有项目，请先保存并关闭已有项目')){
            return;
          }
        }

        var _this = this
        var pro_name = prompt("项目名");
        var pro_desc = prompt("项目描述");
        var project = scada_model.createProject(pro_name,pro_desc);
        this.project = project;
        this.active_doc = scada_model.getProjectMainDoc(project);// 获取该项目中的主文档 作为激活文档。

        // 初始化canvas画布
        setTimeout(function() {
          if(!_this.canvas){
             _this.canvas = _this.initCanvas();
          }
        }, 100);
        console.log(project);
      },

      // 保存项目
      saveProject(){

      },

      // 初始化easyui 组件
      initEasyUi()
      {
        var _this = this;

        // 初始化 添加新属性的窗口
        //var win_id = "addPixelAttrWindow";
        var win_dom_handle = $("#addPixelAttrWindow");
        win_dom_handle.window({
          width:400,
          height:200,
          modal:true,
          closed:true,
          resizable:false,
          collapsible:false,
          maximizable:false,
          minimizable:false,
          title:'添加新属性'
        });

        $("#createNewDocWindow").window({
          width:400,
          height:200,
          modal:true,
          closed:true,
          resizable:false,
          collapsible:false,
          maximizable:false,
          minimizable:false,
          title:'新建文档'
        });

        this.sub_window_cache.set('addPixelAttrWindow',win_dom_handle);
        console.log('easyui init');
        /* $.parser.onComplete = function(){
          $('.template_list_combox').combobox('loadData',_this.template_list);
        } */


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

        /* if(handle_type == 'showWindow') // 弹出添加图元窗口
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
        } */


        // 生成随机图元
        var new_pixel_id  = getRandomString(10);
        var new_pixel_text = "新建图元";
        var script = this.default_script;
        //console.log(pixel_id);return;

        var pixel = scada_model.createNewPixel(new_pixel_id,'fengji1',new_pixel_text,'',script);
        if(pixel)
        {
          if(this.canvas){
            this.canvas.add(pixel);

            this.project =  scada_model.addPixelToDoc(this.project,this.active_doc.doc_id,pixel);// 添加图元到项目结构
          }
        }

      },

      // 将目前图元添加为模板
      savePixelAsTemplate()
      {

      },

      // 添加新文档 doc_id 文档id、is_main_doc 是否是主文档
      createNewDoc(flag){
        if(flag == "showWin"){
          $("#createNewDocWindow").window("open");
          return;
        }

        var doc_name = $("#doc_name").textbox('getValue');
        var doc_desc = $("#doc_desc").textbox('getValue');
        if(doc_desc && doc_name){
          var  doc =  scada_model.createDoc(doc_name,doc_desc);
          scada_model.addDocToProject(this.project,doc);
           $("#createNewDocWindow").window("close");
          //console.log();
        }
      },

      // 切换文档
      changeActiveDoc(doc_id)
      {
        if(doc_id){
          var doc = scada_model.getDocFromProjectById(this.project,doc_id);
          if(doc){

            // 序列化canvas画布并清空画布 ，重新载入新文档的画布
            var canvas_json = this.canvas.toJSON(['guid','script','pro_id','doc_id','desc','pname','pixel_object']);
            this.active_doc.canvas_json = canvas_json;

            this.canvas.clear();
            //console.log(canvas_json);return;
            //doc.canvas_json = canvas_json;
            this.active_doc = doc;
            //载入新文档的canvas数据
            if(doc.canvas_json){
              this.canvas.loadFromJSON(doc.canvas_json);
            }

            this.active_pixel = null;

          }
        }
      },

      // 为图元添加自定义属性
      addPixelAttr(flag)
      {
        let win = this.sub_window_cache.get("addPixelAttrWindow");
        if(flag == "showWin")
        {
          //console.log('open');
          if(win)
          {
            win.window("open");

          }
          return;
        }

        // 添加属性

        let attrName = $("#attrName").textbox('getValue');
        let tagName = $("#tagName").textbox('getValue');
        let remark = $("#remark").textbox('getValue');
        //console.log(attrName,tagName);
        if(attrName && tagName)
        {
          //检查是否有重名的属性
          if(scada_model.gettAttrInPixel(this.active_pixel,attrName)){
            alert('该属性已经存在,无法重复添加');
            return; // 已经存在
          }

          scada_model.addAttToPixel(this.active_pixel,{attrName:attrName,tagName:tagName,remark:remark,value:""});
          win.window('close');
          return;
        }
        console.log('attrName or tagName is null');
        console.log(attrName,tagName);
        console.log($("#attrName"),$("#tagName"));


      },

      // 删除图元属性
      delPixelAttr(attrName)
      {
        scada_model.delAttrFromPixel(this.active_pixel,attrName);
        //console.log(attrName);
      },
      // fabric 载入 svg
      initCanvas(){
        var _this = this;
        var canvas = new fabric.Canvas('c',{
          width:400,
          height:300
        });
        canvas.on({
          //元素被选中触发的代码
          "object:selected":function(object){
            _this.pixelSelected(object.target,canvas.guid);
          },
          //选区被取消
          "selection:cleared":function(object){
             //console.log('clear');
             //console.log(object);
             _this.pixelUnselected();
           },
        });
        this.canvas = canvas;
        return canvas;
      },

      // 激活选中图元
      pixelSelected(pixel,canvas_guid){

        //return;
        console.log('物体被选中');
        console.log(pixel);
        console.log(pixel.pname);
        this.active_pixel = pixel;
        // 更新激活图元的脚本
        this.updatePixelScript(pixel.script);
        /* console.log(this.client);
         console.log('selected'); */
         //console.log(this.getProject.active_pixel);
        //this.setActivePixel({pixel:pixel,doc_id:canvas_guid}); // 更新被激活的图元到state
        //this.codeEditor.setValue(pixel.code);
        //console.log(this.getProject.active_pixel.guid);
        //console.log(pixel);
      },

      // 失去图元选区
      pixelUnselected(){
        //return;
        console.log('物体被失选');
        this.active_pixel = null;
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

      /* //代码编辑器的代码的更新的回掉函数
      editorContentUpdate(content){
        // 将新的代码更新到项目的state 中
      }, */

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
      },

      //设置当前激活的文档的css
      checkActiveDoc(doc_id){
        if(this.active_doc.doc_id == doc_id){
          return "doc_actitve";
        }

      }

    },
    components:{
      Editor,
    },
    computed:{
      ...mapGetters({
        getProject:'project/getProject',// 从 state 中获取 项目数据
        getActivePixel:'project/getActivePixel',// 获取激活的图元
        getActivePixelScriptFromState:'project/getActivePixelScriptFromState',// 绑定state中活动图元的script

      }),

    },
    watch:{
      "template_list":{
        deep:true,
        handler:function(){
          console.log('change ');
          $('.template_list_combox').combobox('loadData',this.template_list);
        }
      },

      // 更新图元的数据到项目
      "active_pixel":{
        deep:true,
        handler:function(){
          if(this.active_pixel){
            this.project = scada_model.updatePixel(this.project,this.active_pixel);
          }
        },
     },

     // 监听state 中 活动图元的代码的变动，随时更新到本实例的active_pixel 中
     "getActivePixelScriptFromState":{
          deep:true,
          handler:function(){
            //console.log('state script changge');
            this.active_pixel.script = this.getActivePixelScriptFromState;
        }
      },
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
  .doc_list{
    text-decoration:underline;
    cursor:pointer;
  }
  .doc_actitve{
    background:gray;
    color:white;
  }
</style>
