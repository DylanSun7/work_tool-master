<template>
  <div class="container">
    <div class="function-module">
      <div class="function-head">
        <img src="../assets/style/tool-title/2-4.png">
        <p>OCR图片筛选</p>
      </div>

      <div class="function-middle">

        <!-- 左侧上传及处理区域 -->
        <div class="function-middle-left">

          <!-- 文件上传区域 -->
          <div  class="file-uploader" @drop.prevent="onDrop" @dragover.prevent  >
            <!-- 隐藏的文件输入框，用户点击上传按钮时触发 -->
             <div @click="openFileInput" class="upload-space" v-show="showFileDetails">
              <input
              type="file"
              @change="onFileChange"
              ref="fileInput"
              style="display: none"
              accept=".zip,.rar,.7z"
            />
            <!-- 显示已选择的文件名 -->
              <div id="upload" v-show="showFileDetails"></div>
              <div>
                <p v-if="file && showFileDetails">
              已选择文件：{{ file.name }} ({{ fileSize(file.size) }})
              <br>
              若要<strong>重新选择文件</strong>请将文件拖拽到这里，或者点击此区域<strong>重新选择文件</strong>
            </p>
            <p v-else-if="showFileDetails">
              将文件拖拽到这里，或者点击此区域<strong>选择文件</strong>进行上传
            </p>
              </div>
             </div>
        

            <!-- 进度条和上传进度文本，当有文件正在上传时显示 -->
            <div v-if="isUploading" class="upload-status">
              <div class="upload-status-out">
                <!-- 显示已选择的文件名 -->
                <p v-if="file" >{{ file.name }}</p>
              </div>
              <div class="upload-status-out">
                <div class="upload-status-in">
                  <p>上传进度：</p>
                  <el-progress
                    :text-inside="true"
                    :stroke-width="24"
                    :percentage="uploadProgress"
                    striped
                    striped-flow
                    :duration="5"
                    :color="progressColor"
                  />
                </div>
              </div>

            </div>

            <!-- 处理中的加载图片，覆盖进度条 -->
            <div v-if="isProcessing" class="processing-status">
              <img src="./tool-img/load.gif" alt="处理中" class="loading-image" />
              <p class="processing-message">文件正在处理中 。 。 。</p>
            </div>
          </div>

        </div>

        <!-- 右侧操作提交区域 -->
        <div class="function-middle-right">
          <!-- 上传按钮，点击后打开文件选择对话框 -->
          <div class="upload-btn">
            <form ref="uploadForm" @submit.prevent="handleSubmit">
              <div class="input-tag">
                  <el-input-tag
                  size="large"
                  v-model="strList"
                  @paste="handlePaste"
                  clearable
                  placeholder="输入文本(单击Enter后可添加另一个文本,若是复制粘贴请以“,”作为分隔符)"
                  aria-label="Please click the Enter key after input"
              />
              </div>


              <div class="slider-block">
                
                  <span class="demonstration">文本匹配度<el-tooltip effect="light" content="文本完全匹配的程度" placement="bottom" ><img src="../assets/style/Q.png"></el-tooltip>：</span>
                  <el-slider 
                      v-model="strThresh"
                      :step="10"
                      :min="50"
                      :max="100"
                      :marks="valueMark"
                      :format-tooltip="formatTooltip"
                      show-stops 
                      />
                  <el-input-number
                      v-model="strThresh"
                      :step="10"
                      :min="50"
                      :max="100"
                      step-strictly
                      controls-position="right"
                      size="large"
                      @change="handleChange"
                      style="padding-left: 4vh; 
                      width: 220px;" 
                      >
                  <template #suffix>
                    <span>%</span>
                  </template>
                  </el-input-number>
              </div>
              <button type="submit" class="submit-OCR" :disabled="isUploading || isProcessing">提&nbsp;&nbsp;交</button>
            </form>
          </div>
        </div>

      </div>
    </div>
    
    <!-- 功能描述 -->
    <div class="function-text">
      <div class="text-head">
        <img src="../assets/style/text.png">
        <p>功能概述</p>
      </div>

      <div class="text-content">
        <p>功能：筛选含有特定文本的图片</p>
        <p>使用说明：点击上传选择包含图片的zip格式压缩包文件，输入文本后选择匹配度，添加文件后点击提交即可。</p>
        
        <ul>
        <li class="txt-content-li-out">注意：
          <ul class="txt-content-li">
            <li>上传的压缩包内包含同名的文件夹；</li>
            <li>压缩包名只能为字母、数字、“_”和“-”的任意组合；</li>
            <li>文件大小不能超过5G；</li>
            <li>上传的图片仅支持'.jpg', '.png', '.jpeg', '.bmp'；</li>
            <li>文本注意区分大小写；</li>
            <li>不支持中文名字的图片。</li>
          </ul>
        </li>
      </ul>
      </div>
      <div class="img-tool">
        <p>使用流程：</p>
        <img alt="Vue logo" src="./tool-explain/tool8.jpg" width="900px" height="auto" class="image">
      </div>
    </div>
  </div>
</template>


<script >
import { ref,reactive } from 'vue';
import { useSelect_Check } from "@/select_check";
import  useUpload  from "@/upload";
import { API_CONFIG } from '@/config/api';
import { ElInputTag, ElSlider , ElTooltip } from 'element-plus';


export default {

  components: {
    ElInputTag,
    ElSlider,
    ElTooltip,
  },
  mounted() {
  this.initLottie('upload');
},
  methods: {
  formatTooltip(val) {
    return val + '%';
  },
  handleChange(value) {
      console.log('Text matching threshold changed to:', value);
    }
}, 
  setup() {

    // 初始化输入值为一个空数组
    const strList = ref([]);
    const strThresh = ref(80); // 设置默认值为 80

    const valueMark = reactive({
      50: '50%',
      80: '80%',
      100: '100%',
    })

    const { url: uploadUrl, field: fieldName } = API_CONFIG.ocrImage;

    const extraFields = () =>({
      strList: JSON.stringify(strList.value),
      strThresh: strThresh.value,
  });
  console.log('Extra Fields:', extraFields());

  const {
    uploadFile,
    uploadProgress,
    isUploading,
    progressColor,
    isProcessing
  } = useUpload(uploadUrl,fieldName,extraFields);

    const {
    file,
    showFileDetails,
    isLottieVisible,
    fileInput,
    initLottie,
    handleSubmit,
    fileSize,
    openFileInput,
    onFileChange,
    onDrop,
       
  } = useSelect_Check();
    
  const handlePaste = (event) => {
    // 获取粘贴的内容
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    // 以“,”为分隔符分割粘贴的内容
    const newItems = pastedText.split(/[,，]/).map(item => item.trim()).filter(item => item);
    // 将分割后的内容添加到strList数组中
    strList.value = [...strList.value, ...newItems];
    // 阻止默认的粘贴行为
    event.preventDefault();
  };



    // 返回需要在模板中使用的变量和方法
    return {
      file,
      fileInput,
      uploadFile,
      openFileInput,
      onFileChange,
      onDrop,
      isUploading,
      uploadProgress,
      isProcessing,
      showFileDetails,
      fileSize,
      progressColor,
      strList,
      strThresh,
      valueMark,
      handlePaste,
      initLottie,
      handleSubmit: (event) => handleSubmit(event, async () => {
    if (!file.value) return;
    console.log('当前 strList 值:', strList.value); // 调试日志
    
    try {
      // 上传前设置状态
      showFileDetails.value = false;
      isLottieVisible.value = false;
      
      await uploadFile(file.value);
      
      // 上传成功后重置
      file.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
        fileInput.value.dispatchEvent(new Event('change'));
      }
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      // 无论成功失败都恢复状态
      showFileDetails.value = true;
      isLottieVisible.value = true;
      uploadProgress.value = 0;
    }
  })
    };
  },
};
</script>