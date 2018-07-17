export default {

  // 发布MQ主题
  publish(state,options){
    //state.MQ.set(options.topic,{timestamp:new Date().getTime(),data:options.data});
    //state.MQ = {timestamp:new Date().getTime(),toppic:options.toppic,data:options.data};
    let script = `
    state.MQ.`+options.toppic+` = {timestamp:`+new Date().getTime()+`,data:'`+options.data+`'}
   `
    eval(script);
    //console.log(state);
    //console.log(script);
  },
}
