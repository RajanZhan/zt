var express = require('express');
var path = require('path');
var app = express();
var io = require('socket.io')()
var fs = require('fs');
var util = require('./lib/util.js');

var device_json_path = './device_json';// 存放设备描述的路径
var ty_json_path = './tyList';// 存放图元描述的路径
var template_path = './pixelTemplate';
var project_path = './project';


var socket_clients = [];

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    limit:'50mb',
    extended: true,
    parameterLimit:50000
}));

var broker = require('./lib/mqBroker')();

app.set('views',path.join(__dirname , 'views') );
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

app.use('/public',express.static('public'));

//图元运行
app.get('/', function (req, res) {
    var ty_list = fs.readdirSync('../tyList');
    res.render('index',{ty_list:ty_list});
});

// 获取图元列表
app.get('/getTyList', function (req, res) {

    var ty_list = fs.readdirSync('../tyList');
    res.contentType('json');//返回的数据类型
    res.send(JSON.stringify({ status:1,data:ty_list}));//给客户端返回一个json格式的数据
    res.end();
});

// 图元开发平台
app.get('/scada', function (req, res) {
    //var ty_list = fs.readdirSync('../tyList');
    res.render('scada');
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
});

console.log('资源服务器启动成功...');

var clientList = new Map();// 客户端列表

var socket_sub_map = new Map();// 客户端订阅的主题对应关系

var client_data_map = new Map();// 客户端数据关系

var mq_data_cache = new Map();//mq 数据缓存




// socket.io 监听
var socket_server = io.listen(server);
socket_server.sockets.on('connection',function (socket) {
    //console.log('some one is connect ' + socket.id);

    // 定时发送测试数据
    setInterval(function () {
        socket.emit('dataSource',[
            {key:'device1-1',value:Math.random().toFixed(2)},
            {key:'device1-2',value:Math.random().toFixed(2)},
        ]);
    },2000)


    clientList.set(socket.id,socket);
    socket.on('runTy',function (data) {
        //console.log(data);
        if(data.ty)
        {
            var ty_obj = require('../tyList/'+data.ty);
            socket_clients[ty_obj.type] = socket;
            broker.subscribe(ty_obj.type);

            // 同时将图元的自身描述发送到前端
            socket.emit('act_attr_desc',JSON.stringify(ty_obj.act_attr_desc));
            console.log('run ty');
        }
    })


   /**
    * scada系统 api 
    */
	
	// 客户端保存图元模板
    socket.on('scada/toServer/savaAsTemplate',function(data,fn){
		
		let tname = data.templateName;
		
		if(tname){
			
			fs.writeFileSync(template_path+"/"+tname+".template",JSON.stringify(data));
            fn({status:1,msg:'图元模板保存成功'});
			console.log("图元模板保存成功");
		}
		
        });
	
	// 获取图元模板列表
    socket.on('scada/toServer/getPixelTemplateList',function(data,fn){
		
		let tname = data.templateName;
		let list = fs.readdirSync(template_path);
		let res = [];
		for(let t of list){
			res.push({templateName:t});
		}
		
		fn({status:1,msg:'获取ok',data:{pixelTemplateList:res}});
    });
	
	// 根据模板名获取图元模板的详细数据
	socket.on('scada/toServer/getPixelTemplateDetail',function(data,fn){
		
		let tname = data.templateName;
		let fullPath = template_path+'/'+tname;
		if(fs.existsSync(fullPath)){
			let  = fs.readdirSync(template_path);
			let res = fs.readFileSync(fullPath,{encoding:'utf-8'});
			//console.log(JSON.parse(res));
			fn({status:1,msg:'获取ok',data:{pixel:JSON.parse(res)}});
		}
		
    });
	
	function deleteall(path) {  
    var files = [];  
    if(fs.existsSync(path)) {  
        files = fs.readdirSync(path);  
        files.forEach(function(file, index) {  
            var curPath = path + "/" + file;  
            if(fs.statSync(curPath).isDirectory()) { // recurse  
                deleteall(curPath);  
            } else { // delete file  
                fs.unlinkSync(curPath);  
            }  
        });  
        fs.rmdirSync(path);  
    }  
}; 
	
	// 保存项目文件
	socket.on('scada/toServer/saveProject',function(data,fn){
		
		if(data.pro_name){
			let path = project_path+"/"+data.pro_name;
			let pixel_path = path +"/pixel";
			if(fs.existsSync(path)){
				deleteall(path);
			}
			if(fs.existsSync(pixel_path)){
				deleteall(pixel_path);
			}
			fs.mkdirSync(path);
			fs.mkdirSync(pixel_path);
			fs.writeFileSync(path+"/"+data.pro_name+".project",JSON.stringify(data));
			//为每一个图元创建脚本文件
			for(var doc of data.pro_docs){
				for(var obj of doc.canvas.objects){
					//console.log(obj);
					let script= `var BasePixel = require('../../../basePixel'); 
					var basePixel =  BasePixel;
					var attr = JSON.parse('`+JSON.stringify(obj.scada_attr.attr)+`')
					; var myPIxel = ` +obj.scada_attr.script ;
					script += `
						basePixel.attr = attr;
						basePixel.doc_id = '`+obj.scada_attr.doc_id+`';
						basePixel.guid = '`+obj.scada_attr.guid+`';
						basePixel.pro_id = '`+data.pro_id+`';
						
						for(let key in myPIxel.process){
						basePixel[key] = myPIxel.process[key];
						}
						basePixel.consume = myPIxel.consume;
						module.exports = basePixel;
					`;
					fs.writeFileSync(path+"/pixel/"+obj.scada_attr.guid+".pixel",script);
				}
			}
			fn({status:1,msg:'项目保存成功',data:{}});
			console.log("项目保存成功");
		}
    });
	
	// 获取项目列表
	socket.on('scada/toServer/getProjectList',function(data,fn){
		
		let projectList = fs.readdirSync(project_path+"/");
		fn({status:1,msg:'获取ok',data:{projectList:projectList}});
		
    });
	
	// 获取项目数据 这里是运行项目
	socket.on('scada/toServer/getProjectDetail',function(data,fn){
		console.log(data);
		if(data.pro_name){
			let fullPath = project_path+'/'+data.pro_name+"/"+data.pro_name+".project";
			let project = fs.readFileSync(fullPath,{encoding:'utf-8'});
			
			// 这里要针对这个项目的所有的图元的需要消费的数据做一个订阅
			let pixelPath = project_path+'/'+data.pro_name+"/pixel";
			let pixelList = [];
			let pixelNameList = fs.readdirSync(pixelPath);
			
			for(let pixelName  of pixelNameList){
				if(pixelName.indexOf(".pixel") == -1){
					continue;
				}
				let pixel = require(pixelPath+'/'+pixelName);
				delete require.cache[require.resolve(pixelPath+'/'+pixelName)];
				pixelList.push({
					doc_id:pixel.doc_id,
					guid:pixel.guid,
					consume_data : pixel.consume.consume_data,// 数据消费的方法
                    Event : pixel.consume.Event,
                    getState : pixel.getState,
                    getAttr : pixel.getAttr,
                    setCtr : pixel.setCtr,
                    attr : pixel.attr,
                    showDialog : pixel.showDialog,
                    removeDialog : pixel.removeDialog,
				});
				let topic = "state_"+pixel.pro_id+"_"+pixel.doc_id+"_"+pixel.guid;
				addClientToTopic(topic,socket);
				//console.log(pixel);
			}
			fn({status:1,msg:'获取ok',data:{project:project,pixelList:util.serialize(pixelList,'pixelList')}});
		}	
    });
	
	
    // 客户端添加图元 addTy 
    socket.on('scada/toServer/addTy',function(data,fn){
		
		//console.log(data);
		if(data.script)
		{
			let code = `
			var base = require('./common/basePixel.js'); var script = `+data.script+`
			for(let k in base){eval('script.'+k+' = '+base[k]);};
			script.id = '`+data.id+`'; script.type='`+data.type+`';script.canvas=`+data.canvas+`
			module.exports = script;
			`;
			fs.writeFileSync(ty_json_path+"/"+data.id+".ty",code);
            fn({status:1,msg:'图元添加成功'});
		}
		return;
        if(data.ty_id && (data.devices.length > 0)){
            var ty = {
                id:data.ty_id,
                attr:data.ty_attr,
                yw_desc:{
                    need_data:data.devices,
                    result_data:null,
                    methods:data.code.yw_methods,
                },
                act_attr_desc:{
                    methods:data.code.act_methods
                }
            }
            fs.writeFileSync(ty_json_path+"/"+data.ty_id+".ty",JSON.stringify(ty));
             fn({status:1,msg:'图元添加成功'});
        }
        });

    // 客户端加载图元列表 scada/toServer/getTyList     runTy
    socket.on('scada/toServer/getTyList',function(data,fn){
        
            var list = fs.readdirSync(ty_json_path)
			var pixel_list = [];
			for(let ty in list)
			{
				if(list[ty].indexOf('.ty') == -1){
					continue;
				}
				pixel_list.push(list[ty]);
			}
            fn({status:1,msg:'获取ok',data:pixel_list});
        });

    // 客户端运行图元 scada/toServer/runTy     
    socket.on('scada/toServer/runTy',function(data,fn){
        
        if(data.ty && (data.ty != '0')){
            // 将这个客户端订阅这条数据
            var topic = data.ty+"_state";
            //broker.subscribe(topic);
            addClientToTopic(topic,socket);

            // 载入该图元的的 act_attr_desc 
			//console.log(require.cache[ty_json_path+"/"+data.ty+".ty"]);
			var pixel_object = require(require.resolve(ty_json_path+"/"+data.ty+".ty"));//JSON.parse(fs.readFileSync(ty_json_path+"/"+data.ty+".ty"));
			delete require.cache[require.resolve(ty_json_path+"/"+data.ty+".ty")];
			
			// 构造返回数据
			let pixel_client_obj = {id:pixel_object.id,type:pixel_object.type,consume_data:pixel_object.consume_data,
			Event:pixel_object.Event,setCtr:pixel_object.setCtr,_getState:pixel_object._getState
			};
			//console.log();return;
			fn({status:1,msg:topic+'图元运行中',data:{canvas:pixel_object.canvas,pixel:util.serialize(pixel_client_obj,'pixel_result_object')}});
			return;
			// 模拟发送 opc 处理结果的数据
			/*setInterval(function(){
				let random = Math.random();
				let res_data = 0;
				if(random >= 0.7)
				{
					res_data = 'st';
				}
				else if(random >= 0.5)
				{
					res_data = 'zz';
				}
				else {
					res_data = 'fz';
				}
				socket.emit('scada/toClient/updateData',{data:res_data,id:pixel_object.id});
			},1000)
			*/
				
			
			//console.log(pixel_object);
			//return;
            var ty_obj = JSON.parse(fs.readFileSync(ty_json_path+"/"+data.ty+".ty"));
            fn({status:1,msg:topic+'图元运行中',data:{act_attr_desc:ty_obj.act_attr_desc,id:ty_obj.id}});
        }
    });


	// 监听客户端图元下发控制
	socket.on('scada/toServer/setCtr',function(data,fn){
		//console.log('监听到控制信号');
		/*console.log(data);
		return;*/
		console.log(data);
		if(data.topic &&data.data)
		{
			var topic = data.topic +"_ctr";// 做标志 防止 混淆
			broker.publish(topic,''+data.data)
			console.log('监听到控制信号');
		}
	})




    })

    function addClientToTopic (topic,socket){
        var client_list =  socket_sub_map.get(topic);// 获取订阅了这条数据的客户端
            broker.subscribe(topic);
            if(!client_list){
                 client_list = new Set();
            }
            client_list.add(socket.id);
            socket_sub_map.set(topic,client_list);
            console.log('添加订阅');
            console.log(topic);
    }


    
    function updateToClient()
    {
         for(var c_data of client_data_map){
            var client = clientList.get(c_data[1].id);
            if(client){
                //c_data[1].data_source = setToArr(c_data[1].data_source);
                // console.log(c_data[1].data_source.keys());
                // console.log(JSON.stringify(c_data));
                client.emit('scada/toClient/updateData',c_data[1]);
                //console.log('发送更新数据');
            }
        }   
    
    }



// mqtt 消息监听
broker.on('connect', function () {
    console.log('mqtt connected.....');
    //client.subscribe('device1');
});
broker.on('message', function (topic, message) {

    console.log('broker get msg'+topic);
    mq_data_cache.set(topic,message.toString());


    var client_list = socket_sub_map.get(topic);
    //console.log(client_list);
    // for(var c of client_list){
    //     var client = clientList.get(c);
    //     if(client){
    //         client.emit('scada/toClient/dataSourcePublish',{topic:topic,value:message.toString()});
    //     }
    // }
    for(var c of client_list){

        var client_data = client_data_map.get(c);
        
        var data_source = null;
        
        if(client_data){
             data_source = client_data.data_source;
             for(let ds in data_source){
            
            let ds_json = JSON.parse(data_source[ds]);
            if(ds_json.topic == topic){
                ds_json.v = message.toString();
                data_source[ds] = JSON.stringify(ds_json);
            }
          }
        }
        
        //client_data.data_source = data_source;
        var client = clientList.get(c);
        if(client){

            // 同时获取已经添加的设备
            /*let device_list_index = fs.readdirSync(device_json_path);
            var device_list = [];
            for(var i of  device_list_index){
                var device = JSON.parse(fs.readFileSync(device_json_path+"/"+i));

                // 更新每个设备的数据源的数据
                for(var data_in_device_index in device.data_list){
                    let data_item = {};
                    data_item.topic = device.data_list[data_in_device_index];
                    data_item.v =  mq_data_cache.get( data_item.topic);
                   // console.log(data_item);
                    device.data_list[data_in_device_index] = data_item;
                }
            
                device_list.push(device);
            }
            // 更新图元
            var ty_list = fs.readdirSync(ty_json_path);*/

            //client.emit('scada/toClient/updateData',{data:message.toString(),id:topic.split('_')[0]});
            client.emit('scada/toClient/updateData',{data:message.toString(),id:topic});
        }
    }
});


function setToArr(s){
    var arr = [];
    for(let i of s){
        arr.push(i);
    }
    return arr;
}



