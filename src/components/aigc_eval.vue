<template>
  <div class="container">
    <div class="function-module">
      <div class="function-head">
        <img src="../assets/style/tool-title/2-1.png">
        <p>文生图评分</p>
      </div>

      <div class="function-middle">

        <!-- 左侧上传及处理区域 -->
        <div class="function-middle-left">
          <div class="function-middle-title">
            <img src="../assets/style/upload.png">
            <p>上传&处理文件</p>
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
            />
            <!-- 显示已选择的文件名 -->
            <p v-if="file && showFileDetails">
              已选择文件：{{ file.name }}
              &nbsp;
              <button @click="openFileInput">重新选择</button>
            </p>
            <p v-else-if="showFileDetails">
              将文件拖到这里，或者
              <button @click="openFileInput">点击上传</button>
            </p>

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

        </div>

<!-- 右侧操作提交区域 -->
<div class="function-middle-right">
  <!-- 上传按钮，点击后打开文件选择对话框 -->
  <div class="upload-btn" v-if="!txtContent">
    <form ref="uploadForm" @submit="handleSubmit($event)">
      <p v-if="message">{{ message }}</p>
      <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>

      <button type="submit" class="submit-button" :disabled="isUploading || isProcessing">提&nbsp;&nbsp;交</button>
    </form>
  </div>

  <!-- 显示txt内容和提供下载选项 -->
  <div class="upload-txt" v-else>
    <div class="close-x">
      <button @click="closeTxtContent" class="close-btn-x">&times;</button>
    </div>
    <div class="txt-content">
      <pre>{{ txtContent }}</pre>
    </div>

    <div class="txt-close">
      <button @click="downloadTxt" class="download-btn">下载</button>
      <button @click="closeTxtContent" class="close-btn">关闭</button>
    </div>

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
      <p>功能: 结合提示词对图片进行匹配度评分</p>
      <p>使用说明: 点击上传选择包含图片的zip格式压缩包文件<a>(上传的压缩包内包含同名的文件夹,文件夹名不能有中文)</a>,文件夹内含以英文提示词命名的文件夹<a>(提示词若包含空格应以“_”代替,例:mountain_range)</a>,提示词文件夹内为图片，选择文件后点击提交即可<a>(文件大小不能超过5G)</a></p>
      </div>
      <div class="img-tool">
        <img alt="Vue logo" src="./tool-explain/tool5.jpg" width="900px" height="auto" class="image">
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { saveAs } from 'file-saver'; // 保存文件的库

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
    // 错误消息
    const errorMessage = ref('');
    // 标记文件是否正在处理
    const isProcessing = ref(false);
    // 控制文件详情的显示
    const showFileDetails = ref(true);
    // 存储txt内容
    const txtContent = ref('');

    // 打开文件选择器的方法
    const openFileInput = () => {
      if (fileInput.value) {
        // 触发文件输入框的点击事件，打开文件选择对话框
        fileInput.value.click();
      }
    };

    const handleSubmit = (event) => {
      event.preventDefault(); // 阻止表单的默认提交行为

      // 检查文件是否为空
      if (!file.value) {
        errorMessage.value = '请选择一个文件进行上传！';
        return;
      }

      // 调用 uploadFile 方法进行文件上传
      uploadFile();
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

    // 开始上传文件
    const uploadFile = async () => {
      if (!file.value) return; // 如果没有文件则不执行

      isUploading.value = true; // 设置为正在上传状态
      uploadProgress.value = 0; // 重置上传进度
      isProcessing.value = false; // 确保在上传开始前关闭处理状态
      message.value = ''; // 清除任何旧的消息
      errorMessage.value = ''; // 清除任何旧的错误消息
      showFileDetails.value = false; // 隐藏文件详情

      try {
        // 创建表单数据对象并添加文件
        const formData = new FormData();
        formData.append("file", file.value);

        // 发送POST请求上传文件
        const response = await axios.post("/api/aigc_eval", formData, {
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
          responseType: 'text'  // 确保响应内容作为txt!!!
        });

        // 获取txt内容
        txtContent.value = response.data.trim();

        // 显示文件处理成功的消息
        message.value = '文件处理成功.';

        // 清空信息
        setTimeout(() => {
          message.value = '';
        }, 5000); // 设置多少时间后清空消息，5000ms
      } catch (error) {
        // 捕获并处理上传错误
        console.error("文件处理失败:", error);
        errorMessage.value = '文件处理失败！';
        // 清空进度条
        isUploading.value = false;
        uploadProgress.value = 0;

        // 提示用户可以再次上传
        setTimeout(() => {
          if (!message.value) {
            message.value = '您可以尝试再次上传';
          }
        }, 2000);
      } finally {
        isProcessing.value = false; // 关闭处理状态
        file.value = null; // 清除已选择的文件
        if (fileInput.value) {
          fileInput.value.value = ''; // 重置文件输入框
        }
        showFileDetails.value = true; // 显示文件详情
      }
    };

    // 下载txt文件的方法
    const downloadTxt = () => {
      const blob = new Blob([txtContent.value], { type: 'text/plain' });
      const randomFileName = Math.random().toString(36).substring(2, 15) + '.txt';
      saveAs(blob, randomFileName);
    };

    // 关闭txt内容区域的方法
    const closeTxtContent = () => {
      txtContent.value = '';
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
      message,
      errorMessage,
      isProcessing,
      showFileDetails,
      handleSubmit,
      txtContent,
      downloadTxt,
      closeTxtContent
    };
  },
};
</script>