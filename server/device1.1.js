"use strict"
var mqtt  = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');
// 设备1
var device1 = {
    id:"device1",
    data:[
        {key:'device1-1',value:0},
        {key:'device1-2',value:1},
        {key:'device1-3',value:0},
    ],
    getData(){
         let data = this.data;
         //data[0].value = Math.random().toFixed(2);
         //data[1].value = Math.random().toFixed(2);
         //data.push({key:'ts',value:new Date().getTime()});
        return data;
    },
    setData(data)
    {
        this.data = data;
    }
}

// 设备2
var device2 = {
    id:"device2",
    data:[
        {key:'device2-1',value:0},
        {key:'device2-2',value:0},
        {key:'device2-3',value:1},
    ],
    getData(){
        let data = this.data;
        //data.push({key:'ts',value:new Date().getTime()});
        return data;
    },
    setData(data)
    {
        this.data = data;
    }
}

// 设备2
var device3 = {
    id:"device3",
    data:[
        {key:'device3-1',value:0},
        {key:'device3-2',value:0},
        {key:'device3-3',value:1},
    ],
    getData(){
        let data = this.data;
        //data.push({key:'ts',value:new Date().getTime()});
        return data;
    },
    setData(data)
    {
        this.data = data;
    }
}

var workDevices = [device1,device2,device3]

client.on('connect', function () {
    console.log('设备驱动已经连接MQ Server .....');
	
	
	
	for(let device of workDevices)
	{
		console.log(device);
		let data =  device.getData();
		if(data)
		{
			for(let tag of data)
			{
				 client.subscribe(tag.key+'_ctr');
			}
		}
	}
	
    // 订阅设备的数据
    //client.subscribe('device1-1_ctr');
    //client.subscribe('device1-2_ctr');
    //client.subscribe('device1-3_ctr');

    setInterval(function (){


        try{
		
		console.log('\n \n');
		for(let device of workDevices)
		{
			let data =  device.getData();
			if(data)
			{
				pushMsg(client,data);
			}
			console.log("@");
		}
        // client.publish('device1', JSON.stringify(device1.getData()));
       
         //pushMsg(client,device1.getData());
         console.log('-----------------------------');
    
         //pushMsg(client,device2.getData());
         //console.log('\n \n');
        }
        catch(e)
        {
            console.log(e)
        }

    }, 1000);
});



client.on('message',function(topic,message){
	var  topic_arr = topic.split('_');
	console.log('监听到ctr');
	if(topic_arr[1] == 'ctr') // 说明是控制消息
	{
		for(let device of workDevices)
		{
			let data =  device.getData();
			if(data)
			{
				let is_this_device = false;
				for(let i in data)
				{
					if(data[i].key == topic_arr[0])
					{
						data[i].value = message.toString();
						console.log('设置控制消息');
						is_this_device = true;
					}
					else{
						if(is_this_device)
						{
							data[i].value = 0;
						}
					}
				}
			}
		}
		
	}
    /*if(topic == device1.id){
        device1.setData(JSON.parse(message.toString()))
    }
    else if(topic == device2.id){
        device2.setData(JSON.parse(message.toString()))
    }*/
	
	
});


// 消息推送方法
var pushMsg = function (client,msg){
    for(var m of msg){
        //console.log(m);
        client.publish(m.key,""+m.value);
        console.log("推送消息:tagName: "+m.key+",value: "+m.value);
    }
}

