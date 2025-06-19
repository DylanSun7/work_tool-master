<template>
  <div class="container">
    <div class="function-module">
      <div class="function-head">
        <img src="../assets/style/tool-title/1-3.png">
        <p>视频抽帧</p>
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
              <p class="processing-message">文件正在处理中 。 。 。 </p>
            </div>
          </div>
        </div>

        <!-- 右侧操作提交区域 -->
        <div class="function-middle-right">
          <!-- 上传按钮，点击后打开文件选择对话框 -->
          <div class="upload-btn">
            <form ref="uploadForm" @submit.prevent="handleSubmit">
              <!-- 抽帧帧率 -->
              
                <div class="input-container" v-show="showFps">
                  <label for="fps" class="floating-label">抽帧帧率(即几秒一帧):</label>
                  <input 
                    type="number" 
                    id="fps" 
                    v-model.number="fps" 
                    class="custom-input" 
                    placeholder="请输入帧率(例如:1)" 
                    required 
                    min="1"
                    @input="validateFps"
                    @keydown="handleKeyDown"
                    @paste.prevent="handlePaste"
                  >
                  <button class="increment-btn" @click="incrementFps" type="button">+</button>
                  <button class="decrement-btn" @click="decrementFps" type="button">-</button>
                </div>

                <div class="input-container-hidden" v-show="allFps" >
                  <label  class="floating-label">哥们棒棒哒~</label>
                  <button class="increment-btn" @click="incrementFps" type="button">+</button>
                  <button class="decrement-btn" @click="decrementFps" type="button">-</button>
                </div>
              

              <!-- 选择保存图片格式 -->
              
                <div class="select-container">
                  <select name="fileExt" id="fileExt" v-model="fileExt" class="custom-select" required>
                    <option value="" disabled selected>图片保存的格式</option>
                    <option value=".jpg">.jpg</option>
                    <option value=".png">.png</option>
                  </select>
                </div>
              <!-- 提交按钮 -->
               <a>视频是否全部抽帧：</a>
              <el-switch
                v-model="allFps"
                inline-prompt
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;margin-right: 10vh; "
                active-text="是"
                inactive-text="否"
              />
              <button type="submit" class="submit-button" :disabled="isUploading || isProcessing">提&nbsp;&nbsp;交</button>
              
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
        <p>功能：将视频转为图片</p>
        <p>使用说明：点击上传选择包含视频的zip格式压缩包文件(同一个压缩包中允许包含多条视频)，进行视频抽帧;选择帧率和图片格式,点击提交即可。</p>
        <ul>
          <li class="txt-content-li-out">注意：
            <ul class="txt-content-li">
              <li>上传的压缩包内包含同名的文件夹；</li>
              <li>压缩包名只能为字母、数字、“_”和“-”的任意组合；</li>
              <li>文件大小不能超过5G。</li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="img-tool">
        <p>使用流程：</p>
        <img alt="Vue logo" src="./tool-explain/tool3.jpg" width="900px" height="auto" class="image">
      </div>
    </div>
  </div>
</template>

<script>
import { ref,computed,watch } from "vue";
import { useSelect_Check } from "@/select_check";
import  useUpload  from "@/upload";
import { API_CONFIG } from '@/config/api';


export default {
  mounted() {
    this.initLottie('upload');
  },
  setup() {

    // 初始化 fps 和 fileExt
    const fps = ref(1); // 初始值为1
    const fileExt = ref('');
    const isFocused = ref(false);
    const allFps = ref(false);
    


    const { url: uploadUrl, field: fieldName } = API_CONFIG.cutVideo;

    const extraFields = () =>({
      fps: parseInt(fps.value).toString(), // 确保 fps 是字符串
      fileExt: fileExt.value,
      allFps: allFps.value,
    })

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

    const showFps = computed(() => {
  // showFps 的值为 allFps.value 的布尔取反
  return !allFps.value;
});

watch(allFps, (newVal) => {
    if (newVal) {
      fps.value = 1; // 当 allFps 为 true 时强制设为默认值 1
    }
  });




    

    const handlePaste = (e) => {
  e.preventDefault(); // 始终阻止默认粘贴行为
  const pasteText = e.clipboardData.getData('text');
  
  // 提取纯数字内容（移除所有非数字字符）
  const numbersOnly = pasteText.replace(/[^0-9]/g, '');
  
  // 仅当包含有效数字时更新值
  if (numbersOnly) {
    fps.value = Math.max(1, parseInt(numbersOnly, 10)); // 确保最小值为1
  }
};
    const handleKeyDown = (e) => {
    const forbiddenKeys = ['e', 'E', '+', '-'];
    if (forbiddenKeys.includes(e.key)) {
    e.preventDefault();
      }
    };

// 验证fps输入，确保其为正整数且不含小数点
const validateFps = (event) => {
  // 使用正则表达式移除所有非数字字符
  let value = event.target.value.replace(/[^0-9]/g, '');

  // 检查处理后的值是否为空或小于1
  if (value === '' || Number(value) < 1) {
    // 如果值为空或小于1，保持当前值不变
    value = fps.value;
  }

  fps.value = value;
};
    // 增加数值
    const incrementFps = () => {
      if (fps.value == null || isNaN(+fps.value)) {
        fps.value = 1;
      } else {
        fps.value = Math.max(1, parseInt(fps.value, 10) + 1);
      }
    };

    // 减少数值
    const decrementFps = () => {
      if (fps.value == null || isNaN(+fps.value)) {
        fps.value = 1;
      } else {
        fps.value = Math.max(1, parseInt(fps.value, 10) - 1);
      }
    };

    const handleFocus = () => {
      isFocused.value = true;
    };

    const handleBlur = () => {
      isFocused.value = fps.value !== null && fps.value !== '';
    };

    // 返回需要在模板中使用的变量和方法
    return {
      file,
      fileInput,
      openFileInput,
      onFileChange,
      onDrop,
      isUploading,
      uploadProgress,
      fps,
      allFps,
      showFps,
      fileExt,
      incrementFps,
      decrementFps,
      uploadFile,
      isProcessing,
      handleFocus,
      handleBlur, 
      isFocused,
      showFileDetails,
      fileSize,
      validateFps,
      progressColor,
      handleKeyDown,
      handlePaste,
      initLottie,
        handleSubmit: (event) => handleSubmit(event, async () => {
      if (!file.value) return;
      console.log('当前 fps 值:', fps.value); // 调试日志
      console.log('当前 设置图片格式 值:', fileExt.value);
      console.log('当前 allFps 值:', allFps.value);
      
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