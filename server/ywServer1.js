/*
* 业务处理的服务器
* 功能：订阅所有的mqtt数据，然后根据不同的图元业务 处理数据并发布到mqtt
* */
var mqtt  = require('mqtt');
const fs = require('fs');
var client  = mqtt.connect('mqtt://localhost');

var ty_path = "./tyList";// 图元路径
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

var topicToPixel = new Map();// 数据主题与 图元 的 映射表
var pixelCache = new Map();// 缓存图元

    var fs_list =  fs.readdirSync(ty_path);
    for(var i in fs_list)
    {
		
        if(fs_list[i].indexOf('.ty') == -1)
		{
			continue;
		}
		// 载入图元
		let  pixel_object = require(require.resolve(ty_path+"/"+fs_list[i]));
		delete require.cache[require.resolve(ty_path+"/"+fs_list[i])];
		
		// 生成主题（数据tagName）与 图元 的映射
		//console.log(pixel_object.attr);continue;
		for(let tag in pixel_object.attr)
		{
			if(pixel_object.attr[tag])
			{
				var tagName = pixel_object.attr[tag].tagName;
				
				var pixel_list_in_this_topic = topicToPixel.get(tagName);
				client.subscribe(tagName);
				if((!pixel_list_in_this_topic) || (pixel_list_in_this_topic.size() <= 0))
				{
					pixel_list_in_this_topic = new Set();
				}
				pixel_list_in_this_topic.add(pixel_object.id);// 表示该图元将订阅这条消息
				
				topicToPixel.set(tagName,pixel_list_in_this_topic);
			}
		}
		
		// 将MQ对象绑定到图元对象
		pixel_object.broker = client;
		
		
		
		
		pixelCache.set(pixel_object.id,pixel_object);
		
    }

/*setInterval(function(){

},5000)*/






client.on('connect', function () {
    console.log('连接Mqtt 成功...');
    
    //client.subscribe('device1');
});

client.on('message', function (topic, message) {

    //console.log(topic,message.toString());return;
	var pixel_list_for_this_topic = topicToPixel.get(topic);
	//console.log(pixel_list_for_this_topic);return;
	if(pixel_list_for_this_topic &&(pixel_list_for_this_topic.size > 0))
	{
		for(let pixel_id of pixel_list_for_this_topic.values())
		{
			if(pixel_id)
			{
				var pixel_obj = pixelCache.get(pixel_id);
				//console.log(pixel_obj);continue;
				if(pixel_obj)
				{
					// 更改attr中tag的值
					for(let tag_index in pixel_obj.attr)
					{
						if(pixel_obj.attr[tag_index].tagName == topic)
						{
							pixel_obj.attr[tag_index].value = message.toString();
							pixel_obj.data_handle();
							console.log('调用data_handle');
						}
					}
					
				}
			}
		}
	}
});