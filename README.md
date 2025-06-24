# AI工具平台前端代码
工具分数据处理工具、算法处理工具、文件处理工具三大部分；<br>
包含图片损坏检测、数据切分、视频抽帧、图片去重、图片格式转换；<br>
文生图评分、OCR图片筛选、OCR文本提取、目标检测模型评价；<br>
json格式化、文件重命名<br>
<img width="960" alt="image" src="https://github.com/user-attachments/assets/41251377-b673-4a4c-8413-aecd30af5312" />
## 本地部署

本地安装[Node.js](https://nodejs.org/zh-cn)<br>
通过`npm`安装本地服务第三方依赖模块<br>

    npm install
    启动 npm run serve
### 关于接口

通过配置`vue.config.js`连接至后端，实现前后端分离<br>

    ```javascipt
     devServer: {
    proxy: {
      '/api': {
        target: 'http://XX.XXX.XX.XX:XXXX',// 代理目标地址
        changeOrigin: true,
        // pathRewrite: { '^/api': '' },//忽略路径中的 "/api"
      },
    },
    },
    ```
    
在`src\config`下的`api.js`获取API配置

    ```javascipt
    checkFile: {
      url: '/api/check_img',
      field: 'file'
    },
    convertImage: {
      url: '/api/convert_image',
      field: 'file'
    },
    ocrImage: {
      url: '/api/ocr_image',
      field: 'file'
    },
    ```
