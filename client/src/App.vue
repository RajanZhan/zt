<template>
  <div id="app">
    <!--<img src="./assets/logo.png">-->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data(){
    return {
    }
  },
  // 根组件 做一些初始化
  mounted(){
    window.requestAnimFrame = (function(){
                    return  window.requestAnimationFrame       ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame    ||
                            function( callback ){
                              window.setTimeout(callback, 1000 / 60);
                            };
                  })();
  }
}
</script>

<style>
#app {
  /*font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
   color: #2c3e50;
  margin-top: 60px; */
  width:100%;
  height: 100%;
}
 html,body {
    width: 100%;
    height: 100%;
  }
  #main-layout{
   height: 100%;
   width: 100%;
  }
</style>
