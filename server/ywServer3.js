/*
* 业务处理的服务器
* 功能：订阅所有的mqtt数据，然后根据不同的图元业务 处理数据并发布到mqtt
* */
var mqtt  = require('mqtt');
const fs = require('fs');
var client  = mqtt.connect('mqtt://localhost');

var ty_path = "./staticServer/ty_list";// 图元路径
var device_path = "./staticServer/device_json";// 设备路径

console.log('业务服务器启动成功...');


// 订阅数据
function subData(client,topic)
{

}



/*
* 载入所有并且分析所有图元
* */
var ty_list = []; //


setInterval(function(){
    var fs_list =  fs.readdirSync(ty_path);
    for(var i in fs_list)
    {
        // 载入图元 这里可以做图元的合法性检测
        var ty_obj = JSON.parse(fs.readFileSync(ty_path+"/"+fs_list[i]).toString());
        ty_list.push(ty_obj);
        for(var i of ty_obj.yw_desc.need_data){

            let topic = i;
            client.subscribe(topic);
            console.log('订阅了主题为'+topic);
            //  var device = JSON.parse(fs.readFileSync(device_path+"/"+i+".json").toString());
            // for(var data_list  of device.data_list){
            // client.subscribe(data_list);}

        }
        //var device = JSON.parse(fs.readFileSync(device_path+"/"+fs_list[i+".json"]).toString());
        
    }
},5000)






client.on('connect', function () {
    console.log('连接Mqtt 成功...');
    
    //client.subscribe('device1');
});

client.on('message', function (topic, message) {

    // console.log(topic,message.toString());
    // return;
    for(var i in ty_list)
    {
        if(ty_list[i].yw_desc.need_data == topic) // 说明这条数据是该图元需要处理的
        {
            //var data = JSON.parse(message.toString());
            var data = (message.toString());
            //console.log(JSON.stringify(data));
            var res = eval(`(`+ty_list[i].yw_desc.methods+`)(`+JSON.stringify(data)+`)`); // 处理完数据
            client.publish(ty_list[i].id+"_ty_",JSON.stringify({type:'handled',value:res})); // 发布处理好的数据
            console.log("业务服务器-发布ok-{主题："+ty_list[i].id+"_ty_,值："+res+"}");
    
        }
    }

});