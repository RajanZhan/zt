/*
**  数据源状态
*/
import { mapToArr } from '../../common/util.js'

export default {

  namespaced:true,
  state: {
    dataSourceList: [],
    _dataSourceList:new Map(),
    count:0,
  },
  getters: {
    getDataSourceList(state){
      return state.dataSourceList;
    },
    getCount(state){
      return state.count;
    }
  },
  mutations: {

    // 更新数据源数据
    updateSourceData(state, data) {
      if (Array.isArray(data)) {

        for(let item of data){
          state._dataSourceList.set(item.key,item.value);
        }
      }
      else {
         state._dataSourceList.set(data.key, data.value);
      }
         state.dataSourceList = mapToArr(state._dataSourceList);
    },
    // 更新计数器
    updateCount(state){
      state.count ++;
    }
  },
}
