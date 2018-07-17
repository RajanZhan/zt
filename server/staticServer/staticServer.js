var express = require('express');
var path = require('path');
var app = express();
var io = require('socket.io')()
var fs = require('fs');

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

// 运行图元
/*app.post('/runTy', function (req, res) {


    var ty = req.body.ty;
    if(ty)
    {
        // 加载改图元
        var ty_obj = require('../tyList/'+ty);

        // 开始订阅该图元的数据
        console.log(ty_obj)
        broker.subscribe(ty_obj.type);
    }
    //console.log(req.params);
    res.contentType('json');//返回的数据类型
    res.send(JSON.stringify({ status:1,data:2}));//给客户端返回一个json格式的数据
    res.end();
});*/


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
});

// mqtt 消息监听
broker.on('connect', function () {
    console.log('mqtt connected.....');
    //client.subscribe('device1');
});
broker.on('message', function (topic, message) {
    //console.log(topic);
    if(socket_clients[topic])
    {
        socket_clients[topic].emit('ty_msg',message.toString())
    }
   /* console.log("get mqtt  topic "+topic);
    console.log("get mqtt  data "+message.toString());*/
});



// socket.io 监听
var socket_server = io.listen(server);
socket_server.sockets.on('connection',function (socket) {
    console.log('some one is connect ');
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
})


