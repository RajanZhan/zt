// 图元的基类
var basePixel =  {
	//state：null,
	//改变attr的值，同时调用数据处理方法
	_setAttrValue: function(data){
		//console.log(this.attr);return;
		if(data.tagName && data.value){
			for(let index in this.attr){
				if(this.attr[index].tagName ==  data.tagName){
					this.attr[index].value =  data.value;
					this.data_handler();
					break;
				}
			}
		}
	},
	// 读取attr的value
	getAttr: function(attrName){
		
		for(let index in this.attr){
				if(this.attr[index].attrName ==  attrName){
					return  this.attr[index];
					break;
				}
			}
		return {tagName:null,attrName:null,value:null};
	},
	
	// 设置图元的状态
	setState: function(state){
		//console.log('set state');
		//console.log(state);
		this.state = state;
		this.mqClient.publish("state_"+this.pro_id+"_"+this.doc_id+"_"+this.guid,state);
	},
	// 获取图元的状态
	getState: function(){
		return this.state;
	},
	
	// 下发控制
	setCtr:function(attrName,ctr){
		let attr = this.getAttr(attrName);
		//console.log("下发控制");
		//console.log(attr);
		//console.log(attrName);
		if(attr){
			console.log(attr);
			this.client.emit('scada/toServer/setCtr',{topic:attr.tagName,data:ctr});
		}
		
	},
	
	//显示弹窗 type 为弹窗的类型，data弹窗的数据
	showDialog:function(type,pos,data){
		// 内置的弹窗数据，这里可以从数据中获取，在这里写为了快速的调试
		let dialog = [];
		dialog["status"] = `<div id="dialog" style="z-index:99;;position:absolute;left:{left}px;top:{top}px;">
								<style>
								table tr th, table tr td ,table,tr{ border-color:#4475B7; }
								td{padding:5px}
								.key{background:#224B7D;color:#6B9CDE}
								.value{background:#336AB2;color:white}
								</style>
								<table border="1" cellspacing="0" >
								{datalist}
								</table>
							</div>
							`;
		
		
		if((!dialog[type]) || (!data))
		{
			console.log("对应的弹窗不存在");
			return;
		}
		
		if(type == 'status')
		{
			let dialogTemplate = dialog[type];
			// 设置窗口的位置
			dialogTemplate = dialogTemplate.replace("{left}",pos.left).replace("{top}",pos.top);
			
			// 生成表格对应的数据项
			let datalist = "";
			for(let key in data)
			{
				datalist += `
				<tr>
					<td class="key">`+key+`</td>
					<td class="value">`+data[key]+`</td>
				</tr>
				`;
				//console.log(key);
				//dialogTemplate = dialogTemplate.replace("{"+key+"}",data[key]);
			}
			dialogTemplate = dialogTemplate.replace(new RegExp("{datalist}",'gm'),datalist);
			
			// 替换数据
			$("#dialog").remove();
			$("body").append($(dialogTemplate));
		}
		
		
		
	},
	removeDialog:function(){
		$("#dialog").remove();
	}
	
	
}
module.exports = basePixel;