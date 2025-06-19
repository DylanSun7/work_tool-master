<template>
    <div class="container">
      <div class="function-module">
        <div class="function-head">
          <img src="../assets/style/tool-title/1-5.png">
          <p>图片格式转换</p>
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
                
  
                <!-- 选择保存图片格式 -->
                
                  <div class="select-container">
                    <select name="imgFormat" id="imgFormat" v-model="imgFormat" class="custom-select" required>
                      <option value="" disabled selected>图片保存的格式</option>
                      <option value=".jpg">.jpg</option>
                      <option value=".jpeg">.jpeg</option>
                      <option value=".png">.png</option>
                      <option value=".bmp">.bmp</option>
                      <option value=".webp">.webp</option>
                      <option value=".tif">.tif</option>
                    </select>
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
          <p>功能：将图片转换为指定格式</p>
          <p>使用说明：点击上传选择包含图片的zip格式压缩包文件, 选择文件后点击提交即可</p>
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
          <img alt="Vue logo" src="./tool-explain/tool7.jpg" width="900px" height="auto" class="image">
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

      const imgFormat = ref('');// 图片格式

      const { url: uploadUrl, field: fieldName } = API_CONFIG.convertImage;

      const extraFields = () =>({
      imgFormat: imgFormat.value,
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
  
      // 返回需要在模板中使用的变量和方法
      return {
        file,
        fileInput,
        openFileInput,
        onFileChange,
        onDrop,
        isUploading,
        uploadProgress, 
        imgFormat,
        uploadFile,
        isProcessing,
        showFileDetails,
        fileSize,
        progressColor,
        initLottie,
        handleSubmit: (event) => handleSubmit(event, async () => {
      if (!file.value) return;
      console.log('当前 imgFormat 值:', imgFormat.value); // 调试日志
      
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