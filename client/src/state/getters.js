export  default  {
  getSum(state){
    return state.count + state.total
  },
  getStateCount(state){
    return state.count;
  },

  //订阅消息
  subscribe(state){
    return state.MQ;
  }
}
