/* 项目 */
export default {
  namespaced: true,
  state: {
    project: {
      pro_id: 'new_pro',// 项目id
      pro_name: '',//项目名称
      pro_remark: '',// 项目备注
      pro_doc: new Map(),// 项目文档
      active_pixel: { doc_id: '', pixel: '', script: '' }, // 当前激活的图元 doc为图元所在的文档，pixel 为图元对象
      active_doc: '',// 当前激活文档,
    },
    currentProject: null,
    openDoc: [],// 已打开的文档
    //active_pixel:
    active_pixel: null,// 当前激活的图元

    //图元模板
    pixelTemplateList:[],

    // 共享网络对象
    client:null,

  },
  getters: {

    // 获取项目对象
    getProject(state) {
      return state.project;
    },

    // 获取当前项目
    getCurrentProject(state) {
      return state.currentProject;
    },

    // 获取已经打开的文档列表
    getOpenDoc(state) {
      return state.openDoc;
    },

    //获取根据doc id 获取doc 对象
    getDocById(state) {

    },

    // 获取打开文档中的激活文档
    getActiveDocFromOpenDoc(state) {
      for (let open of state.openDoc) {
        if (open.selected) {
          return open
        }
      }
      return null;
    },

    // 获取当前激活的图元
    getActivePixel(state) {
      return state.active_pixel;
    },

    /* // 根据attrName获取激活图元的属性
    getAttrByAttrNameInActive(state){

    }, */

    // 获取当前激活图元的脚本
    getActivePixelScriptFromState(state) {
      return state.project.active_pixel.script;
    },

    // 获取图元模板列表
    getPixelTemplateList(state){
      return state.pixelTemplateList;
    },

    // 获取共享网络对象
    getClient(state){
      return state.client;
    },

  },
  mutations: {


    // 设置的当前项目数据
    setCurrentProject(state, project) {
      state.currentProject = project;
    },

    // 添加文档到项目
    setProDoc(state, doc) {

      state.project.pro_doc.set(doc.id, { is_main_doc: doc.is_main_doc, desc: doc.is_main_doc, canvas: doc.canvas });
      //console.log(state.project.pro_doc instanceof Map)
    },

    // 更新文档的canvas应用
    setDocCanvas(state, options) {
      if (options.doc_id && options.canvas) {
        for (let index in state.currentProject.pro_docs) {
          if (state.currentProject.pro_docs[index].doc_id == options.doc_id) {
            state.currentProject.pro_docs[index].canvas = options.canvas;
            break;
          }
        }
      }
    },

    // 添加已经打开的文档到state
    setOpenDoc(state, doc) {

      // console.log('激活文档');

      // 先将所有已打开的文档的都置为非激活状态
      /* for(let index in state.openDoc){
        state.openDoc[index].selected = false;
      } */

      //console.log(doc.doc_id);
      var is_new_open = true;// 标志是否是新打开文档
      for (var index in state.openDoc) {
        if (state.openDoc[index].doc_id == doc.doc_id) { // 说明文档已经被打开
          state.openDoc[index].selected = true;
          is_new_open = false
          //return;
        }
        else {
          state.openDoc[index].selected = false;
        }
      }

      if (is_new_open) {
        doc.selected = true;
        state.openDoc.push(doc);
      }

    },
    // 设置激活的文档
    setActiveDocFromOpenDoc(state,options){
      for (let index in state.openDoc) {
        if (state.openDoc[index].doc_name != options.doc_name) {
          state.openDoc[index].selected = false;
          continue;
        }
        state.openDoc[index].selected = true;
        console.log("change active doc");
        console.log(options);
      }
    },
    // 将文档从已打开的state 中移除
    delDocFromOpen(state, options) {

      var openDoc = [];
      var doc = null;
      for (let index in state.openDoc) {
        if (state.openDoc[index].doc_name == options.doc_name) {
          doc = state.openDoc[index];
          continue;
        }
        openDoc.push(state.openDoc[index]);
      }
      state.openDoc = openDoc;
      return doc;// 返回被删除的文档
    },

    // 设置激活的图元
    setActivePixel(state, data) {
      //state.project.active_pixel = data;
      state.active_pixel = data;
     // console.log('active pixel');
    },

    // 添加激活图元的图元属性
    addActivePixelAttr(state, data) {
    },

    //删除激活图元的属性
    delActivePixelAttr(state,data){
      let new_attr = [];
      for(let attr of state.active_pixel.scada_attr.attr){
        if(attr.attrName ==  data.attrName){
          continue;
        }
        new_attr.push(attr);
      }
      state.active_pixel.scada_attr.attr = new_attr;
    },

    // 强制更新激活图元的属性
    updateActivePixelAttr(state, data) {

      if(!state.active_pixel){
        return;
      }
      if (data instanceof Array) {
        //state.active_pixel.scada_attr.attr = [];
        for (let index in data) {
          state.active_pixel.scada_attr.attr[index] = data[index];
          state.active_pixel.scada_attr.attr[index].tagName = data[index].value;
        }
        //console.log(state.active_pixel.scada_attr.attr);
      }
      else
      {
        for (let index in state.active_pixel.scada_attr.attr) {
          if (state.active_pixel.scada_attr.attr[index].attrName == data.attrName) {
            state.active_pixel.scada_attr.attr[index] = data;
            state.active_pixel.scada_attr.attr[index].tagName = data.value;
            break;
          }
        }
      }
      //console.log(data instanceof Array);
    },

    // 设置激活文档
    setActiveDoc(state, data) {
      state.project.active_doc = data;
      console.log('当前激活文档');
      console.log(state.project.active_doc);
    },

    // 更新图元脚本
    updatePixelScript(state, script) {
      state.active_pixel.scada_attr.script = script;
      //console.log('活动图元代码发生变动');
    },

    // 设置图元的模板列表
    setPixelTemplateList(state,data){
      state.pixelTemplateList = data;
    },



    // 设置网络对象
    setClient(state,client){
      state.client = client;
    },

  },
  actions:{

    usePixelTemplate({ commit},template){

      //更细激活图元的脚本
      commit("updatePixelScript",template.script);

      // 更新激活图元的attr
      commit("updateActivePixelAttr",template.attr);


    },
  }
}
