
/* 编辑区对象 */
export default {
  namespaced: true,
  state:{
    content:null,// 编辑器的内容
  },
  getters:{
    getContent:function(state,){
      return state.content;
    }
  },
  mutations:{
    updateContent:function(state,data){
      state.content = data;
    }
  }
}
