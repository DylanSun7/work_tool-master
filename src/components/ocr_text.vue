<template>
  <div class="container">
    <div class="function-module">
      <div class="function-head">
        <img src="../assets/style/tool-title/2-5.png">
        <p>OCR文本提取</p>
      </div>

      <div class="function-middle">
        <!-- 左侧上传及处理区域 -->
        <div class="function-middle-left">
          <!-- 文件上传区域 -->
          <div class="el-uploader" style="" @dragover.prevent>
            <div class="upload-space" v-show="showFileDetails">
              <el-upload
                ref="uploadDragRef"
                drag
                multiple
                v-model:file-list="images"
                :auto-upload="false"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                :on-change="handleChange" 
                :on-exceed="handleExceed"
                :before-upload="async (file) => {
                    const isValid = await validateFile(file);
                    if (!isValid) {
                      ElMessage.error(`文件【${file.name}】格式验证失败`);
                     return false;
                    }
                    return true;
                  }"
                list-type="picture"
                :limit="5"
                style="position: relative;"
                class="upload-drag"
              >
                <div id="upload" style="height: 14.5vh;" v-show="showFileDetails && isLottieVisible"></div>
                <em style="font-size: 15px;">将图片拖拽到此区域或单击选择图片上传</em>
              </el-upload>
                <el-upload
                  ref="uploadCardRef"
                  v-model:file-list="images"
                  :auto-upload="false"
                  list-type="picture-card"
                  :on-preview="handlePictureCardPreview"
                  :on-remove="handleRemove"
                  :on-change="handleChange" 
                  :limit="5"
                  :on-exceed="handleExceed"
                  :before-upload="async (file) => {
                    const isValid = await validateFile(file);
                    if (!isValid) {
                      ElMessage.error(`文件【${file.name}】格式验证失败`);
                     return false;
                    }
                    return true;
                  }"
                  class="custom-upload"
                  multiple
                  >
                    <el-icon><Plus /></el-icon>
                </el-upload>

                <el-dialog v-model="dialogVisible" >
                    <img 
                      v-if="dialogImageUrl"
                      :style="{ width: '100%', height: 'auto' }" 
                      :src="dialogImageUrl" 
                      alt="Preview Image" 
                    />
                </el-dialog>
              
           
            </div>
          

            <!-- 进度条和上传进度文本，当有文件正在上传时显示 -->
            <div v-if="isUploading" class="upload-status">
              <div class="upload-status-out">
                <!-- 显示已选择的文件名 -->
                <!-- <div v-for="(file, index) in images" :key="index">
                  {{ file.name }}
                </div> -->
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
              <p class="processing-message">图片识别中 。 。 。 </p>
            </div>
          </div>

        </div>

        <!-- 右侧操作提交区域 -->
<div class="function-middle-right">
  <div class="upload-btn">
    <form ref="uploadForm">
      <div class="upload-message">
        <p v-if="message">{{ message }}</p>
        <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
      </div>
      
      <!-- 原始提交按钮 -->
      <button 
        v-if="!showActions"
        type="submit" 
        class="submit-button" 
        :disabled="isUploading || isProcessing || images.length === 0"
        @click.prevent="handleSubmit"
      >开始识别</button>

      <!-- 处理后的操作按钮组 -->
      <div v-if="showActions" class="action-buttons">
    <el-button type="primary" @click="openPdfPreview">查看识别结果</el-button>
    <div class="ocr-download">
      <el-button @click="resetUpload">关闭</el-button>
    </div>
    
  </div>
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
        <p>功能：提取图片中的文本</p>
        <p>使用说明：选择上传图片, 点击开始识别即可。</p>

        <ul>
          <li class="txt-content-li-out">注意：
            <ul class="txt-content-li">
              <li>最多只能上传5张图片；</li>
              <li>图片名只能为字母、数字、“_”和“-”；</li>
              <li>上传的图片仅支持'.jpg', '.png', '.jpeg', '.bmp'；</li>
              <li>仅支持上传图片文件，不支持压缩包。</li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="img-tool">
        <p>使用流程：</p>
        <img alt="Vue logo" src="./tool-explain/tool10.jpg" width="900px" height="auto" class="image">
      </div>
    </div>

  </div>
</template>

<script>
import { ref , onBeforeUnmount  } from "vue";
import axios from "axios";
import lottie from 'lottie-web';
import animationData from '../assets/style/upload.json';
import { ElMessageBox, ElMessage, ElIcon } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';


export default {
components: {
  ElIcon,
  Plus,
},
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
  const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.bmp']; // 支持的图片格式
  const IMAGE_SIGNATURES = {
  '.png': ['89504E47','FFD8FFDB', 'FFD8FFE0', 'FFD8FFE1','FFD8FFDB', 'FFD8FFE0', 'FFD8FFE1','89504E47','424D'],       // PNG: 89 50 4E 47
  '.jpg': ['89504E47','FFD8FFDB', 'FFD8FFE0', 'FFD8FFE1','FFD8FFDB', 'FFD8FFE0', 'FFD8FFE1','89504E47','424D'], // JPEG variants
  '.jpeg': ['89504E47','FFD8FFDB', 'FFD8FFE0', 'FFD8FFE1','FFD8FFDB', 'FFD8FFE0', 'FFD8FFE1','89504E47','424D'],
  '.bmp': ['89504E47','FFD8FFDB', 'FFD8FFE0', 'FFD8FFE1','FFD8FFDB', 'FFD8FFE0', 'FFD8FFE1','89504E47','424D']            // BMP: 42 4D
};

  // 引用文件输入元素
  const fileInput = ref(null);
  const uploadRef = ref(null); // 引用 el-upload 组件实例
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
  // 控制文件详情的显示cv
  const showFileDetails = ref(true);
  const isLottieVisible = ref(true); // 默认显示 Lottie 动画

  const dialogImageUrl = ref('');
  const dialogVisible = ref(false);
  const disabled = ref(false); // 定义 disabled 变量

  // 定义 images 为响应式变量
  const images = ref([]);

  // PDF 相关变量
  const pdfUrl = ref('');

  // PDF 相关变量
const showActions = ref(false); // 新增操作按钮显示状态
const pdfBlob = ref(null);

const dbName = 'PDFCache';
const storeName = 'pdfs';
const dbVersion = 1;
const uploadDragRef = ref(null); // 拖拽上传组件的引用
const uploadCardRef = ref(null); // 卡片式上传组件的引用

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};


const beforeUpload = (file) => {
  // 统一验证逻辑
  const isValid = validateFile(file);
  return isValid ? true : ElMessage.warning('文件验证失败');
}

// 文件名校验提示
const validateFile = async (file) => {
  const rawFile = file.raw || file;
  const fileName = rawFile.name;
  
  // 扩展名验证
  const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
  if (!extMatch) {
    ElMessage.error(`文件缺少扩展名: ${fileName}`);
    return false;
  }
  
  const ext = `.${extMatch[1].toLowerCase()}`;
  if (!SUPPORTED_FORMATS.includes(ext)) {
    ElMessage.error(`不支持的文件格式: ${ext}`);
    return false;
  }

  // 文件名主体验证
  const filename = fileName.slice(0, -ext.length);
  if (!/^[\w-]+$/.test(filename)) {
    ElMessage.error(`文件名只能包含字母、数字、下划线和连字符: ${filename}`);
    return false;
  }

  // 文件头验证
  return await checkImageHeader(rawFile, ext);
};

// 文件头校验
const checkImageHeader = (file, ext) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const blob = file.slice(0, 4);
    
    reader.onloadend = () => {
      try {
        const buffer = new Uint8Array(reader.result);
        const hexHeader = Array.from(buffer)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase();

        console.log(`[文件头校验] ${file.name}: ${hexHeader}`); // 新增调试日志
        const valid = IMAGE_SIGNATURES[ext].some(sig => 
          hexHeader.startsWith(sig)
        );
        
        resolve(valid);
      } catch (e) {
        resolve(false);
      }
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(blob);
  });
};


// 在setup()中添加
const addPDFToCache = async (pdfBlob) => {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    // 使用时间戳作为唯一ID
    const id = Date.now();
    store.put({ id, pdfBlob, timestamp: new Date() });
    
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(id);
    });
  } catch (error) {
    console.error('IndexedDB存储失败:', error);
    ElMessage.error('缓存保存失败');
  }
};

const getPDFFromCache = async (id) => {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result?.pdfBlob);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('IndexedDB读取失败:', error);
    return null;
  }
};
const openPdfPreview = async () => {
  try {
    let blob = pdfBlob.value;
    
    if (!blob) {
      const latestId = await getLatestCacheId();
      blob = await getPDFFromCache(latestId);
    }

    if (blob) {
      // 读取前5个字节验证（标准PDF文件头为%PDF-）
      const headerArrayBuffer = await blob.slice(0, 5).arrayBuffer();
      const header = new Uint8Array(headerArrayBuffer);
      const headerString = String.fromCharCode(...header);
      
      console.log('PDF文件头:', headerString); // 调试日志
      
      if (!headerString.startsWith('%PDF-')) {
        ElMessage.error(`无效的PDF文件头: ${headerString}`);
        return;
      }

      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      // 处理弹窗被拦截的情况
      if (!newWindow || newWindow.closed) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `ocr_result_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        newWindow.location.href = url;
        // 添加卸载监听
        newWindow.onbeforeunload = () => {
          URL.revokeObjectURL(url);
        };
      }
    } else {
      ElMessage.warning('未找到可用的PDF文件');
    }
  } catch (error) {
    console.error('预览失败:', error);
    ElMessage.error('PDF预览失败：' + error.message);
  }
  showActions.value = false;
  images.value = [];
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
  }
  pdfBlob.value = null;
  pdfUrl.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  URL.revokeObjectURL(pdfUrl.value);
};


// 获取最新缓存ID
const getLatestCacheId = async () => {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  
  return new Promise((resolve) => {
    const request = store.openCursor(null, 'prev');
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      resolve(cursor?.value.id || null);
    };
  });
};


// 重置上传状态
const resetUpload = async () => {
  showActions.value = false;
  images.value = [];
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
  }
  pdfBlob.value = null;
  pdfUrl.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  // 清理所有缓存
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.clear();
};
  
const handleRemove = (file) => {
  // 根据当前活动组件获取对应的upload实例
  const currentUploadRef = showFileDetails.value ? uploadDragRef.value : uploadCardRef.value;
  
  if (!currentUploadRef) {
    console.error('Upload component reference is null');
    return;
  }

  // 直接操作响应式数组，保持数据同步
  images.value = images.value.filter(f => f.uid !== file.uid);
  
  // 同步组件内部状态
  currentUploadRef.handleRemove(file);
};
const handlePictureCardPreview = (file) => {
  try {
    let previewUrl = '';
    
    if (file.raw instanceof File) {
      previewUrl = URL.createObjectURL(file.raw);
    } else if (file.url) {
      previewUrl = file.url;
    }

    // 设置10秒后自动释放URL
    setTimeout(() => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    }, 10000);

    dialogImageUrl.value = previewUrl;
    dialogVisible.value = true;
  } catch (error) {
    console.error('预览失败:', error);
    ElMessage.error('文件预览失败，请重试！');
  }
};
  // 设置进度条颜色渐变
  const progressColor = [
    { color: '#f56c6c', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#5cb87a', percentage: 60 },
    { color: '#1989fa', percentage: 80 },
    { color: '#6f7ad3', percentage: 100 },
  ];


  // 添加一个函数来检查文件名是否符合要求
  const isValidFileName = (fileName) => {
    const fileNameRegex = /^[a-zA-Z0-9_-]+$/; // 正则表达式匹配仅包含字母、数字、“_”和“-”
    return fileNameRegex.test(fileName.split('.').shift()); // 检查去掉扩展名后的文件名
  };


  const handleChange = async (file, fileList) => {
  console.log('handleChange called with fileList:', fileList); // 调试日志
  
  let invalidFiles = []; // 收集所有无效文件信息
  
  const validFiles = await Promise.all(
    fileList.map(async f => {
      console.log('Validating file:', f.name); // 调试日志
      const isValid = await validateFile(f);
      if (!isValid) {
        console.log(`File ${f.name} is invalid`); // 调试日志
        invalidFiles.push(f.name); // 收集无效文件名称
      } else {
        console.log(`File ${f.name} is valid`); // 调试日志
      }
      return isValid ? f : null;
    })
  ).then(results => results.filter(Boolean));

  console.log('Invalid files:', invalidFiles); // 调试日志
  console.log('Valid files:', validFiles); // 调试日志

  // 统一提示无效文件
  if (invalidFiles.length > 0) {
    ElMessage.warning({
      message: `发现不符合要求的文件：${invalidFiles.join(', ')}，已自动过滤，请注意查看使用说明！`,
      duration: 3000
    });
  }

  // 处理数量限制
  if (validFiles.length > 5) {
    validFiles.splice(5);
    ElMessage.warning('最多保留前5张有效图片');
  }

  // 更新文件列表
  images.value = validFiles.map(f => ({
    ...f,
    thumbnail: f.raw ? URL.createObjectURL(f.raw) : f.url
  }));

  console.log('Updated images:', images.value); // 调试日志
}

//拖拽上传文件处理
const onFileChange = (event) => {
  const selectedFiles = event.target.files;
  if (selectedFiles && selectedFiles.length > 0) {
    handleFileSelection(Array.from(selectedFiles).map(file => ({
      ...file,
      raw: file, // 添加 raw 属性
      url: URL.createObjectURL(file), // 添加 url 属性
    })));
  } else {
    ElMessage.warning('请选择至少一张图片进行上传！');
  }
};

const handleExceed = () => {
ElMessage.warning(`最多只能上传5张图片！`);
};

const handleFileSelection = (selectedFiles) => {
  const validFiles = images.value.filter(f => !f.status || f.status !== 'removed');
  
  if (validFiles.length + selectedFiles.length > 5) {
    ElMessage.warning('最多只能上传5张图片！');
    return;
  }

  for (const file of selectedFiles) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_FORMATS.includes(`.${fileExtension}`)) {
      ElMessage.warning('不支持的文件格式，请选择图片文件！');
      return;
    }

    if (!isValidFileName(file.name)) {
      ElMessage.warning('文件名只能包含字母、数字、“_”和“-”，请重新选择文件！');
      return;
    }

    // 确保每个文件对象都有 raw 和 url 属性
    const newFile = new File([file], file.name, { type: file.type });
    newFile.raw = file;
    newFile.url = URL.createObjectURL(file);
    newFile.thumbnail = URL.createObjectURL(file); // 添加 thumbnail 属性
    images.value.push(newFile);
  }
};



const handleSubmit = async (event) => {
event.preventDefault(); // 阻止表单的默认提交行为

// 检查是否有图片被选择
if (!images.value || images.value.length === 0) {
  console.log('No images selected, showing warning message...'); // 调试日志
    ElMessage.warning('请选择至少一张图片进行上传！');
    return;
  }

// 表单有效，可以继续执行上传逻辑
await uploadFiles();
};

const uploadFiles = async () => {
if (!images.value || images.value.length === 0){
  ElMessage.warning('请选择至少一张图片进行上传！');
  return;
}  // 如果没有文件则不执行
console.log('Uploading files:', images.value);

isUploading.value = true; // 设置为正在上传状态
uploadProgress.value = 0; // 重置上传进度
isProcessing.value = false; // 确保在上传开始前关闭处理状态
message.value = ''; // 清除任何旧的消息
errorMessage.value = ''; // 清除任何旧的错误消息
showFileDetails.value = false; // 隐藏文件详情
isLottieVisible.value = false; // 隐藏动画

try {
  // 创建表单数据对象并添加文件
  const formData = new FormData();
  images.value.forEach(file => {
    if (file.raw) {
      formData.append("images", file.raw); // 使用 'images' 作为字段名
    } else {
      console.warn('File object does not have a raw property:', file);
    }
  });

  // 发送POST请求上传文件
  const response = await axios.post("/api/ocr_text", formData, {
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

  console.log('响应数据大小:', response.data.size);
  console.log('响应类型:', response.headers['content-type']);
  
  // 保存原始Blob数据
  pdfBlob.value = new Blob([response.data], { type: 'application/pdf' });
    
  // 创建URL时也使用原始Blob
  const url = URL.createObjectURL(pdfBlob.value);
  pdfUrl.value = url;
  console.log('PDF URL:', pdfUrl.value);

  window.debugBlob = new Blob([response.data], { type: 'application/pdf' });
  console.log('调试Blob已保存到 window.debugBlob');
  


  showActions.value = true;
  // 显示文件处理成功的消息
  ElMessage.success('文件处理成功');
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
              title: '错误！',
              type: 'error',
              confirmButtonText: '确认',
              callback: () => {
                ElMessage.warning('注意查看使用说明及流程！');
              },
            }
          );
        } catch {
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
      ElMessageBox(`Error ${error.response.status}: ${errorMsg}`);
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
  images.value = []; // 清除已选择的文件
  if (fileInput.value) {
    fileInput.value.value = ''; // 重置文件输入框
    fileInput.value.dispatchEvent(new Event('change')); // 触发 change 事件以刷新状态
  }
  showFileDetails.value = true; // 显示文件详情
  isLottieVisible.value = true; // 显示动画
}
};

// 在组件卸载时释放资源
onBeforeUnmount(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
  }
  if (pdfBlob.value) {
    pdfBlob.value = null;
  }
});


  return {
    fileInput,
    uploadRef,
    uploadFiles,
    onFileChange,
    isUploading,
    uploadProgress,
    message,
    errorMessage,
    isProcessing,
    showFileDetails,
    handleSubmit,
    progressColor,
    dialogImageUrl,
    dialogVisible,
    disabled,
    images,
    handleRemove,
    handlePictureCardPreview,
    pdfUrl,
    handleChange,
    isLottieVisible,
    handleExceed,
    resetUpload,
    openPdfPreview,
    showActions,
    addPDFToCache,
    beforeUpload
  };
},
};
</script>