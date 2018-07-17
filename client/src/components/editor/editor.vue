<!--代码编辑器-->
<<template>
  <div>
    <textarea :id="editorId">
  </textarea>
  </div>
</template>
<script>

  import { mapMutations,mapGetters } from 'vuex'
  import { serialize, getRandomString } from '@/common/util'
  export default {
    data(){
      return {
        editor:null,
        active_pixel:null,// 缓存当前的活动元素，用于与scada组件元素相比较来判定是活动元素是否已改动,
        editorId:getRandomString(8),
      }
    },
    created(){
      this.active_pixel = this.scada_active_pixel;
    },
    //props:['scada_active_pixel'],
    mounted(){
      var _this = this;
      var editor = CodeMirror.fromTextArea(document.getElementById(_this.editorId), {
        lineNumbers: true,
        mode: "javascript",
        gutters: ["CodeMirror-lint-markers"],
        keyMap: "sublime",
        theme: "monokai",
        lint: true
      });
      this.editor = editor;
      editor.setSize(400,600)

      // 初始化 内容
      //editor.setValue(_this.content);
      /* setTimeout(function() {
         //editor.setValue(_this.content);
         editor.setValue(_this.getActivePixelScriptFromState);
         //console.log(_this.getActivePixelScriptFromState);
      }, 100); */
      console.log(this.content);
      //console.log(this.$store);
      editor.on('update',function (obj) {
       // console.log(obj.getValue());
        //_this.$store.commit('editor/updateContent',obj.getValue());
        //_this.updateContent(obj.getValue());
        _this.$emit('contentUpdate',obj.getValue()); //触发代码更新的事件，传递到父组件，由父组件统一处理
        //_this.updateContent(obj.getValue());
        //console.log( _this.getContent());
      })
      //this.$emit('initEditor',editor);
    },
    computed:{
      ...mapGetters({
        getActivePixelScriptFromState:"project/getActivePixelScriptFromState",// 获取state中激活图元的脚本
      }),
    },
    methods:{

      ...mapMutations({
        //updateContent:'editor/updateContent', // 更新编辑区的内容 updatePixelScript
        updateContent:'project/updatePixelScript', // 更新编辑区的内容 updatePixelScript
      }),
      setValue(value){
        this.editor.setValue(value);
      },
      getValue(){
        return this.editor.getValue();
      }
    },
    watch:{
      /* "getActivePixelScriptFromState":{
        deep:true,
        handler:function(){
          //console.log('script changge ');
          //this.editor.setValue(this.getActivePixelScriptFromState);
          //
         // console.log(this.scada_active_pixel.guid,this.active_pixel.guid);
          if(this.scada_active_pixel.guid != this.active_pixel.guid){
            this.editor.setValue(this.getActivePixelScriptFromState);
            this.active_pixel = this.scada_active_pixel;
          }
        }
      } ,*/

    }
  }
</script>

<style scoped>
@import './css/docs.css';
@import './css/codemirror.css';
@import './css/lint.css';
@import './css/monokai.css';
.CodeMirror {
  text-align: left;
}
</style>
