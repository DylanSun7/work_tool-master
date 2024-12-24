<template>
  <div class="container">
    <h2>数据切分</h2>
      <p style="color:#2981e6;font-size:15px;font-weight:bold;margin:10px;">功能: 划分数据集</p>
      <p style="color:#2981e6;font-size:15px;font-weight:bold;margin:10px;">使用说明: 上传含文件的zip格式压缩包文件, 压缩包内应包含一个文件夹, 上传成功后选择划分的测试集比例, 点击提交即可</p>
    <form @submit.prevent="handleFormSubmit">
      <label for="splitRatio" style="font-size: 13px;">测试集比例:</label>
      <input type="number" id="splitRatio" v-model="splitRatio" min="0.1" max="0.9" step="0.1" class="form-control" style="margin: 20px;">
      <div style="text-align: center;">
        <button type="button" @click="openFileInput" class="submit-button">点击上传</button>
      </div>
      
      
    </form>
    
    <p v-if="message">{{ message }}</p>
  </div>

  <!-- 文件上传区域 -->
  <div class="file-uploader" @drop.prevent="onDrop" @dragover.prevent>
    <!-- 隐藏的文件输入框，用户点击上传按钮时触发 -->
    <input
      type="file"
      @change="onFileChange"
      ref="fileInput"
      style="display: none"
      accept=".zip,.rar,.7z"
      class="file-input" required
    />
    <!-- 显示已选择的文件名 -->
    <p v-if="file">已选择文件：{{ file.name }}</p>
    <p v-else>将文件拖到这里，或者点击上传。</p>

    <!-- 进度条，当有文件正在上传时显示 -->
    <progress :value="uploadProgress" max="100" v-if="isUploading"></progress>
    <p v-if="isUploading">{{ uploadProgress }}%</p>
  </div>
  <div style="text-align: center;">
    <form @submit.prevent="handleFormSubmit">
    <button type="submit" :disabled="!file" class="submit-button">提交</button>
  </form>
  </div>
  
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { saveAs } from 'file-saver'; //保存文件的库

export default {
  setup() {
    // 存储选中的单个文件
    const file = ref(null);
    // 引用文件输入元素
    const fileInput = ref(null);
    // 标记是否正在上传文件
    const isUploading = ref(false);
    // 记录上传进度
    const uploadProgress = ref(0);
    // 消息提示
    const message = ref('');
    // 默认切分比例为0.2
    const splitRatio = ref(0.2);

    // 打开文件选择器的方法
    const openFileInput = () => {
      if (fileInput.value) {
        // 触发文件输入框的点击事件，打开文件选择对话框
        fileInput.value.click();
      }
    };

    // 当文件输入框的值改变时触发，即选择了新文件
    const onFileChange = (event) => {
      // 获取选中的文件
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        // 保存选中的文件到 file 变量中
        file.value = selectedFile;
      }
    };

    // 处理文件拖放事件
    const onDrop = (event) => {
      // 获取拖放的文件
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        // 保存拖放的文件到 file 变量中
        file.value = droppedFile;
      }
    };

    // 提交表单处理
    const handleFormSubmit = async () => {
      if (!file.value || isUploading.value) return; // 如果没有文件或正在上传则不执行

      await uploadFile();
    };

    // 开始上传文件
    const uploadFile = async () => {
      isUploading.value = true; // 设置为正在上传状态
      uploadProgress.value = 0; // 重置上传进度

      try {
        // 创建表单数据对象并添加文件
        const formData = new FormData();
        formData.append('file', file.value);
        formData.append('splitRatio', splitRatio.value)

        // 发送POST请求上传文件
        const response = await axios.post("/api/split_data", formData, {
          headers: {
            "Content-Type": "multipart/form-data", // 设置请求头
          },
          // 监听上传进度
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              // 计算并更新上传进度
              const percentComplete =
                (progressEvent.loaded / progressEvent.total) * 100;
              uploadProgress.value = Math.round(percentComplete);
            }
          },
          responseType: 'blob'  // 确保响应内容作为二进制数据处理
        });

        // 获取后端文件名
        const fileName = response.headers['content-disposition'].substring(response.headers['content-disposition'].indexOf('=') + 1).replace(/"/g, '');

        // 使用 FileSaver.js 直接保存文件
        saveAs(response.data, decodeURIComponent(fileName));

        // 显示下载成功的消息
        message.value = '文件处理完成.';
        
        // 处理服务器响应（如果需要）
        console.log("文件上传成功:", response.data);
      } catch (error) {
        // 捕获并处理上传错误
        console.error("文件上传失败:", error);
        if (error.response && error.response.data) {
          message.value = error.response.data.error || 'An error occurred.';
        } else {
          message.value = '处理文件时发生错误';
        }
      } finally {
        isUploading.value = false; // 上传完成后关闭上传状态
        file.value = null; // 清除已选择的文件
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
      message,  // 用于存储并显示给用户的消息
      handleFormSubmit,
      splitRatio
    };
  },
};
</script>