import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { setupVersionCheck } from './utils/versionCheck'
import './styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// 仅生产环境启用：检测线上新部署并自动加载新版本
if (import.meta.env.PROD) {
  setupVersionCheck(router)
}
