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
          <div class="upload-btn" v-if="!txtContent">
            <form ref="uploadForm" @submit.prevent="handleSubmit">

              <button type="submit" class="submit-button" :disabled="isUploading || isProcessing">提&nbsp;&nbsp;交</button>
            </form>
          </div>

          <!-- 显示txt内容和提供下载选项 -->
          <div class="upload-txt" v-else>
            <div class="close-x">
              <button @click="closeTxtContent" class="close-btn-x">&times;</button>
            </div>
            <div class="txt-content">
              <table v-if="tableData.length" >
                <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                </tr>
              </table>

              <!-- <pre>{{ txtContent }}</pre> -->
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
        <p>功能：结合提示词对图片进行匹配度评分</p>
        <p>使用说明：点击上传选择包含图片的zip格式压缩包文件,文件夹内含以英文提示词命名的文件夹<a>(提示词若包含空格应以“_”代替,例:mountain_range)</a>,提示词文件夹内为图片，选择文件后点击提交即可</p>
        <ul>
          <li class="txt-content-li-out">注意：
            <ul class="txt-content-li">
              <li>上传的压缩包内包含同名的文件夹；</li>
              <li>压缩包名只能为字母、数字、“_”和“-”的任意组合；</li>
              <li>文件大小不能超过5G；</li>
              <li>图片分辨率不能超过4K；</li>
              <li>上传的图片仅支持'.jpg', '.png', '.jpeg', '.bmp'。</li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="img-tool">
        <p>使用流程：</p>
        <img alt="Vue logo" src="./tool-explain/tool5.jpg" width="900px" height="auto" class="image">
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import lottie from 'lottie-web';
import animationData from '../assets/style/upload.json';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSelect_Check } from "@/select_check";

export default {
  mounted() {
    lottie.loadAnimation({
      container: document.getElementById('upload'), // 当前元素的ID
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationData, // JSON数据
    });
  },
  setup() {

    const isUploading = ref(false);
    const uploadProgress = ref(0);
    const isProcessing = ref(false);

    //设置进度条颜色渐变
    const progressColor = [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 },
      ]

    const {
      file,
      showFileDetails,
      isLottieVisible,
      fileInput,
      handleSubmit,
      fileSize,
      openFileInput,
      onFileChange,
      onDrop,
         
    } = useSelect_Check();
    // 存储txt内容
    const txtContent = ref('');
    // 存储文件名
    const fileName = ref('default.txt');

    // 解析txtContent的方法
const parseTxtContentToTable = (txtContent) => {
  // 假设每一行代表表格的一行，每一行中的每个元素代表表格的一个单元格
  const rows = txtContent.trim().split('\n');
  return rows.map(row => row.split('\t').map(cell => cell.trim()));
};

// 添加一个响应式变量来存储解析后的表格数据
const tableData = ref([]);

   
    // 开始上传文件
    const uploadFile = async () => {
      if (!file.value) return; // 如果没有文件则不执行

      isUploading.value = true; // 设置为正在上传状态
      uploadProgress.value = 0; // 重置上传进度
      isProcessing.value = false; // 确保在上传开始前关闭处理状态
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
          responseType: 'text',  // 确保响应内容作为txt!!!
        });

        // 从响应头中获取文件名
        const contentDisposition = response.headers['content-disposition'];
        fileName.value = 'default.txt'; // 默认文件名
        if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
          const fileNameMatch = contentDisposition.match(/filename="?(.+)"?$/i);
          if (fileNameMatch.length > 1) {
            fileName.value = fileNameMatch[1];
          }
        }

        // 获取txt内容
        txtContent.value = response.data.trim();
        // 解析txt内容为表格数据
        tableData.value = parseTxtContentToTable(txtContent.value);

        // 显示文件处理成功的消息
        ElMessage({
          message: '文件处理成功',
          type: 'success',
          duration: 5000,
          showClose: true
        });
      } catch (error) {
  if (error.response) {
    // 检查响应类型是否为 text
    if (error.config.responseType === 'text') {
      // 处理纯文本响应
      const errorMsg = error.response.data || error.response.statusText || '未知错误';

      try {
        // 解析 JSON 字符串
        const jsonObject = JSON.parse(errorMsg);

        // 提取错误信息
        const errorMessage = jsonObject.error;
        const decodedErrorMessage = decodeURIComponent(errorMessage);

        // 显示错误信息
      ElMessageBox.alert(
        decodedErrorMessage,
          {
          title:'错误！',
          type: 'error',
          confirmButtonText: '确认',
          callback: () => {
          ElMessage({
            type: 'warning',
            message: `注意查看使用说明及流程！`,
          });
        },
       })
      } catch  {
        // 如果解析失败，显示原始错误信息
        ElMessageBox({
    message: errorMsg,
    title: '错误',
    type: 'error',
    showCancelButton: true
  });
      }
    } else {
      // 处理 JSON 响应
      const errorMsg = error.response.data?.error 
        || error.response.data?.message 
        || error.response.statusText 
        || '请求处理失败';
      
      // 解码 Unicode 转义字符
      const decodedErrorMsg = decodeURIComponent(errorMsg);

      // 显示错误信息
      ElMessageBox({
        title:'错误！',
        message: decodedErrorMsg,
        type: 'error',
        duration: 0,
        showClose: true
      });
    }

    // 打印详细错误信息以帮助调试
    // console.error('Error response:', error.response);
  } else {
    // 网络错误或服务器无响应
    ElMessageBox({
      title:'错误！',
      message: '网络错误或服务器无响应',
      type: 'error',
      duration: 0,
      showClose: true
    });
  }

    // 清空进度条
    isUploading.value = false;
    uploadProgress.value = 0;
  } finally {
    // 关闭处理状态
    isProcessing.value = false;
    file.value = null; // 清除已选择的文件
    if (fileInput.value) {
      fileInput.value.value = ''; // 重置文件输入框
    }
    showFileDetails.value = true; // 显示文件详情
        isLottieVisible.value = true;// 显示动画
  }
};
    // 下载txt文件的方法
    const downloadTxt = () => {
      const blob = new Blob([txtContent.value], { type: 'text/plain' });
      saveAs(blob, fileName.value);
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
      isProcessing,
      showFileDetails,
      handleSubmit: (event) => handleSubmit(event, uploadFile),
      txtContent,
      downloadTxt,
      closeTxtContent,
      fileSize,
      tableData,
      progressColor
    };
  },
};
</script>