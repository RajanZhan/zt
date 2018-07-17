/* MQ 消息队列 */
export default {
  namespaced: true,
  state: {
    MQ: {},
  },
  getters: {
    //订阅消息
    subscribe(state) {
      return state.MQ;
    }
  },

  mutations: {
    // 发布MQ主题
    publish(state, options) {
      state.MQ = {timestamp:new Date().getTime(),message:options.message,topic:options.topic}
    },
  }
}
