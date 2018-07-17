/*
* 业务处理的服务器
* 功能：订阅所有的mqtt数据，然后根据不同的图元业务 处理数据并发布到mqtt
* */
var mqtt  = require('mqtt');
//var basePixel require("./basePixel");
const fs = require('fs');
var client  = mqtt.connect('mqtt://localhost');

var projectPath  = "./project/";// 项目的路径
var device_path = "./staticServer/device_json";// 设备路径

console.log('业务服务器启动成功...');

function sleep(time){
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve();
		},time);
	});
}

/*
* 载入所有并且分析所有图元
* */
var ty_list = []; //

var project_list =  fs.readdirSync(projectPath);
var topicToPixel = new Map();
var pixelMap = [];// 存放图元
(async function(){
	for(var i in project_list)
	{
		// 遍历每个项目下的图元
		let pixel_arr = fs.readdirSync(projectPath+"/"+project_list[i]+"/pixel/");
		for(let j in pixel_arr){
			
			// 载入图元
			//console.log(projectPath+project_list[i]+"/pixel/"+pixel_arr[j]);
			await sleep(1000);
			let pixel = null;
			let pixelFullPath = projectPath+project_list[i]+"/pixel/"+pixel_arr[j];
			pixel = require(pixelFullPath);
			delete require.cache[require.resolve(pixelFullPath)];
			
			console.log(pixelFullPath);
			pixel.mqClient = client;// 将mq对象绑定到图元实例
			// 分析图元订阅的主题
			for(let attr of pixel.attr){
				
				if(attr.tagName){
					let pixel_in_this_topic = topicToPixel.get(attr.tagName);
					if(!pixel_in_this_topic){
						pixel_in_this_topic = [];
						//console.log(attr.tagName);
					}
					if(attr.tagName == "device1-1"){
						//console.log(pixel.guid);
					}
					console.log('--');
					pixel_in_this_topic.push({guid:pixel.guid,pro_name:project_list[i]});
					//console.log(pixel_in_this_topic.length);
					topicToPixel.set(attr.tagName,pixel_in_this_topic);
					client.subscribe(attr.tagName)
					console.log("订阅了 "+attr.tagName);
					//console.log();
				}
			}
			
			console.log('----');
			pixelMap[pixel.guid] = {
				guid:pixel.guid,
				pro_id:pixel.pro_id,
				doc_id:pixel.doc_id,
			_setAttrValue:pixel._setAttrValue,
			attr:pixel.attr,
			getAttr:pixel.getAttr,
			setAttr:pixel.getAttr,
			setState:pixel.setState,
			mqClient:client,
			data_handler:pixel.data_handler,
			
			};
			//pixelMap.push(pixel);
			console.log(pixel.guid);
			//console.log(pixel.guid);
			//console.log(topicToPixel);
			
			//console.log(topicToPixel);
			
		}
		//console.log(pixelMap);
		//console.log(topicToPixel);
		//console.log('\r\n');
		console.log('\r\n');
		for(let pixel in pixelMap){
			console.log('<>');
			console.log(pixel);
			console.log(pixelMap[pixel].guid);
		}
		
	}
	

	
})()

//let temp = require("./project/de/pixel/str_ADBektlumC.pixel");
//console.log(temp.guid);




client.on('connect', function () {
    console.log('连接Mqtt 成功...');
    
    //client.subscribe('device1');
});

client.on('message', function (topic, message) {
	
	let pixel_list = topicToPixel.get(topic);
	console.log(topic);
	console.log(pixel_list);
	console.log("_________topic_____");
	//return;
	//console.log(pixel_list);return;
	//console.log(topicToPixel.get('device1-1').size);
	if(pixel_list){
		//console.log("\n\n");
		for(let guid of pixel_list){
			let pixel = pixelMap[guid.guid];
			//let pixel = require(projectPath+guid.pro_name+"/pixel/"+guid.guid+".pixel");
			if(pixel){
				pixel._setAttrValue({tagName:topic,value:message.toString()});
				//console.log(pixel.guid);
			}
			//continue;
			/* console.log("^");
			console.log(guid.guid);
			console.log(pixel.guid);
			console.log("v"); */
			//continue;
			if(guid.guid != pixel.guid){
				console.log("异常"+guid.guid);
				console.log(pixel.guid);
			}
		}
		//console.log("\n\n");
	}
	return
    //console.log(topic,message.toString());
    // return;
    

});