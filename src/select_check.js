import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fileTypeFromBlob } from 'file-type';
import lottie from 'lottie-web';


export function useSelect_Check() {
    const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB in bytes
    
    
    // 存储选中的单个文件
    const file = ref(null);

    // 引用文件输入元素
    const fileInput = ref(null);

    const lottieInstance = ref(null);

    
    // 压缩包白名单配置
const ZIP_WHITELIST = {
  // 合法的MIME类型
  mimeTypes: [
    'application/zip',          // 标准ZIP类型
    'application/x-zip-compressed',  // 兼容类型
    'application/x-zip'         // 备用类型
  ],
  
  // 合法的文件头签名（十六进制）
  signatures: [
    '504B0304', // 标准ZIP文件头
    '504B0506', // 空ZIP文件头
    '504B0708'  // spanned ZIP文件头
  ],

  // 合法的文件扩展名
  extensions: ['.zip']
};

const SUPPORTED_FORMATS = ZIP_WHITELIST.extensions; // 支持的文件格式

    
    // 控制文件详情的显示
    const showFileDetails = ref(true);
    const isLottieVisible = ref(true); // 默认显示 Lottie 动画

    const initLottie = (containerId) => {
        import('@/assets/style/upload.json').then(animationData => {
          lottieInstance.value = lottie.loadAnimation({
            container: document.getElementById(containerId),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animationData.default
          });
        });
      };
      const toggleLottie = (visible) => {
        isLottieVisible.value = visible;
        if (lottieInstance.value) {
          visible ? lottieInstance.value.play() : lottieInstance.value.stop();
        }
      };

      // 打开文件选择器的方法
    const openFileInput = () => {
        if (fileInput.value) {
          // 触发文件输入框的点击事件，打开文件选择对话框
          fileInput.value.value = ''; // 清空输入值
          fileInput.value.click();
        }
      };
  
      // 当文件输入框的值改变时触发，即选择了新文件
      const onFileChange = (event) => {
        handleFileSelection(event.target.files[0]);
      };
  
      // 处理文件拖放事件
      const onDrop = (event) => {
        toggleLottie(true);
        isLottieVisible.value = true;// 显示动画
        handleFileSelection(event.dataTransfer.files[0]);
      };

      const checkFileTypeWithProgress = async (file) => {
        return new Promise((resolve) => {
          try {
            // 读取最小必要数据（文件头+目录结束标识）
            const chunkSize = 1024; // 1KB足够验证
            const blob = file.slice(0, chunkSize, file.type);
      
            const reader = new FileReader();
            
            // 设置超时保护（3秒）
            const timeoutId = setTimeout(() => {
              reader.abort();
              resolve(false);
            }, 3000);
      
            reader.onerror = () => {
              clearTimeout(timeoutId);
              resolve(false);
            };
      
            reader.onloadend = async () => {
              clearTimeout(timeoutId);
              try {
                // 核心验证逻辑
                const buffer = reader.result;
                
                // 1. 基础数据校验
                if (!buffer || buffer.byteLength < 4) return resolve(false);
      
                // 2. 文件头验证
                const header = Array.from(new Uint8Array(buffer.slice(0, 4)))
                  .map(b => b.toString(16).padStart(2, '0'))
                  .join('')
                  .toUpperCase();
      
                const validHeader = ZIP_WHITELIST.signatures.some(sig => 
                  header.startsWith(sig)
                );
      
                // 3. 终级验证策略
                return resolve(validHeader); // 完全依赖文件头验证
              } catch (e) {
                return resolve(false);
              }
            };
      
            reader.readAsArrayBuffer(blob);
          } catch (error) {
            resolve(false);
          }
        });
      };
const isValidFileName = async (file) => {
  try {
    // 基础校验
    if (!file || !file.name) return false;
    if (file.size > MAX_FILE_SIZE) return false;

    // 获取文件扩展名
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;

    // 文件名格式校验
    const baseName = file.name.slice(0, -4);
    if (!/^[a-zA-Z0-9_-]+$/.test(baseName)) {
      ElMessage.error('文件名包含非法字符');
      return false;
    }

    // 文件类型校验
let isValidType;
if (file.size > 500 * 1024 * 1024) {
  isValidType = await checkFileTypeWithProgress(file); // 仅文件头验证
} else {
  // 小文件仍执行完整验证
  const type = await fileTypeFromBlob(file);
  isValidType = ZIP_WHITELIST.mimeTypes.includes(type?.mime);
}

    // 最终校验
    return isValidType && 
           ZIP_WHITELIST.extensions.includes(fileExtension);
  } catch (error) {
    console.error('文件校验失败:', error);
    ElMessage.error('文件校验异常，请检查文件完整性');
    return false;
  }
};

    const handleFileSelection = async (selectedFile) => {
        console.log('Received file:', selectedFile?.name);
        if (!selectedFile) return;

        // 清理旧文件
        if(file.value) {
            file.value = null;
            if (fileInput.value) fileInput.value.value = '';
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            ElMessage.error('文件大小不能超过5G！');
            return;
        }

        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
        if (!SUPPORTED_FORMATS.includes(`.${fileExtension}`)) {
            ElMessage({
                message: '不支持的压缩包格式，请选择 .zip文件！',
                type: 'warning',
                duration: 5000,
                showClose: true
            });
            return;
        }

        const isValid = await isValidFileName(selectedFile);
        if (!isValid) {
            ElMessage.error('压缩包损坏、文件类型或格式不符合要求');
            return;
        }
        file.value = selectedFile;
    };

    const handleSubmit = async (event,uploadCallback) => {
        event.preventDefault();

        if (!file.value) {
            ElMessage({
                message: '请选择一个文件进行上传！',
                type: 'warning',
                duration: 5000,
                showClose: true
            });
            return;
        }

        await uploadCallback?.(); 
    };

    const fileSize = (size) => {
        if (size === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
        file,
        fileInput,
        showFileDetails,
        isLottieVisible,
        handleSubmit,
        fileSize,
        openFileInput,
        onFileChange,
        onDrop,
        initLottie,
        
    };
}