<template>
    <div class="navigation">
        <img alt="logo" src="./assets/style/govee.png">
        <router-link to="/" class="nav-main-a">首页</router-link>
    </div>

    <div class="nav-list">
        <el-scrollbar height="90vh" width="90vh">
            <ul class="nav-list-ul">
            <li>
                <div class="li-title-top">数据处理工具</div>
                <ol>
                    <li 
                        v-for="(item, index) in dataProcessingTools" 
                        :key="index"
                    >
                        <router-link 
                            :to="item.route" 
                            @click="selectItem(index)"
                            :class="{ 'active': activeIndex === index }"
                        >
                        &nbsp;{{ item.name }}&nbsp;
                        </router-link>
                    </li>
                </ol>
            </li>

            <li>
                <div class="li-title">算法处理工具</div>
                <ol>
                    <li 
                        v-for="(item, index) in algorithmProcessingTools" 
                        :key="index"
                    >
                        <router-link 
                            :to="item.route" 
                            @click="selectItem(dataProcessingTools.length + index)"
                            :class="{ 'active': activeIndex === dataProcessingTools.length + index }"
                        >
                        &nbsp;{{ item.name }}&nbsp;
                        </router-link>
                    </li>
                </ol>
            </li>

            <li>
                <div class="li-title">文件处理工具</div>
                <ol>
                    <li 
                        v-for="(item, index) in fileProcessingtools" 
                        :key="index" 
                    >
                        <router-link 
                            :to="item.route" 
                            @click="selectItem(dataProcessingTools.length + algorithmProcessingTools.length + index)"
                            :class="{ 'active': activeIndex === dataProcessingTools.length + algorithmProcessingTools.length + index }"
                        >
                        &nbsp;{{ item.name }}&nbsp;
                        </router-link>
                    </li>
                </ol>
            </li>
        </ul>
        </el-scrollbar>

    </div>
    <div class="nav-main">
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: 'myNavigation',
    data() {
        return {
            activeIndex: null,
            dataProcessingTools: [
                { name: ' 图片损坏检测 ', route: 'check_file' },
                { name: ' 数据切分 ', route: 'split_data' },
                { name: ' 视频抽帧 ', route: 'cut_video' },
                { name: ' 图片去重 ', route: 'dedup_data' },
                { name: ' 图片格式转换 ', route: 'convert_image'}
            ],
            algorithmProcessingTools: [
                { name: ' 文生图评分 ', route: 'aigc_eval' },
                { name: ' OCR图片筛选 ', route: 'ocr_image'},
                { name: ' OCR文本提取 ', route: 'ocr_text'},
                { name: ' 目标检测模型评价 ', route: 'detect_eval'},
            ],
            fileProcessingtools: [
                { name: ' json格式化 ', route: 'format_json' },
                { name: ' 文件重命名 ', route: 'rename_file' },
            ]
        };
    },
    methods: {
        selectItem(index) {
        this.activeIndex = index;
        console.log('Selected index:', index);
    },
    findActiveIndex() {
        const currentPath = this.$route.path;
        // 优化路径匹配逻辑（增加斜线处理）
        const targetRoute = currentPath.endsWith('/') 
            ? currentPath.slice(0, -1) 
            : currentPath;
        
        // 合并所有工具项时添加索引标记
        const allTools = [
            ...this.dataProcessingTools.map((v,i) => ({...v, index: i})),
            ...this.algorithmProcessingTools.map((v,i) => ({...v, index: i + this.dataProcessingTools.length})),
            ...this.fileProcessingtools.map((v,i) => ({...v, index: i + this.dataProcessingTools.length + this.algorithmProcessingTools.length}))
        ];

        // 使用完整路径匹配
        const targetItem = allTools.find(item => 
            targetRoute.includes(item.route)
        );
        
        this.activeIndex = targetItem ? targetItem.index : null;
    }
},
    watch: {
        '$route'() {
            this.findActiveIndex();
    }
    },
    mounted() {
        this.findActiveIndex();
    }
};
</script>

