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

```java
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

```java
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
* 集成文件验证上传后端交互逻辑，优化性能<br>

## 目录结构

    tool
    ├─ public
    │  ├─ favicon.ico           //网页窗口图标
    │  └─ index.html
    ├─ src                      //项目目录
    │  ├─ App.vue               //主页最外层
    │  ├─ assets                //资源文件夹
    │  │  ├─ style
    │  │  │  ├─ app.css         //css样式
    │  │  │  ├─ tool-title      //存放图标文件夹
    │  │  │  └─ upload.json     //Lottie动画
    │  │  └─ work.mp4           //主页背景动画
    │  ├─ components            //组件文件夹
    │  │  ├─ aigc_eval.vue      //文生图评分
    │  │  ├─ check_file.vue     //图片损坏检测
    │  │  ├─ convert_image.vue  //图片格式转换
    │  │  ├─ cut_video.vue      //视频抽帧
    │  │  ├─ dedup_data.vue     //图片去重
    │  │  ├─ detect_eval.vue    //目标检测模型评价
    │  │  ├─ format_json.vue    //json格式化
    │  │  ├─ ocr_image.vue      //OCR图片筛选
    │  │  ├─ ocr_text.vue       //OCR文本提取
    │  │  ├─ rename_file.vue    //文件重命名
    │  │  ├─ split_data.vue     //数据切分
    │  │  ├─ tool-explain       //流程图文件夹
    │  │  └─ tool-img 
    │  │     └─ load.gif        //文件处理时显示的动画
    │  ├─ config
    │  │  └─ api.js             //后端api配置文件
    │  ├─ Home.vue              //首页
    │  ├─ main.js               //配置静态资源文件
    │  ├─ navigation.vue        //左侧导航栏配置文件
    │  ├─ router
    │  │  └─ index.js           //配置路由，主页跳转链接文件
    │  ├─ select_check.js       //集成文件选择及检测文件逻辑文件
    │  └─ upload.js             //集成文件上传后端信息返回逻辑文件
    └─ vue.config.js            //配置前后端分离文件
    ```

## 项目效果图

![image](https://github.com/user-attachments/assets/a25a94ac-03f3-465a-bb78-f2f5716f3c4e)

![image](https://github.com/user-attachments/assets/54d8242f-16a7-4a5b-a6fd-fa43bbd9244b)

![image](https://github.com/user-attachments/assets/3ebe3762-e1d5-46b4-9c92-20f9b34e0754)

![image](https://github.com/user-attachments/assets/5eaa14d2-b524-447d-9b3a-e75cfa9b7f15)

## 资源网页

[图标](www.iconfont.cn)<br>
[el组件]([www.iconfont.cn](https://element-plus.org/zh-CN/component/overview.html)<br>

