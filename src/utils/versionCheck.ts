import type { Router } from 'vue-router'
import { useLetterStore } from '@/stores/letter'

// 由 vite.config.ts 的 define 在构建时注入
declare const __APP_VERSION__: string

/**
 * 线上新版本自动检测。
 *
 * 部署新版后，部分浏览器（尤其微信内置浏览器）会长期使用缓存的旧页面。
 * 这里在页面回到前台、切换路由等时机，请求 version.json 比对构建版本号，
 * 发现新版本时在不打断用户的前提下自动重新加载页面。
 */

// 两次检测之间的最小间隔，避免频繁请求
const CHECK_INTERVAL = 5 * 60 * 1000
// 记录已为哪个目标版本刷新过，防止 CDN 短暂不一致时陷入刷新循环
const RELOADED_KEY = 'qiaopi-reloaded-for'

let updateAvailable = false
let lastCheckAt = 0

async function checkForUpdate(): Promise<void> {
  if (updateAvailable) return
  const now = Date.now()
  if (now - lastCheckAt < CHECK_INTERVAL) return
  lastCheckAt = now

  try {
    // 时间戳查询参数 + no-store，确保穿透各级缓存拿到最新版本号
    const res = await fetch(`/version.json?_=${now}`, { cache: 'no-store' })
    if (!res.ok) return
    const data: { version?: string } = await res.json()
    if (data.version && data.version !== __APP_VERSION__) {
      updateAvailable = true
    }
  } catch {
    // 网络异常时静默跳过，等待下次时机
  }
}

function reloadIfSafe(): void {
  if (!updateAvailable) return

  // 正在流式生成书信时不打断，等下一个安全时机
  const letterStore = useLetterStore()
  if (letterStore.isGenerating) return

  try {
    if (sessionStorage.getItem(RELOADED_KEY) === __APP_VERSION__) return
    sessionStorage.setItem(RELOADED_KEY, __APP_VERSION__)
  } catch {
    // sessionStorage 不可用时放弃防循环保护，但仍继续刷新
  }
  window.location.reload()
}

export function setupVersionCheck(router: Router): void {
  // 用户从其他应用/聊天窗口切回页面时检测
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void checkForUpdate().then(reloadIfSafe)
    }
  })

  // 切换页面时：已知有新版则借导航时机无感刷新，否则后台检测
  router.afterEach(() => {
    if (updateAvailable) {
      reloadIfSafe()
    } else {
      void checkForUpdate()
    }
  })

  // 启动后延迟首查，避免与首屏资源加载争抢
  window.setTimeout(() => void checkForUpdate(), 3000)
}
