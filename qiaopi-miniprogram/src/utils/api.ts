import { API_BASE_URL } from '../config'
import type { LetterInput } from '../types/letter'

// 小程序使用一次性 JSON 响应，避免依赖网页端的 ReadableStream / SSE。
export function generateLetter(input: LetterInput): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}/api/generate`,
      method: 'POST',
      data: { input, client: 'miniprogram' },
      header: { 'content-type': 'application/json' },
      timeout: 60000,
      success: (response) => {
        if (response.statusCode !== 200) {
          const data = response.data as { message?: string }
          reject(new Error(data?.message || '生成服务暂时不可用'))
          return
        }
        const text = (response.data as { content?: string })?.content?.trim() || ''
        text ? resolve(text) : reject(new Error('未收到生成内容，请检查后端接口'))
      },
      fail: () => reject(new Error('网络连接失败，请检查合法请求域名配置')),
    })
  })
}
