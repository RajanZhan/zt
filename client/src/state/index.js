
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import mutations from './mutations'
import dataSource from './modules/dataSource.js';
import editor from './modules/editor.js';
import project from './modules/project.js';
import MQ from "./modules/MQ.js"


Vue.use(Vuex);

export  default new Vuex.Store({
  state:{
    count:0,
    MQ:{},
  },
  modules:{
    dataSource,
    editor,
    project,
    MQ,
  },
  mutations,
  getters,

})
