/*
* 业务处理的服务器
* 功能：订阅所有的mqtt数据，然后根据不同的图元业务 处理数据并发布到mqtt
* */
var mqtt  = require('mqtt');
//var basePixel require("./basePixel");
const fs = require('fs');

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
			await sleep(500);
			var pixel = null;
			let pixelFullPath = projectPath+project_list[i]+"/pixel/"+pixel_arr[j];
			pixel = require(pixelFullPath);
			delete require.cache[require.resolve(pixelFullPath)];
			
			
			console.log('----');
			//pixelMap[pixel.guid] = pixel;
			//pixelMap.push(pixel);
			console.log(pixel.guid);
			//console.log(pixel.guid);
			//console.log(topicToPixel);
			
			//console.log(topicToPixel);
			
		}
		console.log('\r\n');
		for(let pixel in pixelMap){
			console.log('<>');
			console.log(pixel);
			console.log(pixelMap[pixel].guid);
		}
		
	}
	
	
})()
