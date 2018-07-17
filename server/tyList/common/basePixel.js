module.exports =  {
	
	OBJECTINFO:function(){
		console.log('object info,this id is ' + this.id);
	},
	
	// 图元处理完成数据之后 调用此方法 发布当前图元的状态
	publish:function(topic,data){
		this.broker.publish(topic,data);
	},
	
	// 更改图元状态
	setState:function(data){
		var topic = this.id+"_state";
		this.publish(topic,data);
	},
	
	// 发布控制   判断当前方法运行在服务器端 还是 客户端
	setCtr :function(topic,data){
		if(typeof (this.broker) != 'undefined') // 说明是在服务器端运行
		{
			this.publish(topic,data);
		}
		else // 说明是在客户端运行
		{
			if(typeof(this.client) == 'undefined')  
			{
				throw "客户端socket client 对象尚未初始化,无法调用本方法";
			}
			this.client.emit('scada/toServer/setCtr',{topic:topic,data:data});
		}
	},
	
	
	
	// 图元正转的方法
	rotate:function(state)
	{
		if(state == '1') // 正转
		{
			console.log('正转');
			
		}
		else if(state == '2') // 反转
		{
			console.log('反转');
		}
		else if(state =='0')// 停止
		{
			console.log('停止');
		}
	}
}