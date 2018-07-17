var express = require('express');
var path = require('path');
var app = express();
var io = require('socket.io')()
var fs = require('fs');

var device_json_path = './device_json';// 存放设备描述的路径
var ty_json_path = './ty_list';// 存放图元描述的路径


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



var clientList = new Map();// 客户端列表

var socket_sub_map = new Map();// 客户端订阅的主题对应关系

var client_data_map = new Map();// 客户端数据关系

var mq_data_cache = new Map();//mq 数据缓存

// socket.io 监听
var socket_server = io.listen(server);
socket_server.sockets.on('connection',function (socket) {
    console.log('some one is connect ' + socket.id);


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
    socket.on('addDevice',function(data,fn){
        console.log('add device ');
        console.log(data);

        // 为该客户端添加设备 在这里的表现为为该客户端订阅该条数据
        //broker


        fn(null,{statuc:1,msg:'ok'});
    })


    // 客户端添加数据源
    socket.on('scada/toServer/addDataSource',function(data,fn){
        
        if(data.topic){
            console.log('add dataSource');
            // var client_list =  socket_sub_map.get(data.topic);// 订阅了这条数据的客户端
            // broker.subscribe(data.topic);
            // console.log(data.topic);
            // if(!client_list){
            //      client_list = new Set();
            // }
            // client_list.add(socket.id);
            // socket_sub_map.set(data.topic,client_list);
            addClientToTopic(data.topic,socket);// 该客户端与这个主题绑定

            // 将该条数据添加到对应客户端的数据源缓存中
            var client_data = client_data_map.get(socket.id);
            if(!client_data){
                client_data = {id:socket.id,data_source:[]};
            }
            console.log(typeof client_data.data_source)
            console.log( client_data.data_source)
            client_data.data_source.push(JSON.stringify(data));
            client_data_map.set(socket.id,client_data);
            //console.log(client_list);
            fn({status:1,msg:'数据源添加成功'});
        }

    });

    // 客户端添加设备 addDevice
    socket.on('scada/toServer/addDevice',function(data,fn){
            
            if(data.device_id &&(data.data_list.length > 0)){
                
                fs.writeFileSync(device_json_path+"/"+data.device_id+".device",JSON.stringify(data));
                fn({status:1,msg:'设备添加成功'});
            }

        });



        // 客户端添加图元 addTy 
    socket.on('scada/toServer/addTy',function(data,fn){
    
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
            fn({status:1,msg:'获取ok',data:list});
        });

    // 客户端运行图元 scada/toServer/runTy     
    socket.on('scada/toServer/runTy',function(data,fn){
        
        if(data.ty){
            // 将这个客户端订阅这条数据
            var topic = data.ty+"_ty_";
            //broker.subscribe(topic);
            addClientToTopic(topic,socket);

            // 载入该图元的的 act_attr_desc
            var ty_obj = JSON.parse(fs.readFileSync(ty_json_path+"/"+data.ty+".ty"));
            fn({status:1,msg:topic+'图元运行中',data:{act_attr_desc:ty_obj.act_attr_desc,id:ty_obj.id}});
        }
    });








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
            let device_list_index = fs.readdirSync(device_json_path);
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
            var ty_list = fs.readdirSync(ty_json_path);

            client.emit('scada/toClient/updateData',{mq_data:{topic:topic,msg:message.toString()},ty_list:ty_list,device_list:device_list,data_source:data_source});
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



