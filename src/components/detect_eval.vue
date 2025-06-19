<template>
    <div class="container">
      <div class="function-module">
        <div class="function-head">
          <img src="../assets/style/tool-title/2-3.png">
          <p>目标检测模型评价</p>
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
                
                  <div class="select-container">
                    <a>检测框交并比:&emsp;</a>
                    <el-input-number
                        v-model="iouThresh"
                        :precision="1"
                        :min="0.5"
                        :max="0.9"
                        :step="0.1"
                        size="large"
                        controls-position="right"
                    />

                  </div>
                
  
                <!-- 选择保存图片格式 -->
                
                  <div class="select-container">
                    <a>模型检测阈值:&emsp;</a>
                    <el-input-number
                        v-model="confThresh"
                        :precision="1"
                        :min="0.1"
                        :max="1"
                        :step="0.1"
                        size="large"
                        controls-position="right"
                    />
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
          <p>功能：测试目标检测模型的识别性能</p>
          <p>使用说明：点击上传需要检测的zip格式压缩包文件，选择框交并比和检测阈值，点击提交即可。</p>
          <ul>
            <li class="txt-content-li-out">注意：
              <ul class="txt-content-li">
                <li>上传的压缩包内包含同名的文件夹；</li>
                <li>压缩包名只能为字母、数字、“_”和“-”的任意组合；</li>
                <li>压缩包内包含gt.txt、det.txt、class.txt文件</li>
                <li>文件示例：<br>
                  <br>gt.txt：<br>&emsp;图片名&emsp;标签id&emsp;x_min&emsp;y_min&emsp;x_max&emsp;y_max<br>
                  <br>det.txt：<br>&emsp;图片名&emsp;标签id&emsp;置信度&emsp;x_min&emsp;y_min&emsp;x_max&emsp;y_max<br>
                  <br>class.txt：<br>&emsp;标签名
                </li>
                
              </ul>
            </li>
          </ul>
        </div>
        <div class="img-tool">
          <p>使用流程：</p>
          <img alt="Vue logo" src="./tool-explain/tool11.jpg" width="900px" height="auto" class="image">
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  import { useSelect_Check } from "@/select_check";
  import  useUpload  from "@/upload";
  import { API_CONFIG } from '@/config/api';
  
  
  export default {
    mounted() {
      this.initLottie('upload');
    },
    setup() {
  
      // 初始化
      const iouThresh = ref(0.5);
      const confThresh = ref(0.8);
      
  
  
      const { url: uploadUrl, field: fieldName } = API_CONFIG.detectEval; //api
      console.log('上传 URL:', uploadUrl);
      console.log('字段名:', fieldName);
  
      const extraFields = () =>({
        iouThresh: iouThresh.value, // 确保 fps 是字符串
        confThresh: confThresh.value,
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
      uploadFile,
      openFileInput,
      onFileChange,
      onDrop,
      initLottie,
      isUploading,
      uploadProgress,
      isProcessing,
      showFileDetails,
      fileSize,
      progressColor,
      confThresh,
      iouThresh,
          handleSubmit: (event) => handleSubmit(event, async () => {
        if (!file.value) return;

         // 设置默认值
  if (iouThresh.value === null) {
    iouThresh.value = 0.5;
  }
  if (confThresh.value === null) {
    confThresh.value = 0.8;
  }
          console.log('当前文件:', file.value.name);
        console.log('当前 IOU 值:', iouThresh.value); // 调试日志
        console.log('当前 阈 值:', confThresh.value);
        
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