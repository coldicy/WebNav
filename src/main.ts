//导入全局样式
import '@/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 导入element css文件
import 'element-plus/dist/index.css'
// 暗黑模式样式
import 'element-plus/theme-chalk/dark/css-vars.css'


const app = createApp(App)
app.use(createPinia())
// app.use(ElementPlus)

// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//   app.component(key, component)
// }

app.mount('#app')