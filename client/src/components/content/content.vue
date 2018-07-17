<template>
  <div data-options="region:'center'" style="width: 100%;height: 100%;border: 0px;margin-top:26px;">
    <div id="tab-toolbar" style="background-color: #2c2f36;padding-left: 5px;height:26px; position:absolute;top:0px;">
      <a href="javascript:void(0)" @click="publish({topic:'saveProject',message:''})" class="easyui-linkbutton" iconCls="icon-save" plain="true">保存</a>
       <a style="display: ;" href="javascript:void(0)" id="copyCloneLink" class="easyui-linkbutton" iconCls="icon-edit" plain="true" @click="oneKeyTag('show')">一键Tag</a>
      <a href="javascript:void(0)" id="cloneOrClipPasteLink" class="easyui-linkbutton" iconCls="icon-filter" plain="true" @click="cloneOrClipPaste">粘贴</a>

        <a style="display:none ;" href="javascript:void(0)" id="copyCloneLink" class="easyui-linkbutton" iconCls="icon-add" plain="true" onclick="copyClone">克隆</a>
        <a v-show="this.getActivePixel" href="javascript:void(0)" id="copyToLink" class="easyui-linkbutton" iconCls="icon-filter" plain="true" @click="copyTo">复制</a>
        <a style="display: none;" href="javascript:void(0)" id="cutToLink" class="easyui-linkbutton" iconCls="icon-cut" plain="true" onclick="cutTo();">剪切</a>
        <a style="display: none;" href="javascript:void(0)" id="addGroupLink" class="easyui-linkbutton" iconCls="icon-filter" plain="true" onclick="addGroup();">组合</a>
        <a style="display: none;" href="javascript:void(0)" id="delGroupLink" class="easyui-linkbutton" iconCls="icon-filter" plain="true" onclick="delGroup();">取消组合</a>
        <a style="display: none;" href="javascript:void(0)" id="removeSelectLink" class="easyui-linkbutton" iconCls="icon-cancel" plain="true" onclick="removeSelect();">删除选中</a>
        <a style="display: none;" href="javascript:void(0)" id="sendBackwardsLink" class="easyui-linkbutton" iconCls="icon-redo" plain="true" onclick="sendBackwards();">下移一层</a>
        <a style="display: none;" href="javascript:void(0)" id="sendToBackLink" class="easyui-linkbutton" iconCls="icon-redo" plain="true" onclick="sendToBack();">移至底层</a>
        <a style="display: none;" href="javascript:void(0)" id="bringForwardLink" class="easyui-linkbutton" iconCls="icon-undo" plain="true" onclick="bringForward();">上移一层</a>
        <a style="display: none;" href="javascript:void(0)" id="bringToFrontLink" class="easyui-linkbutton" iconCls="icon-undo" plain="true" onclick="bringToFront();">移至顶层</a>
        <a style="display: none;" href="javascript:void(0)" id="alignLeftLink" class="easyui-linkbutton" iconCls="icon-filter" plain="true" onclick="alignLeft();">左对齐</a>
        <a style="display: none;" href="javascript:void(0)" id="alignCenterLink" class="easyui-linkbutton" iconCls="icon-filter" plain="true" onclick="alignCenter();">水平居中</a>
        <a style="display: none;" href="javascript:void(0)" id="alignRightLink" class="easyui-linkbutton" iconCls="icon-filter" plain="true" onclick="alignRight();">右对齐</a>
        <a style="display: none;" href="javascript:void(0)" id="alignTopLink" class="easyui-linkbutton" iconCls="icon-filter" plain="true" onclick="alignTop();">顶部对齐</a>
        <a style="display: none;" href="javascript:void(0)" id="alignMiddleLink" class="easyui-linkbutton" iconCls="icon-filter" plain="true" onclick="alignMiddle();">垂直居中</a>
        <a style="display: none;" href="javascript:void(0)" id="alignBottomLink" class="easyui-linkbutton" iconCls="icon-filter" plain="true" onclick="alignBottom();">底部对齐</a>
        <!-- <div ></div> -->
    </div>

    <!-- 一键Tag脚本 scriptDialog -->
    <div id="oneKeyTagScriptDialog" class="easyui-dialog" title="一键Tag脚本编辑" data-options="modal:true,closed:true,iconCls:'icon-save'" style="width:440px;height:690px;padding:10px;">
        <a style="displaynone ;" href="javascript:void(0)"  class="easyui-linkbutton" iconCls="icon-ok" plain="true" @click="oneKeyTag">运行</a>
        <div class="easyui-panel">
          <Editor  ref="editorInstance"></Editor>
		    </div>
    </div>
    <!-- 一键Tag脚本 end -->

    <div id="main-cont" class="easyui-tabs" style="width: 100%;height: 100%;border: 0px;">
      <input type="hidden" id="docChange" value="0">
      <input type="hidden" id="editAttributeId">
      <!-- <span class="dragbox" style="width: 70px!important;height: 40px!important;">
            			<input type="button" value="按钮1">
            		</span> -->
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import scada_model from "../scada/js/scada.model";
import content_model from './content.model';
import  { getRandomString } from "@/common/util"
import Editor from '../editor/editor'

export default {
  data() {
    return {
      canvas: new Map(),
      clipboard:null,// 剪贴板，缓存图元
    }
  },
  components:{
    Editor
  },
  mounted() {
    this.initEasyui();
  },
  methods: {
    ...mapMutations({
      delDocFromOpen: "project/delDocFromOpen",
      setDocCanvas: "project/setDocCanvas",
      publish: "MQ/publish",
      //getActiveDocFromOpenDoc: 'project/getActiveDocFromOpenDoc',
      setActivePixel: "project/setActivePixel",
      setActiveDocFromOpenDoc: "project/setActiveDocFromOpenDoc",
    }),


    // init Tab
    initEasyui() {
      var _this = this;
      $('#main-cont').tabs({
        onClose: function(title, id) {
          console.log(title, id);
          var doc = _this.delDocFromOpen({ doc_name: title });
          _this.publish({ topic: 'docTabClose', message: '' })
          /* if (doc) {
            _this.canvas.delete(doc.doc_id);
          } */
        },
        onSelect: function(title, index) {
          _this.setActiveDocFromOpenDoc({ doc_name: title });
        },
      })



    },

    // canvas 标签的自适应
    autoCanvas(){
      var _this = this;
      //通过HTML5的新特性MutationObserver监听canvas-div的属性变化，来触发设置canvas尺寸改变
      var setCanvasSize = function() {
        if(_this.getActiveDocFromOpenDoc)
        {
          var cWidth = $("#main-cont").width();
          var cHeight = $("#main-cont").height() - 35;
          var canvas = _this.getActiveDocFromOpenDoc.canvas;
          //console.log(_this.getActiveDocFromOpenDoc);
          canvas.setWidth(cWidth).setHeight(cHeight);
        }

      }
      var mo = new MutationObserver(setCanvasSize);
      var canvasDiv = document.getElementById("main-cont");
      var option = {
        'attribute': true,
        'attributeOldValue': true
      };
      mo.observe(canvasDiv, option);
    },

    // 添加标签
    async addTab(doc) {
      //id = "canvas";
      var title = doc.doc_name;
      var id = doc.doc_id;
      var _this = this;
      if ($('#main-cont').tabs('exists', title)) {
        $('#main-cont').tabs('select', title);
        console.log('select');
      }
      else {
        var content = '<canvas id="' + id + '" width="1000" height="800"></canvas>';
        $('#main-cont').tabs('add', {
          title: title,
          content: content,
          closable: true,
          tabWidth: 120,
          //id: id,
        });

        var canvas = await scada_model.initCanvasSync(id);
        if (doc.canvas) {
          // canvas = fab
          console.log(doc.canvas);
          canvas.loadFromJSON(doc.canvas.toJSON(['guid', 'doc_id', 'doc_name', 'scada_attr']));
        }

        //var canvas = scada_model.initCanvas(id);
        canvas.on({
          //元素被选中触发的代码
          "object:selected": function(object) {
            //_this.pixelSelected(object.target,canvas.guid);
            //_this.publish({topic:'pixelSelected',message:object.target});
            //_this.setActivePixel(object.target);
            //console.log(object.target._objects);
            //console.log(object.target);
            //console.log(object.selectedType);
            // 检测是单选还是多选
            let selectedPixel = [];
            for(let o of object.target._objects)
            {
              if(typeof(o.scada_attr) != "undefined")
              {
                selectedPixel.push(selectedPixel);
              }

            }
            if(selectedPixel.length <= 0)
            {
              object.target.selectedType_ = 'single';
            }
            else
            {
              object.target.selectedType_ = 'multi';
            }

            _this.publish({ topic: 'pixelSelected', message: object.target });
          },
          //选区被取消
          "selection:cleared": function(object) {
            //console.log('clear');
            //console.log(object);
            //_this.pixelUnselected();
            //_this.publish({topic:'pixelUnselected',message:object});
            //_this.setActivePixel(null);

            //通知attr 组件 活动图元已经发生变动，请做好相应的工作
            //_this.publish(("activePixelChange",null));
            _this.publish({ topic: 'activePixelChange', message: null });
            console.log('图元选区取消');
          },
        });
        this.setDocCanvas({ doc_id: id, canvas: canvas });
        this.autoCanvas();
      }
    },

    // 向激活文档添加图元
    addPixelToDoc(pixelInfo) {

      var canvas = this.getActiveDocFromOpenDoc.canvas;
      console.log("添加图元");
      var current_doc = this.getActiveDocFromOpenDoc;
      //console.log(canvas);
      //console.log(this.getActiveDocFromOpenDoc);
      //
      content_model.addPixelToDoc(canvas, pixelInfo, current_doc.doc_id).then(function(pixel) {
      });
    },

    // 复制或者
    copyTo(){
      this.clipboard = content_model.copyTo(this.getActiveDocFromOpenDoc.canvas);
      //console.log(this.clipboard);
    },

    // 粘贴
    cloneOrClipPaste(){
      console.log("粘贴");
        if(this.clipboard) {
        //var actObj = canvas.getActiveObject();
        var canvas = this.getActiveDocFromOpenDoc.canvas;
        var actObj = this.clipboard.singleClone;
        //console.log('active object'+actObj);
        var clone = fabric.util.object.clone(actObj);
        //var clone = actObj.clone();
        ///console.log(actObj);
        //console.log(actObj.guid);
        //clone.guid = getRandomString(10);
        //console.log(clone);
        clone.set({guid:getRandomString(10),left: actObj.left+10,top: actObj.top+10});
        //console.log(clone.guid);
        console.log(clone === actObj);
        clone.setCoords();
        canvas.add(clone);
        canvas.renderAll();
      }
      //content_model.cloneOrClipPaste(this.clipboard,this.getActiveDocFromOpenDoc.canvas);
    },

    // 一键Tag
    oneKeyTag(flag)
    {
      console.log(this.getActivePixel);
      console.log(flag);
      if(!this.getActivePixel)
      {
        console.log('not  active pixel');
        return;
      }

      if(flag == "show")
      {

        if(!this.$refs.editorInstance.getValue())
        {
          this.$refs.editorInstance.setValue(content_model.oneKeyTagScript);
        }
        setTimeout(function() {
           $("#oneKeyTagScriptDialog").window("open");
        }, 10);

      }
      else
      {
        var  selectedType = this.getActivePixel.selectedType_;
        //$("#oneKeyTagScriptDialog").window("open");
        let script = this.$refs.editorInstance.getValue().replace(/(\n)+|(\r\n)+/g, "");
        //let script = content_model.oneKeyTagScript.replace(/(\n)+|(\r\n)+/g, "");
        //console.log();
        //JSON.parse(script);
        if(!script)
        {
          return;
        }

        let exec =  eval("   (()=>{ return  "+script+" })()");
        let pixelList = [];
        if(selectedType =="single")
        {
          pixelList[0] = this.getActivePixel;
        }
        else if(selectedType =="multi")
        {
          pixelList = this.getActivePixel._objects;
        }
        if(pixelList.length > 0)
        {
          exec.run(pixelList);
          $.messager.alert({title:'通知',msg:'执行完成',icon:'info'});
        }
      }
      },
  },
  computed: {
    ...mapGetters({
      getOpenDoc: "project/getOpenDoc",
      subscribe: "MQ/subscribe",
      getActiveDocFromOpenDoc: "project/getActiveDocFromOpenDoc",
      getActivePixel: "project/getActivePixel",
    }),
  },
  watch: {
    "getOpenDoc.length": {
      deep: true,
      handler: function() {
        console.log('open doc  changge');
        //console.log(this.getOpenDoc.length);
        for (let doc of this.getOpenDoc) {
          this.addTab(doc);
        }
      }
    },

    "subscribe": {
      deep: true,
      handler: function() {

        var MQmap = {
          "addPixel": this.addPixelToDoc,
          //"pixelSelected":,
        }
        if (MQmap[this.subscribe.topic]) {
          MQmap[this.subscribe.topic](this.subscribe.message);
        }

      }
    },
    "getActivePixel": {
      deep: true,
      handler: function() {
        //console.log('active pixel changge ');
      }
    }

  },
}
</script>

