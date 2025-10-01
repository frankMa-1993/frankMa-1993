import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  
  // 全局配置
  app.config.globalProperties.$api = {
    baseUrl: 'https://your-api-domain.com/api'
  }
  
  return {
    app
  }
}