<template>
  <div class="container">
    <div class="function-module">
      <div class="function-head">
        <img src="../assets/style/tool-title/1-2.png">
        <p>数据切分</p>
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
              <!-- 测试集比例 -->
              <div class="input-container">
                <label for="splitRatio" class="floating-label">测试集比例：</label>
                <input 
                  type="number" 
                  id="splitRatio" 
                  v-model="splitRatio" 
                  min="0.1" 
                  max="0.9" 
                  step="0.1"
                  class="custom-input" 
                  placeholder="请输入0.1~0.9" 
                  @keydown="handleKeyDown"
                  @input="validateSplitRatio"
                  @paste.prevent="handlePaste"
                  required
                >
                <button class="increment-btn" @click="increment" type="button">+</button>
                <button class="decrement-btn" @click="decrement" type="button">-</button>
              </div>

              <!-- 提交按钮 -->
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
        <p>功能：划分数据集</p>
        <p>使用说明：点击上传选择包含图片的zip格式压缩包文件, 选择划分的测试集比例(0.1~0.9), 点击提交即可</p>
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
        <img alt="Vue logo" src="./tool-explain/tool2.jpg" width="900px" height="auto" class="image">
      </div>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue';
  import { useSelect_Check } from "@/select_check";
  import  useUpload  from "@/upload";
  import { API_CONFIG } from '@/config/api';

export default {
  mounted() {
    this.initLottie('upload');
  },
  setup() {

    // 默认切分比例为0.2
    const splitRatio = ref(0.2);

      const { url: uploadUrl, field: fieldName } = API_CONFIG.splitData;

      const extraFields = () =>({
        splitRatio: splitRatio.value,
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

const handlePaste = (e) => {
  e.preventDefault(); // 始终阻止默认粘贴行为
  const pasteText = e.clipboardData.getData('text');
  
  // 提取纯数字内容（移除所有非数字字符）
  const numbersOnly = pasteText.replace(/[^0-9]/g, '');
  
  // 仅当包含有效数字时更新值
  if (numbersOnly) {
    splitRatio.value = Math.max(1, parseInt(numbersOnly, 10)); // 确保最小值为1
  }
};
    const handleKeyDown = (e) => {
    const forbiddenKeys = ['e', 'E', '+', '-'];
    if (forbiddenKeys.includes(e.key)) {
    e.preventDefault();
      }
    };
    // 验证相似度阈值输入
    const validateSplitRatio = () => {
      if (splitRatio.value) {
        const numericValue = parseFloat(splitRatio.value);
        if (isNaN(numericValue) || numericValue < 0.1 || numericValue > 0.9) {
          splitRatio.value = ''; // 清除输入框的值
        } else {
          splitRatio.value = (Math.floor(numericValue * 10) / 10).toFixed(1); // 截断到小数点后一位
        }
      }
    };

    // 增加数值
  const increment = () => {
  let numericValue = parseFloat(splitRatio.value);
  if (isNaN(numericValue)) {
    numericValue = 0.1; // 设置一个合理的默认值
  }

  // 确保增加后不会超过0.9，考虑到浮点数精度问题，使用一个小于0.9的比较值
  if (numericValue < 0.899) { // 使用0.899而非0.9以防止浮点数精度问题
    numericValue += 0.1;
    // 截断到小数点后一位，确保显示正确
    splitRatio.value = (Math.round(numericValue * 10) / 10).toFixed(1);
  } else if (numericValue >= 0.899 && numericValue < 0.9) { // 如果接近但未达0.9，则直接设置为0.9
    splitRatio.value = '0.9';
  }
};

    // 减少数值
    const decrement = () => {
      let numericValue = parseFloat(splitRatio.value);
      if (isNaN(numericValue)) {
        numericValue = 0.9; // 设置一个合理的默认值
      }
      if (numericValue > 0.1) { // 设最小值为0.1
        numericValue = Math.max(numericValue - 0.1, 0.1);
        splitRatio.value = (Math.floor(numericValue * 10) / 10).toFixed(1); // 截断到小数点后一位
      }
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
      uploadFile,
      splitRatio,
      isProcessing,
      increment,
      decrement,
      showFileDetails,
      fileSize,
      validateSplitRatio,
      progressColor,
      handleKeyDown,
      handlePaste,
      initLottie,
        handleSubmit: (event) => handleSubmit(event, async () => {
      if (!file.value) return;
      console.log('当前切分比:', splitRatio.value); // 调试日志
      
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