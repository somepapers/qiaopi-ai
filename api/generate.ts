import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
}

const RELATIONSHIP_GUIDES: Record<string, {
  salutation: string
  blessing: string
  signature: string
}> = {
  parents: {
    salutation: '使用"双亲大人膝下"或"父母亲大人尊前"',
    blessing: '使用"耑此跪禀，恭请福安"或"专此奉禀，敬请金安"',
    signature: '使用"男 [名字] 叩禀"',
  },
  father: {
    salutation: '使用"父亲大人尊前"',
    blessing: '使用"耑此跪禀，恭请福安"',
    signature: '使用"男 [名字] 叩禀"',
  },
  mother: {
    salutation: '使用"母亲大人膝下"',
    blessing: '使用"耑此跪禀，恭请金安"',
    signature: '使用"男 [名字] 叩禀"',
  },
  wife: {
    salutation: '使用"贤妻妆次"或"吾妻妆次"',
    blessing: '使用"专此奉达，顺颂妆安"',
    signature: '使用"夫 [名字] 手启"',
  },
  husband: {
    salutation: '使用"夫君英鉴"',
    blessing: '使用"专此奉达，顺颂时祺"',
    signature: '使用"妻 [名字] 敛衽"',
  },
  son: {
    salutation: '使用"吾儿收知"',
    blessing: '使用"手此，并祝进步"',
    signature: '使用"父 [名字] 手示"',
  },
  daughter: {
    salutation: '使用"女儿见字"',
    blessing: '使用"手此，顺颂闺安"',
    signature: '使用"父 [名字] 手示"',
  },
  older_brother: {
    salutation: '使用"吾兄座右"',
    blessing: '使用"专此奉达，顺颂时祺"',
    signature: '使用"弟 [名字] 手启"',
  },
  younger_brother: {
    salutation: '使用"贤弟如晤"',
    blessing: '使用"专此奉达，顺颂时祺"',
    signature: '使用"兄 [名字] 手启"',
  },
  grandfather: {
    salutation: '使用"祖父大人膝下金安"',
    blessing: '使用"耑此跪禀，恭请福安"',
    signature: '使用"孙 [名字] 叩禀"',
  },
  grandmother: {
    salutation: '使用"祖母大人膝下金安"',
    blessing: '使用"耑此跪禀，恭请福安"',
    signature: '使用"孙女 [名字] 叩禀"',
  },
  teacher: {
    salutation: '使用"先生大人函丈"或"业师大人尊前"',
    blessing: '使用"耑此叩禀，恭请教安"',
    signature: '使用"受业 [名字] 叩禀"或"学生 [名字] 叩禀"',
  },
}

const DEFAULT_GUIDE = {
  salutation: '根据收信人身份选择合适的敬语称谓。长辈用"膝下/尊前"，平辈用"如晤/座右"，晚辈用"收知/见字"。',
  blessing: '根据收信人身份选择合适的祝颂语。长辈用"福安/金安"，平辈用"时祺"，晚辈用"进步"。',
  signature: '根据与收信人的关系选择合适的具名方式。长辈用"叩禀"，平辈用"手启/谨启"。',
}

function buildSystemPrompt(input: {
  relationship: string
  preferredTone?: string
}): string {
  const guide = RELATIONSHIP_GUIDES[input.relationship] || DEFAULT_GUIDE

  let toneGuide = '语气恭敬正式，符合传统书信礼仪。情感表达含蓄而深沉。用词典雅，体现文化修养。'
  if (input.preferredTone === 'warm') {
    toneGuide = '语气亲切温暖，如话家常。可适当表达更多个人情感和牵挂。少用过于古奥的典故，语言更贴近日常。'
  } else if (input.preferredTone === 'concise') {
    toneGuide = '语气简洁明了，直达要旨。每段简短不赘述。重点突出汇款金额和关键嘱托。'
  }

  return `你是一位精通侨批（银信）书写的老一辈海外华侨"代书先生"。你的任务是将用户提供的日常口语内容，转化为一封符合传统侨批格式的典雅家书。

## 核心原则：忠实反映用户内容
你必须严格依据用户所写的口语内容来创作！信中的具体事实（如汇款金额、工作近况、叮嘱事项、家庭问候等）都必须来自用户的输入，不得凭空编造或泛泛而谈。如果用户没有提及某事项，信中就不应出现。用户的内容是第一位的，格式和文采是对内容的包装，而不是替代。

## 侨批格式（7要素）
1. 称谓+提称语：${guide.salutation}
2. 起首语：表达思念问候，如"敬禀者，自别慈颜，倏经数月，念念！"
3. 正文——将用户的口语内容用文言化方式写出，保持原意不变
4. 结束语：如"纸短情长，难尽欲言"
5. 祝颂语：${guide.blessing}
6. 落款：${guide.signature}
7. 日期：用农历/干支纪年，如"乙巳年腊月初八"

## 规则
- 金额用大写数字（壹贰叁肆伍陆柒捌玖拾佰仟萬），后加"元"或"圆"
- 提及尊长换行顶格，自称用谦称
- 语言朴实真情、含蓄深沉，不可堆砌辞藻
- ${toneGuide}
- 直接以称谓开头，不要加"侨批"标题
- 只输出书信文本，不要任何解释
- 长度200-600字`
}

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

  // Put the user's plain speech FIRST, before metadata
  parts.push('=== 用户想说的话（必须忠实反映到侨批中）===')
  parts.push(input.plainSpeech)
  parts.push('========================================')

  // Context info
  parts.push(`\n收信人：${input.recipient}（${input.relationship}）`)
  if (input.senderName) parts.push(`寄批人署名：${input.senderName}`)
  if (input.remittanceAmount) parts.push(`汇款金额：${input.remittanceAmount}`)
  if (input.fromLocation) parts.push(`寄批地：${input.fromLocation}`)
  if (input.toLocation) parts.push(`收批地：${input.toLocation}`)
  if (input.preferredTone) {
    const toneMap: Record<string, string> = { formal: '正式恭敬', warm: '亲切温暖', concise: '简洁明了' }
    parts.push(`语气：${toneMap[input.preferredTone] || input.preferredTone}`)
  }
  if (input.additionalInfo) parts.push(`补充：${input.additionalInfo}`)

  parts.push('\n请将以上用户想说的话写成侨批。')

  return parts.join('\n')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ code: 'METHOD_NOT_ALLOWED', message: '仅支持POST请求' })
    return
  }

  try {
    const { input, model } = req.body

    if (!input || !input.plainSpeech || !input.recipient) {
      res.status(400).json({ code: 'INVALID_INPUT', message: '请填写收信人信息和你想说的话' })
      return
    }

    const apiKey = process.env.CHATBOX_API_KEY
    if (!apiKey) {
      res.status(500).json({ code: 'NO_API_KEY', message: '服务器未配置API密钥' })
      return
    }

    const systemPrompt = buildSystemPrompt(input)
    const userMessage = buildUserMessage(input)
    const selectedModel = model || 'deepseek-v3.2'

    console.log(`🖋️ 生成侨批 → 收信人: ${input.recipient}, 模型: ${selectedModel}`)

    const response = await fetch('https://ai.chatboxai.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
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
      console.error('Chatbox AI error:', response.status)
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
        res.write(chunk)
        if (res.destroyed) {
          reader.cancel()
          break
        }
      }
    } catch {
      if (!res.destroyed) res.end()
    }
  } catch (err) {
    console.error('Generate error:', err)
    if (!res.headersSent) {
      res.status(500).json({ code: 'SERVER_ERROR', message: '生成失败，请重试' })
    }
  }
}
