/*
* 数据分组服务器
* 功能：根据设备对离散数据进行编组并重新发布数据
* */
var mqtt  = require('mqtt');
const fs = require('fs');
var client  = mqtt.connect('mqtt://localhost');

var device_path = "./staticServer/device_json";// 设备路径

console.log('数据分组服务器启动成功...');


/*
* 载入所有并且分析所有设备
* */
var device_list = new Map(); //缓存设备列表

var device_data_container = new Map();//缓存设备数据列表容器

var data_item_device_map = new Map();// 每条元数据和设备的对应关系 方便查找

setTimeout(function(){
    var fs_list =  fs.readdirSync(device_path);
    for(var i in fs_list)
    {
        // 载入并分析设备 
        var device_obj = JSON.parse(fs.readFileSync(device_path+"/"+fs_list[i]).toString());
        //device_list.set(device_obj.device_id,device_obj);// 缓存设备数据
        
        // 定义该设备需要订阅的数据列表 相当于数据槽
        var device_data_list =  new Map();

        for(var data_item of device_obj.data_list){

            device_data_list.set(data_item,null); // 初始化数据槽

            client.subscribe(data_item);
            
            var data_item_for_device_list = new Set();
            if(data_item_device_map.get(data_item)){
                data_item_for_device_list = data_item_device_map.get(data_item)
            }
            else{
                
                data_item_for_device_list.add(device_obj.device_id);
            }

            data_item_device_map.set(data_item,data_item_for_device_list);// 每天元数据都需要与设备生成对应关系，
        }
        device_data_container.set(device_obj.device_id,device_data_list); // 存储数据槽
        
    }
},5 * 1000)






client.on('connect', function () {
    console.log('连接Mqtt 成功...');
});

client.on('message', function (topic, message) {

    var message = message.toString();

    // 查询该条数据是被哪些设备绑定
    var device_list_for_this_data_item = data_item_device_map.get(topic);
    if(!device_list_for_this_data_item){
        console.log("topic 为"+topic+"的数据暂未找到其分组");
        return;
    }

    // 遍历这些设备，找出对应设备的数据缓冲槽，并且将数据写入槽中，同时判定是否满足分组的条件，如果满足那么打包数据并发布
    device_list_for_this_data_item.forEach(function(device) {
        if(device){

            // 获取设备槽
            var device_data_slot = device_data_container.get(device);

            if(device_data_slot){

                // 判断该数据槽中对应该条数据的槽是否已经有值 如果有值 那么将这个槽清空 才重新赋值，
                var data_in_slot = device_data_slot.get(topic);
                if(data_in_slot != null){
                    // 清空整个数据槽
                    device_data_slot.forEach(function(value,key){
                        device_data_slot.set(key,null);
                    });
                     console.log('清空数据槽');
                }
                console.log(data_in_slot);
                device_data_slot.set(topic,message);
                console.log(device_data_slot.get(topic));
                console.log('添加新数据到数据槽');
                
                // 判定是否整个数据槽的数据已满？ 
                var is_slot_full = true;
                 device_data_slot.forEach(function(value,key){
                        if(value == null){
                            is_slot_full = false;
                        }
                });
               
                
                if(is_slot_full){

                    // 分组数据 并且发布
                    client.publish(device,JSON.stringify(mapToArr(device_data_slot)));
                    // console.log('设备'+device+"数据槽已满，发布分组数据");
                    // console.log(device_data_slot);
                    // console.log("\n");
                    // 清空该设备的数据槽
                    device_data_slot = setMapNull(device_data_slot);

                }

                // 数据槽更新
                device_data_container.set(device,device_data_slot);
                //console.log('设备 '+device+"的数据槽的长度为"+device_data_slot.size);
            }
            //console.log("设备容器 长度为"+device_data_container.size);

        }
        
    });

});

function setMapNull (map){
     map.forEach(function(value,key){
        map.set(key,null);
     });
    //console.log();
    return  map;
}


function mapToArr(map)
{
    var arr = [];
    map.forEach(function(value,key){
            arr.push({k:key,v:value});
        });
    return  arr;
}