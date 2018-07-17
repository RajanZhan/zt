
var mqtt  = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');

client.on('connect', function () {
    console.log('client connected.....');
    client.subscribe('device1');
});

client.on('message', function (topic, message) {
    // message is Buffer
    console.log("mqtt client  get the msg "+message.toString());
    //client.end();
});

{
    type:"fengji"
    need_data :["dirver1_data","driver2_data"]
}


// // 这个表示解析好的图元描述对象
// var ty_obj = {

//     "name": "风机",// 名称
//     "type":"fengji",// 类型
    
//    // 图元如何处理数据的描述
//     "yw_desc":{
//         "need_data": "device1", // 需要的数据  由图元开发者自行定义
//         "result_data":null,// 存储经过methods 处理完的数据
//         "methods":function (data) {
//             // 如何处理消息 由图元开发者自行定义
//             this.result_data = ((Number(data[0]) + Number(data[1])) / 2).toFixed(2);
//         },
//     },

//     // 图元自身行为或者属性的描述
//     "act_attr_desc":{

//         // 接受到消息后的回调,由图元开发者自行定义内容
//         "on_msg":"(function (data) {console.log('图元数据消费中...'+data.value)})"
//     }
// };

// broker.subscribe(ty_obj.yw_desc.need_data);//订阅该图元所需数据
// var TY_DATA  = new Map();// 映射关系存储
// TY_DATA.set(ty_obj.yw_desc.need_data,ty_obj);//将该图元需要的数据和 该图元对象生成有映射关系


// broker.on("message",function())