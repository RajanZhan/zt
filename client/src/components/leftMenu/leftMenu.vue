<!--左侧功能菜单-->
<template>
  <div data-options="region:'west',split:false,collapsible:false,title:'功能区'" id="left-control" style="width:180px;padding:0px;border: 0px;">


    <!-- 新建文档 dlg-newDoc -->
    <div id="dlg-newDoc" class="easyui-dialog" title="新建文档" data-options="modal:true,closed:true,iconCls:'icon-add'" style="width:330px;height:210px;padding:10px;">

        <div class="easyui-panel">
		    <form id="f-newDoc" method="post">
		        <table cellpadding="5">
		            <tr>
		                <td>文档名称:</td>
		                <td><input id="doc_name" class="easyui-textbox" type="text" name="name" data-options="required:true"></input></td>
		            </tr>
		            <tr>
		                <td>排序:</td>
		                <td><input class="easyui-numberbox" type="text" name="describe"></input></td>
		            </tr>
		            <tr>
		                <td>弹出页面:</td>
		                <td><input class="easyui-switchbutton" id="isdiag" name="isdiag"></td>
		            </tr>
		        </table>

		        <div style="text-align:center;padding:5px">
		            <a href="javascript:void(0)" class="easyui-linkbutton" @click="addNewDoc">添加</a>
		            <a href="javascript:void(0)" class="easyui-linkbutton" @click="addNewDoc('reset')">重置</a>
		        </div>
		    </form>
		</div>
    </div>
    <!-- 新建文档 end -->


		<div class="easyui-layout" data-options="fit:true" id="ss">
			<!-- 功能区选项卡 start -->
			<div data-options="region:'north',split:true" style="width:100%;min-height:250px;padding:0px;border: 0px;">
				<div class="easyui-tabs" data-options="tabWidth:55,tabHeight:30" style="">
					<div title="<span class='tt-inner'>画面</span>" style="padding:0px">
						<div>
							<input type="hidden" id="openProId" value="">	<!-- 标识当前打开的项目ID -->
							<div class="easyui-panel" id="tab-tools">
								<a href="javascript:void(0)" class="easyui-linkbutton" data-options="plain:true,iconCls:'icon-add'" @click="addNewDoc('showWin');" title="添加画面"></a>
								<a href="javascript:void(0)" class="easyui-linkbutton" data-options="plain:true,iconCls:'icon-edit'" onclick="openEditDoc();" title="编辑选中"></a>
								<a href="javascript:void(0)" class="easyui-linkbutton" data-options="plain:true,iconCls:'icon-cancel'" id="remove-selected1" onclick="rmSelectedDoc();" title="删除选中"></a>
								<!-- <a href="javascript:void(0)" class="easyui-linkbutton" data-options="plain:true,iconCls:'icon-undo'" onclick="exportCanvas();" title="导出"></a> -->
							</div>
						</div>
						<div id="docs_list" class="" style="height: 185px;border: 0px;">
						</div>
					</div>

					<div title="<span class='tt-inner'>组件树</span>" style="padding:0px">
						<div>
							<div class="easyui-panel">
								<a href="javascript:;" class="easyui-linkbutton" data-options="plain:true,iconCls:'icon-reload'" title="刷新" onclick="getEleTree();"></a>
							</div>
						</div>
						<ul class="easyui-tree" id="ele_tree" >
						</ul>
					</div>
					<div title="<span class='tt-inner'>数据源</span>" style="padding:0px">
						<div>
							<div class="easyui-panel">
								<a id="" href="javascript:;" class="easyui-linkbutton" data-options="plain:true,iconCls:'icon-add'" onclick="openAddDataSource();"></a>
								<a href="javascript:void(0)" class="easyui-linkbutton" data-options="plain:true,iconCls:'icon-cancel'" id="remove-selected1" onclick="rmSelectedDSource();" title="删除选中"></a>
							</div>
						</div>
						<ul class="easyui-tree" id="dataSource" >

						</ul>
					</div>
				</div>
			</div>
			<!-- 功能区选项卡 end -->

			<!-- 图元列表 start -->
			<div data-options="region:'east'" style="width:100%;padding:0px;border: 0px;">
				<div class="easyui-panel" title="组件窗口" style="height:100%;overflow: hidden; padding:0px;"
						data-options="iconCls:'icon-filter'">

					<div class="easyui-accordion" id="acc_tools" data-options="multiple:false" style="height:100%;border: 0px;">
						<div title="基本形状" data-options="iconCls:'icon-search'" style="height: 140px;padding:0px;border: 0px;">
							<ul class="drow-img"  lines="true">
							<!-- 	<li>
									<a href="#">
										<img class="left" src="/static/basic/文本2.svg"/>
										<span class="html_button">按钮</span>
									</a>
								</li>
								<li>
									<a href="#">
										<img class="left" src="/static/basic/文本2.svg"/>
										<span class="html_text">文本框</span>
									</a>
								</li>
								<li>
									<a href="#">
										<img class="left" src="/static/basic/文本2.svg"/>
										<span class="html_radio">单选按钮</span>
									</a>
								</li>
								<li>
									<a href="#">
										<img class="left" src="/static/basic/文本2.svg"/>
										<span class="html_check">选择框</span>
									</a>
								</li>
								<li>
									<a href="#">
										<img class="left" src="/static/basic/文本2.svg" id="Text"/>
										<span class="Text">文本</span>
									</a>
								</li>
								<li>
									<a href="#">
										<img class="left" src="/static/basic/line1.svg" id="Line"/>
										<span class="Line">线条</span>
									</a>
								</li>
								<li>
									<a href="#">
										<img class="left" src="/static/basic/圆形.svg" id="Circle"/>
										<span class="Circle">圆</span>
									</a>
								</li>
								<li>
									<a href="#">
										<img class="left" src="/static/basic/方形.svg" id="Rect"/>
										<span class="Rect">四边形</span>
									</a>
								</li>
								<li>
									<a href="#">
										<img class="left" src="/static/basic/方形.svg" id="fourstar"/>
										<span class="fourstar">四角星</span>
									</a>
								</li> -->
								<li v-for="cctr in basicControls">
									<a @click="addPixel(cctr)">
										<img class="left" :src="cctr.url" id="fivepolygon"/>
										<span class="fivepolygon">{{cctr.name}}</span>
									</a>
								</li>
							 	<!--	<li>
									<a @click="addPixel('/static/basic/six.png')">
										<img class="left" src="/static/basic/six.png" id="fivestarpolygon"/>
										<span class="fivestarpolygon">六边形</span>
									</a>
								</li>
							<li>
									<a href="#">
										<img class="left" src="/static/basic/six.png" id="sixpolygon"/>
										<span class="sixpolygon">六边形</span>
									</a>
								</li>
								<li>
									<a href="#">
										<img class="left" src="/static/basic/三角形.svg" id="Triangle"/>
										<span class="Triangle">三角形</span>
									</a>
								</li>
								<li>
									<a href="#">
										<img class="left" src="/static/basic/文本2.svg" id="path"/>
										<span class="path">折线</span>
									</a>
								</li> -->
							</ul>
						</div>
						<div title="常用控件" data-options="iconCls:'icon-search',selected:true" style="width:100%;height:150px;padding:0px;">
							<ul class="drow-img">
								<li v-for="cctr in commonControls">
									<a @click="addPixel(cctr)">
										<img class="left" :src="cctr.url" id=""/>
										<span class="svg">{{ cctr.name }}</span>
									</a>
								 </li>
							</ul>
						</div>
						<div title="扩展控件" data-options="iconCls:'icon-search'" style="height: 200px; padding:0px;">
							<ul class="drow-img" id="extImgs">
							</ul>
						</div>
					</div>

				</div>
				<div id="ttt">
					<a href="javascript:void(0)" class="icon-add" onclick="javascript:alert('add')"></a>
					<a href="javascript:void(0)" class="icon-edit" onclick="javascript:alert('edit')"></a>
				</div>
			</div>
			<!-- 图元列表 end -->
		</div>
	</div>
</template>

<script>

import {mapGetters,mapMutations} from 'vuex';
import scada_model from '../scada/js/scada.model';
export default {
  data(){
    return {
      docsList:null,
      basicControls:[
        {url:'/static/basic/five.png',name:'五边形',id:'five',type:'image'},
      ],
      commonControls:[
        {url:'/static/scada/images/风机.svg',name:'风机',id:'fengji',type:'svg'},
      ],// 常用控件
    }
  },
  props:['project'],

  mounted(){
    var _this = this;
    this.docsList = $("#docs_list").datalist({
      textField:'doc_name',
      valueField:'doc_id',
      onDblClickRow:function(index,row){
        //addTab(row.name,row.id);
        // getCanvasData(row.id);
      },
      onSelect:function(index,row){
        //console.log(row);
        //console.log('select');
        _this.setOpenDoc(row);
        // 判断当前的激活文档和点选的文档是否相同，不同则选择操作
        /* if(row.doc_id == this.getActiveDocFromOpenDoc.doc_id){
          return;
        }; */
        //console.log('');
      }
    });
  },
  methods:{

    ...mapMutations({
      setOpenDoc:"project/setOpenDoc",
      setCurrentProject:"project/setCurrentProject",
      //addPixel:"",
      publish:"MQ/publish"
    }),

    addPixel(pixelInfo){
      if(pixelInfo){
        if(this.getOpenDoc.length <= 0){
          return;
        }
        this.publish({topic:'addPixel',message:pixelInfo});
      }
    },

    addNewDoc(flag){

      // 检测当前项目的情况
      if(!this.getCurrentProject){
        $.messager.alert("提醒","请先打开或新建项目",'warning');
        return;
      }

      if(flag == 'showWin'){
        $('#dlg-newDoc').window('open');
        return;
      }
      else if(flag == "reset"){
         $("#f-newDoc").form("clear");
         return;
      }
      var doc_name = $("#doc_name").textbox('getValue');
      if(!doc_name){
        $.messager.alert("错误","文档名必须填写","error");
        return;
      }
      var doc = scada_model.createDoc(doc_name,'',false);
      doc.selected = true;
      //console.log(this.getCurrentProject);
      this.setCurrentProject(scada_model.addDocToProject(this.getCurrentProject,doc));
       $('#dlg-newDoc').window('close');
       console.log(this.getCurrentProject);
      //this.$emit("addNewDoc",flag);
    }
  },
   computed:{
    ...mapGetters({
      getCurrentProject:'project/getCurrentProject',
      getActiveDocFromOpenDoc:'project/getActiveDocFromOpenDoc',
      getOpenDoc:"project/getOpenDoc",// 获取所有已打开的文档
      subscribe:"MQ/subscribe",
      getOpenDoc:"project/getOpenDoc",
    }),
  },
  watch:{
    "getCurrentProject":{
      deep:true,
      handler:function(){
        return;
        console.log(this.getCurrentProject);
        //console.log($("#fs-list"));
        //console.log(this.docsList);
        this.docsList.datalist("loadData",this.getCurrentProject.pro_docs);
        //return;
        //$("#fs-list").datalist("loadData",[{doc_name:'ceshi ',doc_id:12}]);
        //console.log('set data');
        //console.log(this.docsList.datalist("getSelected"));
        if(!this.docsList.datalist("getSelected")){ // 没有没选中的 文档，说明是第一次载入

          //选出主文档 并选中
          var rows = this.docsList.datalist("getRows");
          for(let index in rows){
            if(rows[index].is_main){
              this.docsList.datalist("selectRow",index);
            }
          }
        }
      }
    },
    "getCurrentProject.pro_docs":{
      deep:true,
      handler:function(){
        var selectedDoc = this.getActiveDocFromOpenDoc;
        this.docsList.datalist("loadData",this.getCurrentProject.pro_docs);
        if(selectedDoc){
          let docs_list = this.docsList.datalist("getRows")
          for(let index in docs_list){
            if(selectedDoc.doc_id == docs_list[index].doc_id){
               this.docsList.datalist("selectRow",index);
              return;
            }
          }
        }

      }
    },

    "getOpenDoc":{
      deep:true,
      handler:function(){
        return;
        this.docsList.datalist("loadData",this.getOpenDoc);
        //console.log(this.getOpenDoc);
        for(let index in this.getOpenDoc){
          if(this.getOpenDoc[index].selected){
            this.docsList.datalist("selectRow",index);
          }
        }
      },
    },
    "subscribe":{
      deep:true,
      handler:function(){
        if(this.subscribe.topic == "addPixel"){
          console.log(this.subscribe.data);
          console.log("get MQ ");
        }

      }
    }
  }
}
</script>

<style>

</style>
