<template>
    <div class="main-background">
        
        <div class="head-background">
            <video autoplay muted loop class="video-background">
               <source src="./assets/work.mp4" type="video/mp4">
               Your browser does not support the video tag.
            </video>
                <!-- 半透明黑色覆盖层 -->
                <div class="overlay"></div>
        </div>

        <div class="head-container">
            <!-- 图片和标题 -->
            <div class="image-logo">
                <img alt="logo" src="./assets/style/govee.png">
            </div>
        
            <div class="content">
                <div id="lottie"></div>
                <h1>ToolCircle(工具圈)</h1>
            </div>
        </div>

    </div>

    
            <div class="out-tool-menu">
                <div class="tool-menu">
                    <div class="tool-middle">
                        <div class="tool-title">
                            <a>
                                <img src="./assets/style/menu.png" alt="menu">
                                <strong> 数据处理工具 | </strong>
                            </a><br/>
                            <a>&nbsp;</a>
                        </div>

                        <div class="tool-list">

                            
                            <div class="tool-btn">
                                <el-tooltip class="item" effect="dark" content="筛选损坏的图片" placement="bottom">
                                    <div class="tool-button" @click="Go_check_file">
                                        <img src="./assets/style/tool-title/1-1.png">
                                        <a>图片损坏检测</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            <div class="tool-btn">
                                <el-tooltip class="item" effect="dark" content="划分数据集" placement="bottom">
                                    <div class="tool-button" @click="Go_split_data">
                                        <img src="./assets/style/tool-title/1-2.png">
                                            <a>数据切分</a>
                                    </div>
                                </el-tooltip>
                            </div>
                            <div class="tool-btn">
                                <el-tooltip class="item" effect="dark" content="将视频转为图片" placement="bottom">
                                    <div class="tool-button" @click="Go_cut_video">
                                        <img src="./assets/style/tool-title/1-3.png">
                                            <a>视频抽帧</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            <div class="tool-btn">
                                <el-tooltip class="item" effect="dark" content="剔除相似度高的图片" placement="bottom">
                                    <div class="tool-button" @click="Go_dedup_data">
                                        <img src="./assets/style/tool-title/1-4.png">
                                            <a>图片去重</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            <div class="tool-btn">
                                <el-tooltip class="item" effect="dark" content="将图片格式转换为指定样式" placement="bottom">
                                    <div class="tool-button" @click="Go_convert_image">
                                        <img src="./assets/style/tool-title/1-5.png">
                                            <a>图片格式转换</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            


                        </div>
                    </div>
                </div>
                <div class="tool-menu">
                    <div class="tool-middle">
                        <div class="tool-title">
                            <a>
                                <img src="./assets/style/menu.png" alt="menu">
                                <strong> 算法处理工具 | </strong>
                            </a><br/>
                            <a>&nbsp;</a>
                        </div>
                        <div class="tool-list">
                            <div class="tool-btn">
                                <el-tooltip class="item" effect="dark" content="结合提示词对图片进行评分" placement="bottom">
                                    <div class="tool-button" @click="Go_aigc_eval">
                                        <img src="./assets/style/tool-title/2-1.png">
                                            <a>文生图评分</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            <div class="tool-btn">
                                <el-tooltip class="item" effect="dark" content="筛选含有特定字符的图片" placement="bottom">
                                    <div class="tool-button" @click="Go_ocr_image">
                                        <img src="./assets/style/tool-title/2-4.png">
                                            <a>OCR图片筛选</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            <div class="tool-btn"> 
                                <el-tooltip class="item" effect="dark" content="提取图片中的文本" placement="bottom">
                                    <div class="tool-button" @click="Go_ocr_text">
                                        <img src="./assets/style/tool-title/2-5.png">
                                            <a>OCR文本提取</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            <div class="tool-btn" >
                                <el-tooltip class="item" effect="dark" content="测试目标检测模型的识别性能" placement="bottom">
                                    <div class="tool-button" @click="Go_detect_eval">
                                        <img src="./assets/style/tool-title/2-3.png">
                                            <a>目标检测模型评价</a>
                                    </div>
                                </el-tooltip>
                            </div>
                            

                            <div class="tool-btn" style="visibility:hidden;">
                                <el-tooltip class="item" effect="dark" content="测试图像分类模型的识别性能" placement="bottom">
                                    <div class="tool-button" @click="Go_aigc_eval">
                                        <img src="./assets/style/tool-title/2-2.png">
                                            <a>图像分类模型评价</a>
                                    </div>
                                </el-tooltip>
                            </div>


                            

                        </div>

                        

                    </div>
                </div>


                <div class="tool-menu">
                    <div class="tool-middle">
                        <div class="tool-title">
                            <a>
                                <img src="./assets/style/menu.png" alt="menu">
                                <strong> 文件处理工具 | </strong>
                            </a><br/>
                            <a>&nbsp;</a>
                        </div>

                        <div class="tool-list">
                            <div class="tool-btn">
                                <el-tooltip class="item" effect="dark" content="json文件格式化" placement="bottom">
                                    <div class="tool-button" @click="Go_format_json">
                                        <img src="./assets/style/tool-title/3-1.png">
                                            <a>json格式化</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            <div class="tool-btn">
                                <el-tooltip class="item" effect="dark" content="对所有文件进行重命名" placement="bottom">
                                    <div class="tool-button" @click="Go_rename_file">
                                        <img src="./assets/style/tool-title/3-2.png">
                                            <a>文件重命名</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            <div class="tool-btn" style="visibility:hidden;"> <!-- 隐藏元素，占位 -->
                                <el-tooltip class="item" effect="dark" content="结合提示词对图片进行评分" placement="bottom">
                                    <div class="tool-button" @click="Go_aigc_eval">
                                        <img src="./assets/style/tool-title/2-1.png">
                                            <a>文生图评分</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            <div class="tool-btn" style="visibility:hidden;"> <!-- 隐藏元素，占位 -->
                                <el-tooltip class="item" effect="dark" content="结合提示词对图片进行评分" placement="bottom">
                                    <div class="tool-button" @click="Go_aigc_eval">
                                        <img src="./assets/style/tool-title/2-1.png">
                                            <a>文生图评分</a>
                                    </div>
                                </el-tooltip>
                            </div>

                            <div class="tool-btn" style="visibility:hidden;"> <!-- 隐藏元素，占位 -->
                                <el-tooltip class="item" effect="dark" content="结合提示词对图片进行评分" placement="bottom">
                                    <div class="tool-button" @click="Go_aigc_eval">
                                        <img src="./assets/style/tool-title/2-1.png">
                                            <a>文生图评分</a>
                                    </div>
                                </el-tooltip>
                            </div>
                        </div>

                        




                    </div>
                </div>

            </div>



</template>


<script>
import { useRouter } from 'vue-router';
import { ElTooltip } from 'element-plus';
import lottie from 'lottie-web';
import animationData from '../src/assets/style/car.json';
import '../node_modules/element-plus/dist/index.css';

export default {
    name: 'App',
    components: {
    ElTooltip
    },

    mounted() {
    lottie.loadAnimation({
      container: document.getElementById('lottie'), // 当前元素的ID
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationData, // JSON数据
    });
  },
  setup() {
    const router = useRouter();

    const Go_split_data = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'split_data' });
    };
    const Go_check_file = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'check_file' });
    };
    const Go_cut_video = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'cut_video' });
    };
    const Go_dedup_data = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'dedup_data' });
    };
    const Go_format_json = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'format_json' });
    };
    const Go_aigc_eval = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'aigc_eval' });
    };
    const Go_convert_image = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'convert_image' });
    };
    const Go_ocr_image = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'ocr_image' });
    };
    const Go_rename_file = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'rename_file' });
    };
    const Go_ocr_text = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'ocr_text' });
    };
    const Go_detect_eval = () => {
      // 使用 push 方法进行跳转
      router.push({ name: 'detect_eval' });
    };







    return {
        Go_split_data,
        Go_check_file,
        Go_cut_video,
        Go_dedup_data,
        Go_format_json,
        Go_aigc_eval,
        Go_convert_image,
        Go_ocr_image,
        Go_rename_file,
        Go_ocr_text,
        Go_detect_eval,
    };
  }
};




</script>



<style src="./assets/style/app.css"></style>









<!-- /**
 *                    _ooOoo_
 *                   o8888888o
 *                   88" . "88
 *                   (| -_- |)
 *                    O\ = /O
 *                ____/`---'\____
 *                 .' \\| |// `.
 *               / \\||| : |||// \
 *             / _||||| -:- |||||- \
 *               | | \\\ - /// | |
 *             | \_| ''\---/'' | |
 *              \ .-\__ `-` ___/-. /
 *           ___`. .' /--.--\ `. . __
 *        ."" '< `.___\_<|>_/___.' >'"".
 *       | | : `- \`.;`\ _ /`;.`/ - ` : | |
 *         \ \ `-. \_ __\ /__ _/ .-` / /
 * ======`-.____`-.___\_____/___.-`____.-'======
 *                    `=---='
 *
 * .............................................
 *          佛祖保佑             永无BUG
 */ -->