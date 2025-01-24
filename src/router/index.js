import { createRouter, createWebHistory } from 'vue-router'
import aigc_eval from '../components/aigc_eval.vue' 
import check_file from '../components/check_file.vue' 
import cut_video from '../components/cut_video.vue' 
import dedup_data from '../components/dedup_data.vue' 

const routes = [
  {
    path: '/',
    component: () => import('../App.vue'), // 使用基础布局
    children:[
      {
        path: '',
        name: 'Home',
        component: () => import('../Home.vue')
      },

      {
        path:'/',
        component: () => import('../navigation.vue'),
        children:[
          {
            path: 'split_data',
            name: 'split_data',
            component: () => import('../components/split_data.vue')
        
          },
        
          {
            path: '/aigc_eval',
            name: 'aigc_eval',
            component: aigc_eval
          },
        
          {
            path: '/check_file',
            name: 'check_file',
            component: check_file
          },
        
          {
            path: '/cut_video',
            name: 'cut_video',
            component: cut_video
          },
        
          {
            path: '/dedup_data',
            name: 'dedup_data',
            component: dedup_data
          },
        ]
      },

      
    ]
  },


  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router