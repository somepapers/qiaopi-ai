import { Router, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import { buildSystemPrompt } from '../prompts/system-prompt.js'

export const generateRouter = Router()

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { code: 'RATE_LIMITED', message: '请求过于频繁，请稍后再试' },
})

generateRouter.post('/generate', limiter, async (req: Request, res: Response) => {
  try {
    const { input } = req.body

    if (!input || !input.plainSpeech || !input.recipient) {
      res.status(400).json({ code: 'INVALID_INPUT', message: '请填写收信人信息和你想说的话' })
      return
    }

    const systemPrompt = buildSystemPrompt(input)
    const userMessage = buildUserMessage(input)
    const apiKey = process.env.CHATBOX_API_KEY

    if (!apiKey) {
      res.status(500).json({ code: 'NO_API_KEY', message: '服务器未配置API密钥' })
      return
    }

    const model = req.body.model || 'deepseek-v3.2'

    console.log(`🖋️  生成侨批 → 收信人: ${input.recipient}(${input.relationship}), 模型: ${model}`)

    // Call Chatbox AI API (OpenAI-compatible)
    const response = await fetch('https://ai.chatboxai.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 4096,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Chatbox AI API error:', response.status, errText)

      if (response.status === 429) {
        res.status(429).json({ code: 'RATE_LIMITED', message: 'AI服务繁忙，请稍后再试' })
        return
      }

      res.status(502).json({ code: 'AI_ERROR', message: 'AI服务暂时不可用，请稍后重试' })
      return
    }

    // Stream the response
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          res.write('data: [DONE]\n\n')
          res.end()
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        // Pass through the SSE chunks directly
        res.write(chunk)

        // Check if the connection was closed
        if (res.destroyed) {
          reader.cancel()
          break
        }
      }
    } catch (streamErr) {
      console.error('Stream error:', streamErr)
      if (!res.destroyed) {
        res.end()
      }
    }
  } catch (err) {
    console.error('Generate error:', err)
    if (!res.headersSent) {
      res.status(500).json({ code: 'SERVER_ERROR', message: '生成失败，请重试' })
    }
  }
})

function buildUserMessage(input: {
  recipient: string
  relationship: string
  plainSpeech: string
  remittanceAmount?: string
  fromLocation?: string
  toLocation?: string
  additionalInfo?: string
  preferredTone?: string
  senderName?: string
}): string {
  const parts: string[] = []

  parts.push(`收信人：${input.recipient}（关系：${input.relationship}）`)

  if (input.remittanceAmount) {
    parts.push(`汇款金额：${input.remittanceAmount}`)
  }
  if (input.fromLocation) {
    parts.push(`寄批人所在地：${input.fromLocation}`)
  }
  if (input.toLocation) {
    parts.push(`收批人所在地：${input.toLocation}`)
  }
  if (input.preferredTone) {
    const toneMap: Record<string, string> = {
      formal: '正式恭敬',
      warm: '亲切温暖',
      concise: '简洁明了',
    }
    parts.push(`语气偏好：${toneMap[input.preferredTone] || input.preferredTone}`)
  }
  if (input.senderName) {
    parts.push(`寄批人署名：${input.senderName}`)
  }

  parts.push(`\n请根据以下口语内容撰写一封侨批：`)
  parts.push(input.plainSpeech)

  if (input.additionalInfo) {
    parts.push(`\n补充信息：${input.additionalInfo}`)
  }

  return parts.join('\n')
}
