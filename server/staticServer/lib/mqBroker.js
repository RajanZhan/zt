module.exports = function () {

    var mqtt  = require('mqtt');
    var client  = mqtt.connect('mqtt://localhost');

    return client;
    /*client.on('connect', function () {
        console.log('client connected.....');
        client.subscribe('device1');
    });

    client.on('message', function (topic, message) {
        // message is Buffer
        console.log("mqtt client  get the msg "+message.toString());
        //client.end();
    });*/

}