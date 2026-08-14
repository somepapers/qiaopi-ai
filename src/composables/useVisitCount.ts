import { ref } from 'vue'

// 模块级共享状态：进入网站时记录访问，首页展示最新使用次数
const visitCount = ref<number | null>(null)
let recordPromise: Promise<number | null> | null = null

/** 进入网站：计数 +1，返回最新使用次数（同一页面加载内只请求一次） */
export function recordVisit(): Promise<number | null> {
  if (!recordPromise) {
    recordPromise = fetch('/api/stats', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        visitCount.value = typeof data.count === 'number' ? data.count : null
        return visitCount.value
      })
      .catch(() => {
        recordPromise = null // 失败后允许下次重试
        return null
      })
  }
  return recordPromise
}

export function useVisitCount() {
  return { visitCount, recordVisit }
}
