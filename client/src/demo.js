/*
** 工程管理组件
 */
class ProjectComponent{

  /**
   * @desc：获取工程列表
   * @return(Array):工程列表。
   * @example:
   * [{id:'12321',projectName:'xx隧道',desc:'描述信息',updateTime:'最近一次更新的时间戳'}]
   */
  getProjectList(){};


  /**
   * @desc：载入工程
   * @param(number):projectId,工程id
   * @return(Promise)：返回载入的结果数据。
   * @example:
   * {status:1,msg:'消息',data:"工程数据"}
   */
  loadProject(projectId){};


  /**
   * @desc：保存工程
   * @param(object):projectData,工程数据
   * @return(Promise)：返回保存的结果数据。
   * @example:
   * {status:'',msg:''}
   */
  saveProject(projectId,projectData){};


  /**
   * @desc：解码工程
   * @param(string):projectData,工程数据
   * @return(Object)：返回解析的结果数据。
   * @example:
   * {id:'',projectName:'',tyList:'图元列表',deviceList:'设备列表',updateTime:'最新更新时间戳'}
   */
  decodeProject(projectData){};


  /**
   * @desc：编码工程
   * @param(object):projectData,工程数据
   * @return(string)：返回解析的结果数据。
   * @example:
   * "agshgnshsngshgsghsgns"
   */
  encodeProject(projectData){};


   /**
   * @desc：运行工程
   * @param(object):projectData,工程数据
   * @return(void)：。
   * @example:
   * runProject(11212);
   */
  runProject(projectData){};

}


/**
 * 数据源管理组件
 */
class dataSourceComponents {

  /**
   * @desc：添加数据源
   * @param(object):dataObject,数据源。{sourceId:'数据源id',attr:'自定义描述'}
   * @return(Promise)：返回添加的结果。{status:"",msg:''}
   * @example:
   *
   */
  addSource(dataObject){};


  /**
   * @desc：添加数据源
   * @param(number):sourceId,数据源ID
   * @return(Promise)：返回删除的结果。{status:"",msg:''}
   * @example:
   *
   */
  delSource(sourceId){};


}


/**
 * 设备管理组件
 */
class deviceComponent{

  /**
   * @desc：添加设备
   * @param(object):deviceObject。 设备信息对象。{id:'',attr:'',dataSourceList:[],}
   * @return(Promise)：返回添加的结果。{status:"",msg:''}
   * @example:
   *
   */
  addDevice(deviceObject){};

  /**
   * @desc：删除设备
   * @param(number):deviceId 设备id。
   * @return(Promise)：返回删除的结果。{status:"",msg:''}
   * @example:
   *
   */
  delDevice(deviceId){};


  /**
   * @desc：更新设备
   * @param(object):deviceObject。设备数据。
   * @return(Promise)：返回更新的结果。{status:"",msg:''}
   * @example:
   *
   */
  upateDevice(deviceObject){};

}


/**
 * 图元管理组件
 */
class entityComponent{

  /**
   * @desc：添加图元
   * @param(object):deviceObject。 设备信息对象。{id:'',attr:'',dataSourceList:[],}
   * @return(Promise)：返回添加的结果。{status:"",msg:''}
   * @example:
   *
   */
  addDevice(deviceObject){};

  /**
   * @desc：删除设备
   * @param(number):deviceId 设备id。
   * @return(Promise)：返回删除的结果。{status:"",msg:''}
   * @example:
   *
   */
  delDevice(deviceId){};


  /**
   * @desc：更新设备
   * @param(object):deviceObject。设备数据。
   * @return(Promise)：返回更新的结果。{status:"",msg:''}
   * @example:
   *
   */
  upateDevice(deviceObject){};

}


/**
 * 状态管理组件 该组件维持与服务器端的连接，同时更新系统中共享的数据
 */
class stateComponent{
}



/**
 * 状态对象  该对象封装了系统中各种共享的对象
 */
class state{
}


// 项目描述结构
var project = {
  pro_id:'',
  pro_name:'',
  pro_desc:'',
  pro_docs:[],// 文档列表 ，具体结构详见下列 doc 对象
}

var doc = {
  doc_id:'',
  doc_name:'',
  doc_desc:'',
  doc_pixel:[],// 文档中的图元集合 下列详见图元对象 pixel
  canvas:{},// 该文档的画布描述
}

var pixel = {
  /*这部分的属性 一般提供可视化界面*/
  static:{
    id:'',
    path:'',//图元的路径 格式为pro_id.doc_id.id
    attr:[],// 自定义属性，格式为{tagName:'',value:''}
  },
  process:{
    data_handler:function(){
    }
  },
  consume:{
    Event:function(event){
    },
    consume_data:function(){
    },
  }
}

// 模板文件
var template = {
  id:'',
  name:'',
  attr:{},// 对应的自定义属性
  process:{},
  consume:{},
}



