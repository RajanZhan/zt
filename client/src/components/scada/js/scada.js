/**
 * scada相关参数配置
 */
export default  {
  // 图元默认脚本
  pixel_default_script:`
  {
    /*@ 数据处理端
    * 访问自定义属性 this.getAttr('attr_name');

    * 访问图元状态值，状态由key 状态名、value 状态值构成。
       例如 this.setState('rotate',1),来设置rotate 这个状态的值。

    * 获取图元的状态值，this.getState('状态名')。
    *
    */
    process:{

      /*
      数据处理方法 ，每次自定义属性中的值发生变化，都将触发此
      */
      data_handler:function(){
      }
    },

    /*@ 数据消费端
      * 通用旋转方法，this.animate.rotate(animate_type),
        当animate_type 为1时正转、2反转、0停止。

      * 通用发布控制方法，this.setCtr(attr_name,value),通过该方法
        可以下发控制到设备端，attr_name 为数据处理端的对应的attr，
        value为对应的值

      * 获取图元的状态值，this.getState('状态名')。

    */
    consume:{

      /*
       * 鼠标事件监听 ，event的值可能为 mouse:over,mouse:down,
         mouse:up
      */
      Event:function(event){
      },

      /*
       * 数据消费方法 ，当数据处理端(process) 调用
        this.setState()来设置状态时，将会触发次消费方法
      */
      consume_data:function(){
      },

    }
  }
  `,

}
