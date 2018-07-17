<template >
  <div id="main-layout" class="easyui-layout" fit="true">
    <navBar @projectCreated="createProject" :project="project"></navBar>
    <leftMenu :project="project" @addNewDoc="addNewDoc"></leftMenu>
    <Center @initCanvas="initCanvas"></Center>
    <attr></attr>
  </div>
</template>

<script>

import { serialize, getRandomString,clone } from '@/common/util'
import { mapGetters, mapMutations } from 'vuex'
import scada_option from './js/scada.js'
import scada_model from './js/scada.model'

import Editor from '@/components/editor/editor'
import leftMenu from '@/components/leftMenu/leftMenu'
import navBar from '@/components/navBar/navBar'
import attr from '@/components/attr/attr'
import Center from '@/components/content/content'
export default {
  data() {
    return {
      client: null,
      dataSourceList: [],// 数据源列表
      deviceSourceList: [],// 设备源列表
      tyList: [],// 图元列表
      codeEditor: {},//
      canvas: null,//当前画布,

      // 空图元默认的脚本代码
      default_script: scada_option.pixel_default_script,

      // 图元模板列表
      template_list: [
        /* ['fengji','风机'],
        ['fengji2','风机2'], */
        /*  {label:'fengji',value:"风机"},
         {label:'wenduji',value:"温度计"}, */
        { 'text': '风机', "value": "fengji" },
        { 'text': '风机1', "value": "fengji1" },
        // {label:'wenduji',value:"温度计"},
      ],

      // 子窗口句柄缓存
      sub_window_cache: new Map(),

      // 项目缓存组件
      project: null,

      // 缓存当前激活文档
      active_doc: null,

      // 缓存当前激活图元
      active_pixel: null,
    }
  },
  mounted() {
    var _this = this;
    /* setTimeout(function() {
      _this.addNewDoc();
    }, 1000); */

    /* $.parser.onComplete = function(){
       //alert('complete');
      console.log('complate');
    } */
    console.log('scada5');
$.get("http://localhost:81/api/User/name/index", { token: 12, time: "2pm" },
      function(data) {
        console.log("Data Loaded: " + data);
    });
    this.initConnection();
    return;
    this.initEasyUi();



    this.initEditor();
  },
  methods: {
    ...mapMutations({
      setProjectDoc: "project/setProDoc",// 将文档添加到项目的state中
      setActivePixel: "project/setActivePixel",
      setActiveDoc: "project/setActiveDoc",
      updatePixelScript: 'project/updatePixelScript', // 更新编辑区的内容
      setCurrentProjectToState: "project/setCurrentProject",// 设置当前项目数据到state
      setDocCanvas: "project/setDocCanvas",
      setPixelTemplateList:"project/setPixelTemplateList",// 设置图元的脚本
      setClient:'project/setClient',
    }),

    // 创建项目 这个方法将监听来自子组件navBar的projectCreated 事件的推送
    createProject(project) {

      console.log("检测到项目已经创建");
      // 已经存在项目
      /* if(this.project){
        if(!confirm('此操作可能会覆盖已有项目，请先保存并关闭已有项目')){
          return;
        }
      }

      var _this = this
      var pro_name = prompt("项目名");
      var pro_desc = prompt("项目描述");
      var project = scada_model.createProject(pro_name,pro_desc); */
      this.project = project;
      this.active_doc = scada_model.getProjectMainDoc(project);// 获取该项目中的主文档 作为激活文档。
      console.log(project);
      // 初始化canvas画布
      /* setTimeout(function() {
        if(!_this.canvas){
           _this.canvas = _this.initCanvas();
        }
      }, 100); */
      //console.log(project);
    },
    // 初始化easyui 组件
    initEasyUi() {
      var _this = this;
      return;
      // 初始化 添加新属性的窗口
      //var win_id = "addPixelAttrWindow";
      var win_dom_handle = $("#addPixelAttrWindow");
      win_dom_handle.window({
        width: 400,
        height: 200,
        modal: true,
        closed: true,
        resizable: false,
        collapsible: false,
        maximizable: false,
        minimizable: false,
        title: '添加新属性'
      });

      $("#createNewDocWindow").window({
        width: 400,
        height: 200,
        modal: true,
        closed: true,
        resizable: false,
        collapsible: false,
        maximizable: false,
        minimizable: false,
        title: '新建文档'
      });

      this.sub_window_cache.set('addPixelAttrWindow', win_dom_handle);
      console.log('easyui init');
      /* $.parser.onComplete = function(){
        $('.template_list_combox').combobox('loadData',_this.template_list);
      } */


    },

    // 添加数据源
    addDataSource() {
      let id = $("#data_source_id").val();
      let attr = $("#data_source_attr").val();
      if (id) {
        let data = { topic: id, attr: attr, };
        this.client.emit('scada/toServer/addDataSource', data, function(data) {
          console.log(data);
          alert(data.msg);
        });
      }
    },

    // 向画布中添加新图元
    addNewPixel(handle_type) {

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
      var new_pixel_id = getRandomString(10);
      var new_pixel_text = "新建图元";
      var script = this.default_script;
      //console.log(pixel_id);return;

      var pixel = scada_model.createNewPixel(new_pixel_id, 'fengji1', new_pixel_text, '', script);
      if (pixel) {
        if (this.canvas) {
          this.canvas.add(pixel);

          this.project = scada_model.addPixelToDoc(this.project, this.active_doc.doc_id, pixel);// 添加图元到项目结构
        }
      }

    },

    // 将目前图元添加为模板
    savePixelAsTemplate() {

    },

    // 添加新文档 doc_id 文档id、is_main_doc 是否是主文档
    createNewDoc(flag) {
      if (flag == "showWin") {
        $("#createNewDocWindow").window("open");
        return;
      }

      var doc_name = $("#doc_name").textbox('getValue');
      var doc_desc = $("#doc_desc").textbox('getValue');
      if (doc_desc && doc_name) {
        var doc = scada_model.createDoc(doc_name, doc_desc);
        scada_model.addDocToProject(this.project, doc);
        $("#createNewDocWindow").window("close");
        //console.log();
      }
    },

    addNewDoc(flag) {
      console.log(flag);
      //$('#dlg-newDoc').window('open');
      return;


      function addTab(title, id) {
        if ($('#main-cont').tabs('exists', title)) {
          $('#main-cont').tabs('select', title);
        } else {
          var content = '<canvas id="' + id + '" width="1000" height="800"></canvas>';

          $('#main-cont').tabs('add', {
            title: title,
            content: content,
            closable: true,
            tabWidth: 120
          });

          //getCanvasData(id,title);
        }

      }
      var id = "can"
      //addTab('新建文档',id)
      //console.log(document.getElementById(id));
      //this.initCanvas(id);
    },

    // 切换文档
    changeActiveDoc(doc_id) {
      if (doc_id) {
        var doc = scada_model.getDocFromProjectById(this.project, doc_id);
        if (doc) {

          // 序列化canvas画布并清空画布 ，重新载入新文档的画布
          var canvas_json = this.canvas.toJSON(['guid', 'script', 'pro_id', 'doc_id', 'desc', 'pname', 'pixel_object']);
          this.active_doc.canvas_json = canvas_json;

          this.canvas.clear();
          //console.log(canvas_json);return;
          //doc.canvas_json = canvas_json;
          this.active_doc = doc;
          //载入新文档的canvas数据
          if (doc.canvas_json) {
            this.canvas.loadFromJSON(doc.canvas_json);
          }

          this.active_pixel = null;

        }
      }
    },
    // 为图元添加自定义属性
    addPixelAttr(flag) {
      let win = this.sub_window_cache.get("addPixelAttrWindow");
      if (flag == "showWin") {
        //console.log('open');
        if (win) {
          win.window("open");

        }
        return;
      }

      // 添加属性

      let attrName = $("#attrName").textbox('getValue');
      let tagName = $("#tagName").textbox('getValue');
      let remark = $("#remark").textbox('getValue');
      //console.log(attrName,tagName);
      if (attrName && tagName) {
        //检查是否有重名的属性
        if (scada_model.gettAttrInPixel(this.active_pixel, attrName)) {
          alert('该属性已经存在,无法重复添加');
          return; // 已经存在
        }

        scada_model.addAttToPixel(this.active_pixel, { attrName: attrName, tagName: tagName, remark: remark, value: "" });
        win.window('close');
        return;
      }
      console.log('attrName or tagName is null');
      console.log(attrName, tagName);
      console.log($("#attrName"), $("#tagName"));


    },

    // 删除图元属性
    delPixelAttr(attrName) {
      scada_model.delAttrFromPixel(this.active_pixel, attrName);
      //console.log(attrName);
    },
    // fabric 载入 svg
    initCanvas(id) {
      // return;
      //console.log("初始化canvas");
      //return;
      console.log(id);
      var _this = this;
      var canvas = new fabric.Canvas(id, {
        width: 1000,
        height: 800,
      });

      canvas.on({
        //元素被选中触发的代码
        "object:selected": function(object) {
          _this.pixelSelected(object.target, canvas.guid);
        },
        //选区被取消
        "selection:cleared": function(object) {
          //console.log('clear');
          //console.log(object);
          _this.pixelUnselected();
        },
      });
      canvas.setBackgroundImage("/static/scada/images/back.png");
      //this.setDocCanvas({doc_id:id,canvas:canvas});
      console.log("初始化canvas");
      return canvas;
    },

    // 激活选中图元
    pixelSelected(pixel, canvas_guid) {

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
    pixelUnselected() {
      //return;
      console.log('物体被失选');
      this.active_pixel = null;
    },

    // 初始化脚本编辑器
    initEditor(editor) {
      if (editor) {
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
    initConnection() {
      var _this = this;
      var client = io.connect('http://localhost:3000');
      client.on('connect', function() {
        _this.client = client;
        console.log('client connect')
        _this.initConnectionCallback();

      });

      client.on('scada/toClient/dataSourcePublish', function(data) {

        for (var i in _this.dataSourceList) {
          if (_this.dataSourceList[i].topic == data.topic) {
            _this.dataSourceList[i].v = data.value;
          }
        }
      });

      client.on('scada/toClient/updateData', function(data) {

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
      this.client = client;
    },

    // 网络初始化完成回调
    initConnectionCallback(){
      this.getPixelTemplateList();
      this.setClient(this.client);
    },

    //设置当前激活的文档的css
    checkActiveDoc(doc_id) {
      if (this.active_doc.doc_id == doc_id) {
        return "doc_actitve";
      }
    },

    // 保存图元数据成为模板
    saveAsTemplate(data){
      this.client.emit("scada/toServer/savaAsTemplate",data,function(data){
        console.log(data);
        //saveAsTemplate
        $.messager.show({
            title:'操作提醒',
            msg:data.msg,
          });
      });
      console.log('保存模板');
      console.log(data);
    },

    // 从服务器端获取图元模板列表
    getPixelTemplateList(){
      var _this = this;
      this.client.emit("scada/toServer/getPixelTemplateList",{},function(data){
        console.log(data);
        if(data.status == 1){
          _this.setPixelTemplateList(data.data.pixelTemplateList);

        }
      });
      console.log('获取图元模板列表');
      //console.log(data);
    },

    // 保存项目
    saveProject(){
      var project = {};

       project = clone(this.getCurrentProject);

      //console.log(project === this.getCurrentProject);
      // 解析canvas 数据
      var pro_docs = [];
      for(let index in project.pro_docs){
        let canvas = project.pro_docs[index].canvas;
        //console.log(canvas);

        var canvas_json = canvas.toJSON(['scada_attr']);//canvas.toJSON(['scada_attr'])
        let doc = {canvas:canvas_json};
        for(let key in project.pro_docs[index]){
          if(key != 'canvas'){
            doc[key] = project.pro_docs[index][key];
          }
        }

        pro_docs.push(doc);
        //console.log(doc);
        //project.pro_docs[index] = doc;
        //console.log(this.getCurrentProject.pro_docs[index].canvas);
        //console.log(canvas);
        //console.log(canvas.toJSON(['scada_attr']).objects);
      }
      //console.log(project.pro_docs[0]);
      // 因为canvas 直接传输会被序列，所以需要重新设置生成一个对象来传递数据。
      var tranProject = {
        pro_id:project.pro_id,
        pro_name:project.pro_name,
        pro_desc:project.pro_desc,
        pro_docs:pro_docs,
      };
      //console.log(tranProject);
      //return;
      this.client.emit("scada/toServer/saveProject",tranProject,function(data){
        $.messager.show({
          title:'通知',
          msg:data.msg
        })
      });
    },

  },
  components: {
    Editor,
    leftMenu,
    navBar,
    attr,
    Center,
  },
  computed: {
    ...mapGetters({
      getProject: 'project/getProject',// 从 state 中获取 项目数据
      getActivePixel: 'project/getActivePixel',// 获取激活的图元
      getActivePixelScriptFromState: 'project/getActivePixelScriptFromState',// 绑定state中活动图元的script
      getOpenDoc: "project/getOpenDoc",
      subscribe: "MQ/subscribe",
      getCurrentProject:"project/getCurrentProject",
    }),

  },
  watch: {
    "template_list": {
      deep: true,
      handler: function() {
        console.log('change ');
        $('.template_list_combox').combobox('loadData', this.template_list);
      }
    },

    // 更新图元的数据到项目
    "active_pixel": {
      deep: true,
      handler: function() {
        if (this.active_pixel) {
          this.project = scada_model.updatePixel(this.project, this.active_pixel);
        }
      },
    },

    // 监听state 中 活动图元的代码的变动，随时更新到本实例的active_pixel 中
    "getActivePixelScriptFromState": {
      deep: true,
      handler: function() {
        //console.log('state script changge');
        this.active_pixel.script = this.getActivePixelScriptFromState;
      }
    },

    "project": {
      deep: true,
      handler: function(a, b) {
        console.log(a, b);
        console.log('project is change');
        this.setCurrentProjectToState(this.project);// 更新项目到state
      }
    },
    "getOpenDoc": {
      deep: true,
      handler: function() {
        //this.initCanvas("canvas");
      }
    },

    //消息队列监听
    "subscribe": {
      deep: true,
      handler: function() {
        var MQmap = {
          "saveAsTemplate": this.saveAsTemplate,// 保存图元模板
          "saveProject":this.saveProject,// 保存项目数据
        }
        if (MQmap[this.subscribe.topic]) {
          MQmap[this.subscribe.topic](this.subscribe.message);
        }
      }
    },
    // 监听文档列表的变化
    /* "project.pro_docs":{
      deep:true,
      function () {
        console.log("文档changed");
      }
    } */
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

#c {
  width: 400px;
  height: 300px;
  background: white;
}

.doc_list {
  text-decoration: underline;
  cursor: pointer;
}

.doc_actitve {
  background: gray;
  color: white;
}
</style>
