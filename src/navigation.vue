
<template>
    <div class="navigation">
        <img alt="logo" src="./assets/style/govee.png">
        <router-link to="/"><a class="nav-main-a">首页</a></router-link>
    </div>
    
    <div class="nav-list">
            <ul class="nav-list-ul">
                <li><div class="li-title">数据处理工具</div>
                    <ol>
                        <li><router-link to="check_file"><a>图片损坏检测</a></router-link></li>
                        <li><router-link to="split_data"><a>数据切分</a></router-link></li>
                        <li><router-link to="cut_video"><a>视频抽帧</a></router-link></li>
                        <li><router-link to="dedup_data"><a>图片去重</a></router-link></li>
                    </ol>
                </li>

                <li><div class="li-title">算法处理工具</div>
                    <ol>
                        <li><router-link to="aigc_eval"><a>文生图评分</a></router-link></li>
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
}
</script>