module.exports.serialize = function(obj,name,isClass = false){
    var result = "";
    function serializeInternal(o,path) {
		if(!path)
		{
			throw "序列化的变量名不能为空";
		}
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
	console.log(name);
    serializeInternal(obj, name);

    //以class的方式声明，这里要特殊处理
    return result;
}