
import { scada_option } from "./scada.js"
import  { getRandomString } from "@/common/util"

export default {

  //创建项目
  createProject(pro_name,pro_desc){
    //console.log(getRandomString(5));
    let default_doc = this.createDoc('默认文档','默认文档',true);
    let pro_docs = [];
    pro_docs.push(default_doc);
    return {
      pro_id:getRandomString(10),
      pro_name:pro_name,
      pro_desc:pro_desc,
      pro_docs:pro_docs,
    }
  },

  // 初始化canvas文档
  initCanvas(id,option){

    var canvas = new fabric.Canvas(id,{
      width:1000,
      height:800,
    });
    canvas.setBackgroundImage("/static/scada/images/back.png");
    canvas.backgroundImage.width = 1000;
    return canvas;
  },

  initCanvasSync(id,option){
    return new Promise((resolve)=>{
      var canvas = new fabric.Canvas(id,{
        width:1920,
        height:860,
      });

      /* canvas.setBackgroundImage("/static/scada/images/back.png",()=>{
        //console.log('set bg ok');
      }); */
      fabric.Image.fromURL("/static/scada/images/back.png", function(img) {
        //canvas.backgroundImage = img;
        canvas.setBackgroundImage(img,canvas.renderAll.bind(canvas), {
          width: canvas.width,
          height: canvas.height,
          originX: 'left',
          originY: 'top'
        });
        //canvas.backgroundImage.width = 1920;
        //canvas.backgroundImage.height = 860;
        //canvas.backgroundImage.height = 600;
        //canvas.renderAll();
        resolve(canvas);
      });
    });
  },


  initStaticCanvas(id,option){

        var canvas = new fabric.StaticCanvas(id,{
          width:1000,
          height:800,
        });
        if(option){
          canvas.selection = option.selection;
        }
        canvas.setBackgroundImage("/static/scada/images/back.png");
        canvas.set
        return canvas;
      },

  // 创建文档
  createDoc(doc_name,doc_desc,is_main){

    is_main = is_main?is_main:false;

    return {
      doc_id:getRandomString(10),
      is_main:is_main,
      doc_name:doc_name,
      doc_desc:doc_desc,
      doc_pixel:new Map(),
      canvas_json:null, // canvas 的json 序列化
      selected:false,// 在tab中是否处于激活状态
      canvas:null,// 缓存对应的canvas 对象
    }
  },

  // 将文档插入到项目中
  addDocToProject(project,doc){
    project.pro_docs.push(doc);
    return project;
  },


  // 根据文档id 从项目中获取文档
  getDocFromProjectById(project,doc_id){
    if(project && doc_id){
      for(let doc of project.pro_docs){
        if(doc.doc_id == doc_id){
          return doc;
        }
      }
    }
    return null;
  },

  // 获取项目中的主文档
  getProjectMainDoc(project)
  {
    if(project.pro_docs.length <= 0){
      return null;
    }
    for(let doc of project.pro_docs){
      if(doc.is_main){
        return doc
      }
    }
    return null;
  },

  // 生成空图元
  createNewPixel(id,pname,text,desc,script)
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
      //script:'1121',
      desc : desc,// 图元的描述
      pname:pname,

      // 缓存图元的scada属性
      pixel_object:{
        static:{
          attr:[],
        },
        process:{},
        consume:{},
      },

    });
    return group;
  },

  // 添加图元到 项目中指定的文档
  addPixelToDoc(project,doc_id,pixel)
  {
    pixel.pro_id = project.pro_id;
    pixel.doc_id = doc_id;

    var pro_docs = project.pro_docs;
    if((!pro_docs) || (pro_docs.length <= 0)){
      return false;
    }
    for(let index in pro_docs){
      if(pro_docs[index].doc_id == doc_id){
        pro_docs[index].doc_pixel.set(pixel.guid,pixel);
      }
    }

    project.pro_docs = pro_docs;
    return  project;
  },

  // 更新图元
  updatePixel(project,pixel){
    var docs = project.pro_docs;
    for(let index in docs){
      if(docs[index].doc_id == pixel.doc_id){
        var doc_pixel = docs[index].doc_pixel
        for(let doc_index in doc_pixel){
          if(doc_pixel[doc_index].guid == pixel.guid){
            doc_pixel[doc_index] = pixel;
            docs[index].doc_pixel = doc_pixel;
            break;
          }
        }
      }
    }
    project.pro_docs = docs;
    //console.log('update pixel');
    return project;
  },

  // 获取某个图元中某条属性
  gettAttrInPixel(pixel,attrName){
    var attr = pixel.pixel_object.static.attr;
    for(let item of attr){
      if(item.attrName == attrName){
        return item;
        break;
      }
    }
    return null;
  },

  // 向指定的图元添加attr 属性
  addAttToPixel(pixel,attr)
  {
    pixel.pixel_object.static.attr.push(attr);
    return pixel;
  },

  //删除指定图元的attr属性
  delAttrFromPixel(pixel,attrName){
    var attr = pixel.pixel_object.static.attr;
    var new_attr = [];
    for(let item of attr){
      if(item.attrName != attrName){
        new_attr.push(item);
      }
    }
    pixel.pixel_object.static.attr = new_attr;
    return pixel;
  }

}
