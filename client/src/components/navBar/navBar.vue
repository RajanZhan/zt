<template>
    <div data-options="region:'north',border:false" style="height:28px;">

    <!-- 新建工程 dataDialog -->
    <div id="dataDialog" class="easyui-dialog" title="新建工程" data-options="modal:true,closed:true,iconCls:'icon-save'" style="width:330px;height:280px;padding:10px;">

        <div class="easyui-panel">
		    <form id="createNewProjectForm" method="post">
		        <table cellpadding="5">
		            <tr>
		                <td>工程名称:</td>
		                <td><input id="pro_name" class="easyui-textbox" type="text" name="name" data-options="required:true"></input></td>
		            </tr>
		            <tr>
		                <td>备注:</td>
		                <td><input class="easyui-textbox" type="text" name="describe" data-options="number:[0,9],validType:'length[1,10]'"></input></td>
		            </tr>
		            <tr>
		                <td>经度:</td>
		                <td><input class="easyui-numberbox" type="text" name="longitude" data-options="min:1000000,max:9999999999,precision:2"></input></td>
		            </tr>
		            <tr>
		                <td>纬度:</td>
		                <td><input class="easyui-numberbox" type="text" name="latitude" data-options="min:0,precision:2"></input></td>
		            </tr>
		            <tr>
		                <td>管理机构:</td>
		                <td>
											<!-- <input class="easyui-textbox" type="text" name="management"></input> -->
											<input class="easyui-combobox" name="management" style="width:100%;" data-options="
			                    url:'/scada/getDeptList',
			                    method:'get',
			                    valueField:'DeptCode',
			                    textField:'Name',
			                    panelHeight:'auto',
			                    label: 'Language:',
			                    labelPosition: 'top'
			                    ">
										</td>
		            </tr>
		        </table>

		        <div style="text-align:center;padding:5px">
		            <a href="javascript:void(0)" class="easyui-linkbutton" @click="createNewProject">提交</a>
		            <a href="javascript:void(0)" class="easyui-linkbutton" onclick="clearAddProForm()">重置</a>
		        </div>
		    </form>
		</div>
    </div>
    <!-- 新建工程 end -->

    <!-- 用户脚本 scriptDialog -->
    <div id="scriptDialog" class="easyui-dialog" title="脚本编辑" data-options="modal:true,closed:true,iconCls:'icon-save'" style="width:440px;height:670px;padding:10px;">
        <div class="easyui-panel">
          <Editor @contentUpdate="editorContentUpdate" ref="editorInstance"></Editor>
		    </div>
    </div>
    <!-- 用户脚本 end -->

      <div>
        <a id="btn-home" href="#" class="easyui-menubutton" data-options="menu:'#mm0',plain:true">设置</a>
        <a href="#" class="easyui-menubutton" data-options="menu:'#mm1'">工程</a>
        <a href="#" class="easyui-menubutton" data-options="menu:'#mm2'">数据源</a>
        <a href="#" class="easyui-menubutton" data-options="menu:'#mm3'">生成</a>
        <!-- <a href="#" class="easyui-menubutton" data-options="menu:'#mm4'">主题</a> -->
        <a href="#" class="easyui-menubutton" data-options="menu:'#mm5'">报表</a>
        <a href="javascript:void(0)" class="easyui-linkbutton" @click="openUserScript" data-options="plain:true">用户脚本</a>
        <a href="#" class="easyui-menubutton" data-options="menu:'#mm6'">关于</a>
      </div>
      <div id="mm0" style="width:160px;">
        <div onclick="">当前用户：</div>
        <div onclick="userSet();">用户管理</div>
        <div onclick="ctrlSet();">弹出框管理</div>
        <div onclick="extEleSet();">扩展控件管理</div>
        <div onclick="logout();">注销</div>
      </div>
      <div id="mm1" style="width:150px;">
        <div data-options="iconCls:'icon-undo'" @click="createNewProject('showWin')">新建工程</div>
        <div onclick="getProList('open');">打开工程</div>
        <div onclick="getProList('edit');">工程管理</div>
        <div class="menu-sep"></div>
        <div data-options="iconCls:'icon-save'" @click="publish({topic:'saveProject',message:''})">保存</div>
      </div>
      <div id="mm2" style="width:160px;">
        <div onclick="opcDataSource();">管理OPC数据源</div>
        <div onclick="openAddDataSource();">添加modbus数据源</div>
          <div onclick="mgModbus();">管理ModBus数据源</div>
        <div onclick="openbound();">管理已绑定数据</div>
        <div onclick="debugData();">数据调试</div>
      </div>
      <div id="mm3" style="width:150px;">
        <div data-options="iconCls:'icon-tip'" onclick="run();">调试应用程序</div>
      </div>

      <div id="mm5" style="width:160px;">
        <div onclick="hReport();">实时数据报表</div>
      </div>
      <div id="mm6" class="menu-content" style="padding:10px;text-align:left">
        <!-- <img src="easy/images/img.png" style="width:150px;height:50px"> -->
        <p style="font-size:14px;color:#444;">
          昆明联诚科技股份有限公司
        </p>
      </div>
    </div>
</template>

<script>
  import {mapGetters,mapMutations} from 'vuex';
  import Editor from '../editor/editor'
  import scada_model from '../scada/js/scada.model';
  export default {
    name: 'hello',
    props:['project'],
    data () {
      return {
        msg: 'Welcome to Your Vue.js App'
      }
    },
    components:{
      Editor,
    },

    methods:{

      ...mapMutations({
        setCurrentProject:"project/setCurrentProject",
        setOpenDoc:'project/setOpenDoc',
        updatePixelScript:'project/updatePixelScript',
        publish:'MQ/publish',
      }),

      // 创建工程
      createNewProject(flag){
        if(this.project){
          $.messager.alert("提醒",'请先关闭当前项目','warning');
          return;
        }
        if(flag =="showWin"){
          $("#dataDialog").window("open");
          return;
        }
        else if(flag == "clear")
        {
          //$("#dataDialog").window("open");
          $("#createNewProjectForm").window("clear");
          return;
        }
        var pro_name = $("#pro_name").textbox("getValue");
        if(pro_name){

          var project = scada_model.createProject(pro_name);


          //console.log(project);
          //this.$emit("projectCreated",project);
          this.setCurrentProject(project); // 将当前的项目创建到state

          var mainDoc = scada_model.getProjectMainDoc(project);
          if(mainDoc)
          {
            this.setOpenDoc(mainDoc);
          }
          $("#dataDialog").window("close");
          //this.project = project;
        }
      },

      editorContentUpdate(value){
        //console.log(value);
        this.updatePixelScript(value);
        console.log("更新图元脚本");
      },

      // 打开用户脚本
      openUserScript(){
        if(!this.getActivePixel){
          return;
        }
        $("#scriptDialog").window("open");
        this.$refs.editorInstance.setValue(this.getActivePixel.scada_attr.script);

        //console.log(this.getActivePixel.scada_attr);
        //this.$refs.editorInstance.test();
      },


    },
    computed:{
      ...mapGetters({
          getActivePixel: "project/getActivePixel",
      }),
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
