import Vue from 'vue'
import Router from 'vue-router'
import  Test from '@/components/Test'
import Index from '@/components/index/index'

import scada from '@/components/scada/scada.5';
//import scada from '@/components/scada/scada.1';

// 载入编辑器
import editor from '@/components/editor/editor'

import test from '@/components/test/test'

import  vuexRoot from '@/components/vuexRoot/vuexRoot';

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path:'/scada',
      name:'scada',
      component:scada
    },
    {
      path:'/editor',
      name:'editor',
      component:editor,
    },
    {
      path:'/test',
      name:'test',
      component:test,
    }
  ]
})



