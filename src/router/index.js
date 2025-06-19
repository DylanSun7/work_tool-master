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
          {
            path:'/format_json',
            name:'format_json',
            component: () => import('../components/format_json.vue')

          },
          {
            path:'/convert_image',
            name:'convert_image',
            component: () => import('../components/convert_image.vue')
          },
          {
            path:'/ocr_image',
            name:'ocr_image',
            component: () => import('../components/ocr_image.vue')
          },
          {
            path:'/rename_file',
            name:'rename_file',
            component: () => import('../components/rename_file.vue')
          },
          {
            path:'/ocr_text',
            name:'ocr_text',
            component: () => import('../components/ocr_text.vue')
          },
          {
            path:'/detect_eval',
            name:'detect_eval',
            component: () => import('../components/detect_eval.vue')
          }

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