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
## 功能点

* 计算文件大小，文件大小上传限制<br>
* 验证文件头确认文件类型，从而限制文件上传的类型<br>
* 使用正则表达式验证文件名是否包含非法字符<br>
* 监听文件上传进度，计算文件上传进度实现上传进度条的功能<br>
* 处理后端json响应，以ElMessage提示文件处理的结果或错误信息<br>

## 目录

    tool
    ├─ .eslintrc.js
    ├─ .prettierrc.js
    ├─ babel.config.js
    ├─ jsconfig.json
    ├─ package-lock.json
    ├─ package.json
    ├─ public
    │  ├─ favicon.ico
    │  └─ index.html
    ├─ src
    │  ├─ App.vue
    │  ├─ assets
    │  │  ├─ style
    │  │  │  ├─ app.css
    │  │  │  ├─ attention.png
    │  │  │  ├─ car.json
    │  │  │  ├─ down.svg
    │  │  │  ├─ govee.png
    │  │  │  ├─ menu.png
    │  │  │  ├─ Q.png
    │  │  │  ├─ scrollbar.svg
    │  │  │  ├─ Smiley_Sans1.woff
    │  │  │  ├─ Smiley_Sans2.woff2
    │  │  │  ├─ text.png
    │  │  │  ├─ tool-title
    │  │  │  │  ├─ 1-1.png
    │  │  │  │  ├─ 1-2.png
    │  │  │  │  ├─ 1-3.png
    │  │  │  │  ├─ 1-4.png
    │  │  │  │  ├─ 1-5.png
    │  │  │  │  ├─ 2-1.png
    │  │  │  │  ├─ 2-2.png
    │  │  │  │  ├─ 2-3.png
    │  │  │  │  ├─ 2-4.png
    │  │  │  │  ├─ 2-5.png
    │  │  │  │  ├─ 3-1.png
    │  │  │  │  └─ 3-2.png
    │  │  │  └─ upload.json
    │  │  └─ work.mp4
    │  ├─ components
    │  │  ├─ aigc_eval.vue
    │  │  ├─ check_file.vue
    │  │  ├─ convert_image.vue
    │  │  ├─ cut_video.vue
    │  │  ├─ dedup_data.vue
    │  │  ├─ detect_eval.vue
    │  │  ├─ format_json.vue
    │  │  ├─ ocr_image.vue
    │  │  ├─ ocr_text.vue
    │  │  ├─ rename_file.vue
    │  │  ├─ split_data.vue
    │  │  ├─ tool-explain
    │  │  │  ├─ tool1.jpg
    │  │  │  ├─ tool10.jpg
    │  │  │  ├─ tool11.jpg
    │  │  │  ├─ tool2.jpg
    │  │  │  ├─ tool3.jpg
    │  │  │  ├─ tool4.jpg
    │  │  │  ├─ tool5.jpg
    │  │  │  ├─ tool6.jpg
    │  │  │  ├─ tool7.jpg
    │  │  │  ├─ tool8.jpg
    │  │  │  └─ tool9.jpg
    │  │  └─ tool-img
    │  │     └─ load.gif
    │  ├─ config
    │  │  └─ api.js
    │  ├─ config.js
    │  ├─ Home.vue
    │  ├─ main.js
    │  ├─ navigation.vue
    │  ├─ router
    │  │  └─ index.js
    │  ├─ select_check.js
    │  └─ upload.js
    ├─ vue.config.js
    └─ webpack.config.js

    ```
