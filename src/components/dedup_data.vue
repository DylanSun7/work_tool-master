<template>
  <div class="container">
      <div class="function-module">
      <h1>图片去重</h1>
      <p>功能: 剔除相似度高的图片</p>
      <p>使用说明: 点击上传选择包含图片的zip格式压缩包文件<a>(文件夹名不能有中文)</a>,选择相似度阈值<a>(1~9)</a>,点击提交即可<a>(文件大小不能超过5G)</a></p>
      <p>&nbsp;</p>
      </div>
  <div class="middle-window">
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
    <p v-if="file">已选择文件：{{ file.name }} &nbsp;<button @click="openFileInput">重新选择</button></p>
    <p v-else>将文件拖到这里，或者<button @click="openFileInput">点击上传</button></p>

    <!-- 进度条和上传进度文本，当有文件正在上传时显示 -->
    <div v-if="isUploading" class="upload-status">
      <div class="upload-status-out">
          <div class="upload-status-in"><p>上传进度：</p></div>
          <div class="upload-status-in"><progress :value="uploadProgress" max="100"></progress></div>
          <div class="upload-status-in"><p>{{ uploadProgress }}%</p></div>
        </div>
            <div>
              <!-- 显示已选择的文件名 -->
                 <p v-if="file">{{ file.name }}</p>
            </div>
      </div>

        <!-- 处理中的加载图片，覆盖进度条 -->
        <div v-if="isProcessing" class="processing-status">
          <img src="./tool-img/load.gif" alt="处理中" class="loading-image" />
          <p class="processing-message">文件正在处理中。。。</p>
        </div>
    </div>
  <!-- 上传按钮，点击后打开文件选择对话框 -->
  <div class="upload-btn">
    <form ref="uploadForm" @submit="handleSubmit($event)">

        <!-- 测试集比例 -->
  <li>
    <div class="input-container">
      <label for="simThresh" class="floating-label">输入相似度阈值：</label>
      <input 
        type="number" 
        id="simThresh" 
        v-model="simThresh" 
        min="1" max="11" step="1"
        class="custom-input" 
        placeholder="请输入1~10" 
        required
      >
      <button class="increment-btn" @click="increment" type="button">+</button>
      <button class="decrement-btn" @click="decrement" type="button">-</button>
    </div>
  </li>
    <li>
      <p v-if="message">{{ message }}</p><p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    </li>
    
    <li>
      <button type="submit" :disabled="!file" class="submit-button">提&nbsp;&nbsp;交</button>
    </li>
  </form>


   
  </div>
  
  </div>
  <div class="img-tool">
    <div>&nbsp;使用示意图：</div>
    <img alt="Vue logo" src="./tool-explain/tool4.jpg" width="900px" height="auto" class="image">
  </div>
  
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
    //errorMessage
    const errorMessage = ref('');
    // 默认阈值
    const simThresh = ref(1);
    // 标记文件是否正在处理
    const isProcessing = ref(false);

    const uploadForm = ref(null); // 引用整个表单元素

// 增加数值
const increment = () => {
  let numericValue = Number(simThresh.value);
  if (isNaN(numericValue)) {
    numericValue = 1; // 设置一个合理的默认值
  }
  if (numericValue < 10) { // 设最大值为0.9
    simThresh.value = parseFloat((numericValue + 1).toFixed(1)); // 确保保留一位小数
  }
};

// 减少数值
const decrement = () => {
  let numericValue = Number(simThresh.value);
  if (isNaN(numericValue)) {
    numericValue = 10; // 设置一个合理的默认值
  }
  if (numericValue > 1) { // 设最小值为0.1
    simThresh.value = parseFloat((numericValue - 1).toFixed(1)); // 确保保留一位小数
  }
};
    const handleFocus = () => {
      isFocused.value = true;
    };

    const handleBlur = () => {
      isFocused.value = simThresh.value !== null && simThresh.value !== '';
    };
    // 打开文件选择器的方法
    const openFileInput = () => {
      if (fileInput.value) {
        // 触发文件输入框的点击事件，打开文件选择对话框
        fileInput.value.click();
      }
    };
    const isFocused = ref(false);

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
    const handleSubmit = (event) => {
  event.preventDefault(); // 阻止表单的默认提交行为

  // 检查表单是否有效
  const form = uploadForm.value;
  if (form && !form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // 表单有效，可以继续执行上传逻辑
  console.log('simThresh:', simThresh.value);

  // 调用 uploadFile 方法进行文件上传
  uploadFile();
};

    // 开始上传文件
    const uploadFile = async () => {
      isUploading.value = true; // 设置为正在上传状态
      uploadProgress.value = 0; // 重置上传进度
      isProcessing.value = false; // 确保在上传开始前关闭处理状态
      message.value = ''; // 清除任何旧的消息
      errorMessage.value = '';// 清除任何旧的错误消息

      try {
        // 创建表单数据对象并添加文件
        const formData = new FormData();
        formData.append('file', file.value);
        formData.append('simThresh', simThresh.value);

        // 发送POST请求上传文件
        const response = await axios.post("/api/dedup_data", formData, {
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

              // 当上传进度达到100%，设置为正在处理状态，并隐藏进度条
              if (percentComplete >= 100) {
                isUploading.value = false;
                isProcessing.value = true;
              }
            }
          },
          responseType: 'blob'  // 确保响应内容作为二进制数据处理
        });

        // 获取后端文件名
        const fileName = response.headers['content-disposition'].substring(response.headers['content-disposition'].indexOf('=') + 1).replace(/"/g, '');

        // 使用 FileSaver.js 直接保存文件
        saveAs(response.data, decodeURIComponent(fileName));

        // 显示文件处理成功的消息
        message.value = '文件处理成功.';
        //清空信息
        setTimeout(() => {
        message.value = '';
       }, 5000); // 设置多少时间后清空消息，5000ms
      } catch (error) {
        // 捕获并处理上传错误
        console.error("文件处理失败:", error);
        errorMessage.value = '文件处理失败';
        // 清空进度条
        isUploading.value = false;
        uploadProgress.value = 0;

        // 提示用户可以再次上传
        setTimeout(() => {
          if (!errorMessage.value) {
            errorMessage.value = '您可以尝试再次上传';
          }
        }, 4000);
      } finally {
        isProcessing.value = false; // 关闭处理状态
        file.value = null; // 清除已选择的文件
        if (fileInput.value) {
          fileInput.value.value = ''; // 重置文件输入框
        }

        // 提示用户可以再次上传
        setTimeout(() => {
          if (!message.value) {
            message.value = '您可以尝试再次上传。';
          }
        }, 2000); // 等待1秒后再显示提示，给用户一点时间阅读之前的成功或错误消息
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
      handleSubmit,
      uploadForm,
      simThresh,
      isProcessing,
      increment,
      decrement,
      errorMessage,
      handleFocus,
      handleBlur,
      isFocused
    };
  },
};
</script>