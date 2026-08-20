import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  // uni-app 小程序运行时需要从返回对象的 app 字段取得应用实例。
  return { app }
}
