/*
常用函数库
*/

// Map 转 array
export function mapToArr (map){
  var arr = [];
    map.forEach(function(value,key){
            //arr.push({key:key,value:value});
            arr.push([key,value]);
        });
    return  arr;
}

// 序列化对象 包含方法
export function serialize(obj, name,isClass = false){
    var result = "";
    function serializeInternal(o, path) {
        for (let p in o) {
            var value = o[p];
           // console.log(p);
            // 兼容Map
            var isMap = false;
            if(value instanceof Map)
              {
                value = mapToArr(value);
                isMap = true;
              }

            //console.log(typeof value);
            if (typeof value != "object") {
                if (typeof value == "string") {
                    result += "\n" + path + "[" + (isNaN(p)?"\""+p+"\"":p) + "] = " + "\"" + value.replace(/\"/g,"\\\"") + "\""+";";
                }else {
                    result += "\n" + path + "[" + (isNaN(p)?"\""+p+"\"":p) + "] = " + value+";";
                }
            }
            else {
                if (value instanceof Array) {
                    result += "\n" + path +"[" + (isNaN(p)?"\""+p+"\"":p) + "]"+"="+"new Array();";
                    serializeInternal(value, path + "[" + (isNaN(p)?"\""+p+"\"":p) + "]");
                } else {
                    result += "\n" + path  + "[" + (isNaN(p)?"\""+p+"\"":p) + "]"+"="+"new Object();";
                    serializeInternal(value, path +"[" + (isNaN(p)?"\""+p+"\"":p) + "]");
                }
            }
           // 转成map
           if(isMap){
             result += "\n" + path  + "[" + (isNaN(p)?"\""+p+"\"":p) + "]"+"="+"new Map("+ path +"['"+p+"']);";
             isMap = false;
           }
        }
    }

    serializeInternal(obj, name);

    //以class的方式声明，这里要特殊处理
    if(isClass){
      serializeInternal(obj.__proto__, name);
    }
    return result;
}

// 获取随机字符串  len 为字符串的长度
export function getRandomString(n){
  //'0','1','2','3','4','5','6','7','8','9',
  var chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','v','u','w','z','x','y','_',
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  var res = "";
  for(var i = 0; i < n ; i ++) {
      var id = Math.ceil(Math.random()*35);
      res += chars[id];
  }
  //res+="_"+(Math.random().toFixed(5) * 100000);
  res ="str_"+ res;
  return res;
}


// 对象刻度
export function  clone(obj){
  var proto = Object.getPrototypeOf(obj);
  return Object.assign({},Object.create(proto),obj);
}
