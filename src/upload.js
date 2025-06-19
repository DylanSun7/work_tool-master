import { ref } from 'vue';
import axios from 'axios';
import { saveAs } from 'file-saver';
import {  ElMessageBox, ElMessage } from 'element-plus';

export default function useUpload( uploadUrl,fieldName,extraFields = {} ) {

    

    // 标记文件是否正在处理
    const isProcessing = ref(false);
    // 标记是否正在上传文件
    const isUploading = ref(false);
    // 记录上传进度
    const uploadProgress = ref(0);

    //设置进度条颜色渐变
    const progressColor = [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 },
      ]


    // 开始上传文件
    const uploadFile = async (file) => {
        if (!file) return; // 如果没有文件则不执行
  
        isUploading.value = true; // 设置为正在上传状态
        isProcessing.value = false; // 确保在上传开始前关闭处理状态

  
        try {
          // 创建表单数据对象并添加文件
          const formData = new FormData();
          formData.append(fieldName, file);

          // 动态调用 extraFields 获取最新值
          const dynamicExtraFields = typeof extraFields === 'function' ? extraFields() : extraFields;
                console.log('Dynamic Extra Fields:', dynamicExtraFields); // 调试日志
            for (const [key, value] of Object.entries(dynamicExtraFields)) {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            }
  
          // 发送POST请求上传文件
          const response = await axios.post(uploadUrl, formData, {
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
            responseType: 'blob',  // 确保响应内容作为二进制数据处理
          });
  
          // 获取后端文件名
          const fileName = response.headers['content-disposition'].substring(response.headers['content-disposition'].indexOf('=') + 1).replace(/"/g, '');
  
          // 使用 FileSaver.js 直接保存文件
          saveAs(response.data, decodeURIComponent(fileName));
  
          // 显示文件处理成功的消息
          ElMessage({
            message: '文件处理成功',
            type: 'success',
            duration: 5000,
            showClose: true
          });
  
        } catch (error) {
    if (error.response) {
      // 处理二进制响应类型的情况
      if (error.config.responseType === 'blob') {
        const blobData = error.response.data;
        const reader = new FileReader();
        
        reader.onload = () => {
          try {
          const errorData = JSON.parse(reader.result);
          ElMessageBox.alert(
            errorData.error || errorData.message,
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
            ElMessageBox({
            message: '文件处理失败！',
            title:'错误！',
            type: 'error',
            duration: 0,
            showClose: true
          });
          }
        };
        
        reader.readAsText(blobData);
      } else {
        // 普通JSON响应处理
        const errorMsg = error.response.data?.error 
          || error.response.data?.message 
          || '请求处理失败';
          ElMessageBox({
            message: `Error ${error.response.status}: ${errorMsg}`,
            title:'错误！',
            type: 'error',
            duration: 0,
            showClose: true
          });
      }
    } else {
      ElMessageBox({
            message: '网络错误或服务器无响应',
            title:'错误！',
            type: 'error',
            duration: 0,
            showClose: true
          });
    }
  
          // 清空进度条
          isUploading.value = false;
          uploadProgress.value = 0;
        } finally {
          isProcessing.value = false; // 关闭处理状态
          isUploading.value = false;
          uploadProgress.value = 0;
        }
      };
      return {
        uploadFile,
        uploadProgress,
        isUploading,
        progressColor,
        isProcessing 
      };
}