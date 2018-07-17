
var mqtt  = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');

client.on('connect', function () {
    console.log('device  is connected.....');

    setInterval(function (){
        client.publish('device1', JSON.stringify([Math.random().toFixed(1),Math.random().toFixed(1)]));
    }, 1000);
});

