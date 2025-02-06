<template>
    <div class="navigation">
        <img alt="logo" src="./assets/style/govee.png">
        <router-link to="/" class="nav-main-a">首页</router-link>
    </div>
    
    <div class="nav-list">
        <ul class="nav-list-ul">
            <li>
                <div class="li-title">数据处理工具</div>
                <ol>
                    <li 
                        v-for="(item, index) in dataProcessingTools" 
                        :key="index"
                        @click="selectItem(index)"
                        :class="{ 'active': activeIndex === index }"
                    >
                        <router-link :to="item.route">{{ item.name }}</router-link>
                    </li>
                </ol>
            </li>

            <li>
                <div class="li-title">算法处理工具</div>
                <ol>
                    <li 
                        v-for="(item, index) in algorithmProcessingTools" 
                        :key="index"
                        @click="selectItem(dataProcessingTools.length + index)"
                        :class="{ 'active': activeIndex === dataProcessingTools.length + index }"
                    >
                        <router-link :to="item.route">{{ item.name }}</router-link>
                    </li>
                </ol>
            </li>
        </ul>
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
                { name: '图片损坏检测', route: 'check_file' },
                { name: '数据切分', route: 'split_data' },
                { name: '视频抽帧', route: 'cut_video' },
                { name: '图片去重', route: 'dedup_data' },
            ],
            algorithmProcessingTools: [
                { name: '文生图评分', route: 'aigc_eval' },
            ],
        };
    },
    methods: {
        selectItem(index) {
            this.activeIndex = index;
        },
    },
};
</script>

<style>
.data-processing-tools, .algorithm-processing-tools {
    list-style-type: disc !important; /* 使用 !important 确保样式生效 */

}

.active {
    color: aqua !important;
    font-weight: bold;
    list-style-type: disc !important;
}
.active :hover{
    background-color: white !important;
    height: 30px;
    align-items: center;
    display: flex;
    width: 100%;
}
</style>
