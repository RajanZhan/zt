//import {mapGetters,mapMutations} from "vuex";

import  { getRandomString,clone } from "@/common/util"

export default {

  // 图元默认脚本
  pixel_default_script:`
  {
    /*@ 数据处理端
    * 访问自定义属性 this.getAttr('attr_name');

    * 访问图元状态值，状态由key 状态名、value 状态值构成。
       例如 this.setState('rotate',1),来设置rotate 这个状态的值。

    * 获取图元的状态值，this.getState('状态名')。
    *
    */
    process:{

      /*
      数据处理方法 ，每次自定义属性中的值发生变化，都将触发此
      */
      data_handler:function(){
      }
    },

    /*@ 数据消费端
      * 通用旋转方法，this.animate.rotate(animate_type),
        当animate_type 为1时正转、2反转、0停止。

      * 通用发布控制方法，this.setCtr(attr_name,value),通过该方法
        可以下发控制到设备端，attr_name 为数据处理端的对应的attr，
        value为对应的值

      * 获取图元的状态值，this.getState('状态名')。

    */
    consume:{

      /*
       * 鼠标事件监听 ，event的值可能为 mouse:over,mouse:down,
         mouse:up
      */
      Event:function(event){
      },

      /*
       * 数据消费方法 ，当数据处理端(process) 调用
        this.setState()来设置状态时，将会触发次消费方法
      */
      consume_data:function(){
      },

    }
  }
  `,

  // 一键Tag的默认脚本
  oneKeyTagScript:`
  {
    run:function(pixelList){
      console.log(pixelList);
      let attr = ['zz','fz','st'] ;
      for(let i in pixelList){
        let num = 1;
        while(num <= 3){
          pixelList[i].scada_attr.attr.push(
            {
              attrName:attr[num - 1],
              tagName:"device"+(Number(i)+1)+"_"+num,
              value:"",
              editor:'text'
            }
          );
          num++;
        }
      }
    },
}
  `,

  // 向激活的文档添加图元 这个一个异步方法向激活的文档添加图元 这个一个异步方法
  addPixelToDoc(canvas, pixelInfo, doc_id) {
    var _this = this;
    return new Promise(function (resolve, reject) {

      let scada_attr = {
        doc_id: doc_id,
        script: _this.pixel_default_script,
        guid: getRandomString(10),
        attr: [
          /* {attrName:'cesshi',tagName:'device1-1',"editor":"text"},
          {attrName:'cesshi1',tagName:'device1-2',"editor":"text"}, */
        ],
        IP:'',
      };


      if (pixelInfo.type == 'image') {
        // 图片图元
        fabric.Image.fromURL(pixelInfo.url, function (obj) {
          obj.scada_attr = scada_attr;
          obj.set({ /* left: canvas.width / 2, top: canvas.height / 2, */left: 80,
            top: 175,
           // width: 100,
            //height: 80,
          })
          canvas.add(obj);
          resolve(obj);
        })
      }
      else if (pixelInfo.type == 'svg') {
        //console.log("add svg");
        // svg 图元
        var path = fabric.loadSVGFromURL(pixelInfo.url, function (objects, options) {
          var obj = fabric.util.groupSVGElements(objects, options);
          //obj.scaleToHeight(canvas.height - 100)
            obj.set({ /* left: canvas.width / 2, top: canvas.height / 2, */left: 80,
              top: 175,
             /*  width: 80,
              height: 80, */
              borderWidth:1,
              strokeWidth: 1
            })
            //.setCoords();
          obj.scada_attr = scada_attr;
          canvas.add(obj);
          resolve(obj);
        });
      }

    })

  },

  // 复制图元
  //复制
  copyTo(canvas) {
    //groupClone = canvas.getActiveGroup();
    let singleClone = canvas.getActiveObject();
    return {
      //groupClone:groupClone,
      singleClone:singleClone,
    }
    //$('#mm').menu('enableItem',$("#cloneOrClipPaste"));
  },

  // 粘贴图元
  cloneOrClipPaste(data,canvas) {
    var _this = this;
    var left = 20;
    var top = 20;
    //if (typeof groupClone == 'undefined') return;
    if (data.groupClone) {
      var objectsInGroup = data.groupClone.getObjects();
      objectsInGroup.forEach(function (object) {
        if (canvas.getActiveGroup()) {//当前选中组并调用粘贴时
          left = canvas.getActiveGroup().left - object.left + 20;
          top = canvas.getActiveGroup().top - object.top + 20;
        } else {
          left = object.left + 20;
          top = object.top + 20;
        }
        _this.filterClone(object, left, top);
      });
      canvas.renderAll();
    } else {
      if (data.singleClone) {
        left = data.singleClone.left + 20;
        top = data.singleClone.top + 20;
        _this.filterClone(data.singleClone, left, top,canvas);
        canvas.renderAll();
      }
    }
  },
  //根据不同type克隆控件
  filterClone(o, x, y,canvas) {
    switch (o.type) {
      case "path":
        PathClone(o, x, y,canvas);
        break;
      case "path-group":
        this.SVGClone(o, x, y,canvas);
        break;
      case "image":
        ImageClone(o, x, y,canvas);
        break;
      default: this.PelClone(o, x, y,canvas);
        break;
    }
  },

  SVGClone(o, x, y,canvas) {
    var loadedObject = fabric.util.groupSVGElements(o.paths);
    loadedObject.clone(function () {
      return function (clone) {
        clone.set({
          left: x,
          top: y,
          id: o.id,
          height: o.height,
          width: o.width,
          scaleX: o.scaleX,
          scaleY: o.scaleY,
          angle: o.angle,
          guid: getRandomString()

        });
        canvas.add(clone);
      };
    }());
  },

  // 基本图元克隆
  PelClone(o, x, y, canvas) {
    // console.log(o);
    if (o.type == 'group') {
      var gg = [];
      for (var i = 0; i < o._objects.length; i++) {
        if (o._objects[i].type == 'group') {
          //console.log(o._objects[i]);
          var objgroup = clonegroup(o._objects[i], o._objects[i].left + o.left + x, o._objects[i].top + o.left + y);
          //  console.log(objgroup);
          gg.push(objgroup);
        }
        else {
          if (o._objects[i].type == 'path') {
            o._objects[i].clone(
              function (clone) {
                var left = x - clone.left;
                var top = x - clone.left;
                var str = "M " + (clone.path[0][1] + left) + " " + (clone.path[0][2] + top)
                for (var i = 1; i < clone.path.length; i++) {
                  str += " L " + (clone.path[i][1] + left) + " " + (clone.path[i][2] + top)
                }
                var line = new fabric.Path(str, {
                  left: x,
                  top: y,
                  id: clone.id,
                  guid: newGuid(),
                  //stroke: '#' + getRandomColor(),
                  stroke: '#00FF00',
                  fill: '',
                  angle: clone.angle,
                  scaleX: clone.scaleX,
                  scaleY: clone.scaleY,
                })
                gg.push(line);
              });
          } else if (o._objects[i].type == 'path-group') {
            var loadedObject = fabric.util.groupSVGElements(o._objects[i].paths);
            loadedObject.clone(function (clone) {
              clone.set({
                left: o._objects[i].left + x,
                top: o._objects[i].top + y,
                id: o._objects[i].id,
                height: o._objects[i].height,
                width: o._objects[i].width,
                scaleX: o._objects[i].scaleX,
                scaleY: o._objects[i].scaleY,
                angle: o._objects[i].angle,
                guid: newGuid()
              });
              //  console.log(clone);
              gg.push(clone);
            });
          }
          else {
            console.log(o._objects[i].type);
            //let tmp = clone(o._objects[i]);
            console.log(o._objects[i].clone());
            var newo = tmp.set({ left: o._objects[i].left + x, angle: o._objects[i].angle, top: o._objects[i].top + y, guid: getRandomString(), id: o._objects[i].id }).setCoords();
            //c//onsole.log(newo);
            gg.push(newo);
          }
        }
      }
      var g = new fabric.Group(gg, {
        guid: getRandomString(),
        id: o.id,
        left: x,
        top: y,
        angle: o.angle,
        __origHasControls: true,
        scaleX: o.scaleX,
        scaleY: o.scaleY,
      }).setCoords();
      canvas.add(g);
    } else {
      //hahaha
      var newo = o.clone().set({ left: x, angle: o.angle, top: y, guid: getRandomString(), id: o.id }).setCoords();
      canvas.add(newo);
    }
  },
}
