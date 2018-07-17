<template>
  <div data-options="region:'east',split:true,collapsed:false	,title:'组件配置窗口'" style="min-width:210px;width:250px;padding:1px;">
		<div class="easyui-accordion" id="ac" data-options="multiple:false" style="height:100%;border: 0px;">
			<div title="自定义属性设置" data-options="iconCls:'icon-edit',selected:false" style="overflow:auto;padding:0px;border: 0px;">
        <div>
          <button @click="addAttr('showWin')" class="easyui-linkbutton" data-options="iconCls:'icon-add'">添加属性</button>
          <button @click="delAttr('showWin')" class="easyui-linkbutton" data-options="iconCls:'icon-edit'">删除属性</button>
          <button @click="saveAsTemplate('showWin')" class="easyui-linkbutton" data-options="iconCls:'icon-edit'">存为模板</button>
        </div>
        <div style="margin:10px 0 10px">
          选择模板：
          <select id="selectedTemplate">
            <option value="0">请选择</option>
            <option :key="t.templateName" :value="t.templateName" v-for="t in pixelTemplateList">{{ t.templateName }}</option>
          </select>
          <button @click="useTemplate('showWin')" class="easyui-linkbutton">使用模板</button>
        </div>


        <!-- 添加属性 dlg-newAttr -->
        <div id="dlg-newAttr" class="easyui-dialog" title="新建属性" data-options="modal:true,closed:true,iconCls:'icon-add'" style="width:330px;height:210px;padding:10px;">

            <div class="easyui-panel">
            <form id="f-newAttr" method="post">
                <table cellpadding="5">
                    <tr>
                        <td>attrName:</td>
                        <td><input id="attrName" class="easyui-textbox" type="text" name="name" data-options="required:true"></input></td>
                    </tr>
                    <tr>
                        <td>tagName:</td>
                        <td><input id="tagName" class="easyui-textbox" type="text" name="describe"></input></td>
                    </tr>
                   <!--  <tr>
                        <td>弹出页面:</td>
                        <td><input class="easyui-switchbutton" id="isdiag" name="isdiag"></td>
                    </tr> -->
                </table>

                <div style="text-align:center;padding:5px">
                    <a href="javascript:void(0)" class="easyui-linkbutton" @click="addAttr()">添加</a>
                </div>
            </form>
        </div>
        </div>
        <!-- 添加属性 end -->

        <!-- 存为模板 dlg-saveAsTemplate -->
        <div id="dlg-saveAsTemplate" class="easyui-dialog" title="存为模板" data-options="modal:true,closed:true,iconCls:'icon-add'" style="width:330px;height:210px;padding:10px;">

            <div class="easyui-panel">
            <form id="f-newAttr" method="post">
                <table cellpadding="5">
                    <tr>
                        <td>模板名:</td>
                        <td><input id="templateName" class="easyui-textbox" type="text" name="name" data-options="required:true"></input></td>
                    </tr>
                    <tr>
                        <td>备注:</td>
                        <td><input id="remark" class="easyui-textbox" type="text" name="describe"></input></td>
                    </tr>
                   <!--  <tr>
                        <td>弹出页面:</td>
                        <td><input class="easyui-switchbutton" id="isdiag" name="isdiag"></td>
                    </tr> -->
                </table>

                <div style="text-align:center;padding:5px">
                    <a href="javascript:void(0)" class="easyui-linkbutton" @click="saveAsTemplate">保存</a>
                </div>
            </form>
        </div>
        </div>
        <!-- 存为模板 end -->

				<table class="easyui-propertygrid" id="pg" style="height: auto" data-options="
				url:null,
				method:'get',
				height: 'auto',
				showGroup: false,
				scrollbarSize: 0,
				columns:[[
          	{field:'attrName',title:'attrName',width:100,sortable:false},
					  {field:'value',title:'tagName',width:100,resizable:false}
				]],
				">
				</table>

			</div>

      <div title="内部属性设置" data-options="iconCls:'icon-edit',selected:true" style="overflow:auto;padding:0px;border: 0px;">


				<table class="easyui-propertygrid" id="innerAttr" style="height: auto" data-options="
				url:null,
				method:'get',
				height: 'auto',
				showGroup: false,
				scrollbarSize: 0,
				columns:[[
          	{field:'key',title:'键',width:100,sortable:false},
					  {field:'value',title:'值',width:100,resizable:false}
				]],
				">
				</table>

			</div>

			<div id="gradient" title="渐变属性设置" data-options="iconCls:'icon-edit',selected:false" style="display: none;overflow:auto;padding:0px;border: 0px;">
				<table class="easyui-propertygrid" id="gradientpg" style="width: 100%;" data-options="
				url:null,
				method:'get',
				height: 'auto',
				showGroup: false,
				scrollbarSize: 0,
				columns:[[
					{field:'name',title:'键',width:100,sortable:false},
					{field:'value',title:'值',width:100,resizable:false}
				]],
				">
				</table>

			</div>

			<div title="动作绑定" data-options="iconCls:'icon-filter',selected:false" style="padding:0px;">
				<div id="setAction">
					<div class="easyui-panel" id="module-tools">
						<a href="javascript:void(0)" class="easyui-linkbutton" data-options="plain:true,iconCls:'icon-add'" onclick="openBoundDataSource();" title="添加动作"></a>
						<a href="javascript:void(0)" class="easyui-linkbutton" data-options="plain:true,iconCls:'icon-cancel'" id="remove-selected1" onclick="rmAction();" title="删除选中"></a>
					</div>
					<table style="width:246px" data-options="url:null,autoRowHeight:true" id="module-action">
						<thead>
							<tr>
								<th>数据</th>
								<th>动作</th>
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
				</div>
			</div>
		</div>


    <div class="easyui-accordion" id="ac1" data-options="multiple:true" style="border: 0px;">
			<div title="画布设置" data-options="iconCls:'icon-edit',selected:false" style="overflow:auto;padding:0px;border: 0px;display: none;">
				<table class="easyui-propertygrid" id="pg1" style="height: auto" data-options="
				url:null,
				method:'get',
				height: 'auto',
				showGroup: false,
				scrollbarSize: 0,
				columns:[[
					{field:'name',title:'键',width:60,sortable:false},
					{field:'value',title:'值',width:60,resizable:false}
				]],
				">
				</table>
			 <form id="form_upload"  method="post" enctype='multipart/form-data'>
				<input type="file" id="bg_file" name="bg_file" style="display:none;">
			</form>
			</div>
		</div>


		<div class="easyui-accordion" id="ac1" data-options="multiple:true" style="border: 0px;">
			<div title="画布设置" data-options="iconCls:'icon-edit',selected:false" style="overflow:auto;padding:0px;border: 0px;display: none;">
				<table class="easyui-propertygrid" id="pg1" style="height: auto" data-options="
				url:null,
				method:'get',
				height: 'auto',
				showGroup: false,
				scrollbarSize: 0,
				columns:[[
					{field:'name',title:'键',width:60,sortable:false},
					{field:'value',title:'值',width:60,resizable:false}
				]],
				">
				</table>
			 <form id="form_upload"  method="post" enctype='multipart/form-data'>
				<input type="file" id="bg_file" name="bg_file" style="display:none;">
			</form>
			</div>
		</div>

		<div class="easyui-accordion" id="ac2" data-options="multiple:true" style="border: 0px;">
			<div title="Dom属性设置" data-options="iconCls:'icon-edit',selected:false" style="overflow:auto;padding:0px;border: 0px;display: none;">
				<table class="easyui-propertygrid" id="dom_attr" style="height: auto" data-options="
					url:null,
					method:'get',
					height: 'auto',
					showGroup: false,
					scrollbarSize: 0,
					columns:[[
						{field:'name',title:'键',width:100,sortable:false},
						{field:'value',title:'值',width:100,resizable:false}
					]]
				">
				</table>
			</div>
			<div title="Dom事件设置" data-options="iconCls:'icon-edit',selected:false" style="overflow:auto;padding:0px;border: 0px;display: none;">
				<table class="easyui-datagrid" id="dom_event" style="width:235px;height: auto" data-options="">
					<thead>
						<tr>
							<th data-options="field:'key',width:120">键</th>
							<th data-options="field:'value',width:110">值</th>
						</tr>
			    </thead>
					<tbody>
				 </tbody>
				</table>
			</div>
		</div>

	</div>
</template>

<script>
import {mapGetters,mapMutations,mapActions} from 'vuex';


export default {
  data(){
    return {
      subComHandle:new Map(),
    }
  },
  mounted(){

    this.initEasyUI();
    //this.insertPropertyRow();
    console.log("insert");

  },
  computed:{
    ...mapGetters({
      getActivePixel:"project/getActivePixel",
       subscribe:"MQ/subscribe",
       pixelTemplateList:"project/getPixelTemplateList",
       client:'project/getClient',//
    }),

  },

  methods:{
    ...mapMutations({
       setActivePixel:"project/setActivePixel",
       addActivePixelAttr:"project/addActivePixelAttr",
       updateActivePixelAttr:"project/updateActivePixelAttr",
       delActivePixelAttr:'project/delActivePixelAttr',
       publish:"MQ/publish"
    }),
    ...mapActions({
      usePixelTemplate:'project/usePixelTemplate',
    }),

    // 添加attr 属性
    addAttr(flag){
      if(!this.getActivePixel){
        $.messager.alert("提醒","未选中图元","warning");
        return
      }
      var dlg = this.subComHandle.get("addAttrDlg");
      if(flag == 'showWin'){
        dlg.window("open");
        return;
      }

      var attrName  = $("#attrName").textbox("getValue");
      var tagName = $("#tagName").textbox("getValue");

      if((!attrName) || (!tagName)){
        $.messager.alert("提醒","数据不完整","warning");
        return
      }

      // 检测图元的属性是否已经存在冲突？
      for(let attr of this.getActivePixel.scada_attr.attr){
        //console.log(attr);
        if(attr.attrName == attrName){
          $.messager.alert("错误","本图元已经存在同名的属性，无法重复添加","error");
          return;
        }
      }

      this.getActivePixel.scada_attr.attr.push({attrName:attrName,tagName:tagName,value:"",editor:'text'});
      dlg.window("close");


    },

    // 删除attr 属性
    delAttr(flag){
      let selected = this.subComHandle.get('attrCom').propertygrid('getSelected');
      if(!selected){
        $.messager.alert('警告','请选择需要删除的属性');
        return;
      }
      var _this = this;
      if(flag == "showWin"){
        $.messager.confirm({
          title:'提问',
          content:'是否要删除这条属性',
          fn:function(r){
            if(r){
              _this.delAttr();
            }
          },
        })
        return;
      }
      var index = this.subComHandle.get('attrCom').propertygrid("getRowIndex",selected)
      //console.log(index);
      //return;
      this.subComHandle.get('attrCom').propertygrid("deleteRow",index);
      this.delActivePixelAttr(selected);


    },

    initEasyUI(){
      var _this = this;
      // 初始化属性组件
      let attrCom = $("#pg").propertygrid({
        //onAfterEdit onEndEdit onBeginEdit
        onEndEdit:function(index,row,change){
          //console.log(index,row,change);
          // 更新本图元的属性到state
          //console.log(change,row);
          //console.log('begin edit ');
          _this.updateActivePixelAttr(row);
        }
      });
      this.subComHandle.set('attrCom',attrCom);// 缓存自定义属性的控件

      $("#innerAttrpg").propertygrid({
         onEndEdit:function(index,row,change){
           console.log("propertygrid changed");
           console.log(index,row,change);
         }
       });



      // 初始化属性添加窗口
      let addAttrDlg = $("#dlg-newAttr");
      this.subComHandle.set("addAttrDlg",addAttrDlg);
    },

    activePixelChange(pixel){
      var _this = this;
      //console.log("attr com active pixel changed");
      var rows = this.subComHandle.get('attrCom').propertygrid("getRows");
      this.updateActivePixelAttr(rows);// 强制更新
      //console.log(rows);
      //console.log('强制更新');
      setTimeout(function() {
        _this.setActivePixel(pixel);
      }, 10);
      //console.log(this.getActivePixel.scada_attr.script);
      //console.log("attr com active pixel changed");
    },


    pixelSelected(pixel){

      // 不是第一次选中图元
      if(this.getActivePixel){
        this.activePixelChange(pixel);
      }
      else
      {
        this.setActivePixel(pixel);
      }
      //console.log(this.getActivePixel.get("height"));
      //console.log(this.getActivePixel.width);
    },

    docTabClose(){
      this.activePixelChange(null);
    },

    // 将当前图元保存为模板
    saveAsTemplate(flag){

     if(!this.getActivePixel){
        $.messager.alert("提醒","未选中图元","warning");
        return
      }

      if(flag == "showWin"){
        $("#dlg-saveAsTemplate").window("open");
        return;
      }
      let tname = $("#templateName").textbox("getValue");
      let remark = $("#remark").textbox("getValue");
      if(tname)
      {
        // 清空attr 的tagName
        let attr = [];
        for(let a of this.getActivePixel.scada_attr.attr){
          a.tagName = '';
          attr.push(a);
        }

        let template = {templateName:tname,remark:remark,pixel_attr:{script:this.getActivePixel.scada_attr.script,attr:attr}};
        this.publish({topic:"saveAsTemplate",message:template});
        $("#dlg-saveAsTemplate").window("close");
        console.log(template);
      }

    },

    // 使用模板
    useTemplate(flag){
      if(!this.getActivePixel){
        $.messager.alert("提醒","未选中图元","warning");
        return
      }
      var _this = this;
      let selected = $("#selectedTemplate").val();
      if(selected == "0"){
        $.messager.alert("警告","请选择要使用的模板","warning");
        return;
      }
      if(flag == "showWin"){
        $.messager.confirm({
          title:'询问',
          msg:"您使用改模板后，原图元的相关数据可能被覆盖,是否继续？",
          fn:function(r){
            if(r){
               _this.useTemplate();
            }
          },
        });
        return;
      }
      if(!this.client){
        console.log("网络状态未连接");
        return;
      }
      this.client.emit("scada/toServer/getPixelTemplateDetail",{templateName:selected},function(data){
        console.log(data);
        if(data.status == 1){
          _this.usePixelTemplate(data.data.pixel.pixel_attr);
        }
        else{
          //$.messager.alert('');
          console.log(data);
        }
      });

      console.log(selected);
      console.log("使用模板");

    },

  },

  watch:{

    // 监听自定义属性的变化
    "getActivePixel.scada_attr":{
      deep:true,
      handler:function(){

        let attrCom = this.subComHandle.get('attrCom');
        if(!this.getActivePixel){
          attrCom.propertygrid("loadData",{ total: 0, rows: [] })
          $("#innerAttr").propertygrid("loadData",{ total: 0, rows: [] });

          return;
        }
        //return;
        //console.log('active pixel attr change');
        //console.log(this.getActivePixel.scada_attr);

        //console.log(this.getActivePixel);

        // 载入 自定义属性
        if(attrCom){
          let attr_list = [];
          if(typeof(this.getActivePixel.scada_attr) == "undefined")
          {
            return;
          }
          let pixel_attr = this.getActivePixel.scada_attr.attr;
          //console.log(pixel_attr);
          for(let attr of pixel_attr){
            attr_list.push({attrName:attr.attrName,value:attr.tagName,editor:attr.editor});
          }
          attrCom.propertygrid("loadData",attr_list);
        }

      }
    },

    // 测试监听图元所有属性的变化
    "getActivePixel":{
      deep:true,
      handler:function(){

        //console.log("active pixel changed");
        //this.test();
        //console.log(this.getActivePixel);
        //console.log(this.getActivePixel);
        if(this.getActivePixel)
        {
           // 载入内部属性
          let innerAttr = [
            {key:'上边沿坐标',value:this.getActivePixel.top,editor:'text'},
            {key:'左边沿坐标',value:this.getActivePixel.left,editor:'text'},
            {key:'宽度',value:(this.getActivePixel.width * this.getActivePixel.scaleY).toFixed(0) ,editor:'text'},
            {key:'高度',value:(this.getActivePixel.height * this.getActivePixel.scaleX).toFixed(0),editor:'text'},
          ];
          $("#innerAttr").propertygrid("loadData",innerAttr);
        }

      }
    },

    // MQ 通信监听
    "subscribe":{
      deep:true,
      handler:function(){
       // console.log('attr listen subscribe ');
        var MQmap = {
          "activePixelChange": this.activePixelChange,// 当conten 组件中的 激活的图元发生变化，为了保证图元属性中已经改变的部分不丢失，需要本组件保存所有的图元数据然后在做相应的处理
          "pixelSelected":this.pixelSelected,// 图元被选中 的处理方法
          "docTabClose":this.docTabClose,//关闭文档tab处理的事件
        }
        //console.log(this.subscribe);
        if(MQmap[this.subscribe.topic]){
          MQmap[this.subscribe.topic](this.subscribe.message);
        }
      }
    },

  }
}
</script>

