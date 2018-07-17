/*
* 业务处理的服务器
* 功能：订阅所有的mqtt数据，然后根据不同的图元业务 处理数据并发布到mqtt
* */
var mqtt  = require('mqtt');
const fs = require('fs');
var client  = mqtt.connect('mqtt://localhost');

console.log('业务服务器启动成功...');

/*
* 载入所有并且分析所有图元
* */
var ty_list = []; //
var fs_list =  fs.readdirSync('./tyList');
for(var i in fs_list)
{
    // 载入图元 这里可以做图元的合法性检测
    var ty_obj = require('./tyList/'+fs_list[i]);
    ty_list.push(ty_obj);
}


client.on('connect', function () {
    console.log('连接Mqtt 成功...');
    client.subscribe('device1');
});

client.on('message', function (topic, message) {

    for(var i in ty_list)
    {
        if(ty_list[i].yw_desc.need_data == topic) // 说明这条数据是该图元需要处理的
        {
            var data = JSON.parse(message.toString());
            ty_list[i].yw_desc.methods(data); // 处理完数据

            client.publish(ty_list[i].type,JSON.stringify({type:'handled',value:ty_list[i].yw_desc.result_data})); // 发布处理好的数据
            console.log("业务服务器-发布ok-{主题："+ty_list[i].type+",值："+ty_list[i].yw_desc.result_data+"}");
           /* console.log(data);
            console.log('处理ok'+ty_list[i].yw_desc.result_data);*/
        }
    }

});