

var mosca = require('mosca');

var MqttServer = new mosca.Server({
    port: 1883
});

MqttServer.on('clientConnected', function (client) {
    console.log('client connected', client.id);
});

/**
 * 监听MQTT主题消息
 **/
MqttServer.on('published', function (packet, client) {
    var topic = packet.topic;
    console.log('MQ server 消息 监听到主题为' + topic + "的消息");
    //console.log('message-arrived--->','topic ='+topic+',message = '+ packet.payload.toString());

});

MqttServer.on('ready', function () {
    console.log('mqtt server  is running...');
    //MqttServer.authenticate = authenticate;
});
