import type { LetterInput } from '@/types/letter'
import { CHATBOX_CONFIG } from '@/utils/constants'

interface SSECallbacks {
  onMessage: (text: string) => void
  onError: (error: string) => void
  onDone: (fullContent: string) => void
}

export async function generateLetterStream(
  input: LetterInput,
  callbacks: SSECallbacks,
  model?: string
): Promise<void> {
  const { onMessage, onError, onDone } = callbacks
  const abortController = new AbortController()
  let fullContent = ''
  let retries = 0
  const maxRetries = 2

  async function attempt() {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          model: model || CHATBOX_CONFIG.defaultModel,
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        if (response.status === 429) {
          throw new Error('请求过于频繁，请稍后再试')
        }
        throw new Error((errData as { message?: string }).message || `请求失败（${response.status}）`)
      }

      if (!response.body) {
        throw new Error('浏览器不支持流式响应')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            onDone(fullContent)
            return
          }
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullContent += delta
              onMessage(delta)
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }

      // Handle any remaining buffer
      if (buffer) {
        const line = buffer.trim()
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(line.slice(6))
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) fullContent += delta
          } catch { /* ignore */ }
        }
      }

      onDone(fullContent)
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return
      if (retries < maxRetries) {
        retries++
        await new Promise((r) => setTimeout(r, 1000 * retries))
        return attempt()
      }
      onError((err as Error).message || '网络连接失败，请检查网络后重试')
    }
  }

  return attempt()
}

export function createAbortController() {
  return new AbortController()
}
