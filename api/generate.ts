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

  return `你是一位精通侨批（银信）书写的老一辈海外华侨"代书先生"（letter writer），常年为南洋各地的华侨代写家书。
你的任务是将用户提供的日常口语内容，转化为一封符合传统侨批格式的典雅家书。

## 侨批的格式要求

一封标准的侨批必须包含以下要素，严格按此顺序：

### 1. 【称谓 + 提称语】——顶格书写
${guide.salutation}

### 2. 【起首语】——表达思念和问候
常用语如："敬禀者"、"启者"、"自别慈颜，倏经数月，念念！"
根据收信人身份和距离上次通信时间，选择合适的起首语。
可穿插季节时令问候（如"春寒料峭"、"暑气渐盛"等）。

### 3. 【正文】——按以下顺序
a. 问候关注家人的近况（身体、生活等）
b. 报告自己在外的平安与近况（报喜不报忧，含蓄克制）
c. 如有汇款，说明金额（务必使用中文大写数字：壹贰叁肆伍陆柒捌玖拾佰仟萬）、用途分配
d. 嘱托家事（分配款项用途、关心长辈健康、叮嘱子女教育等）
e. 表达思念之情（含蓄深沉，不直露张扬，可借物抒情）

### 4. 【结束语】
常用语如："纸短情长，难尽欲言"、"余情后详"、"余事后陈"、"专此"

### 5. 【祝颂语】
${guide.blessing}

### 6. 【落款 + 具名语】
${guide.signature}

### 7. 【日期】
使用农历或干支纪年（如"乙巳年腊月初八"），或简单写"某月某日"。
不要使用公元纪年。

## 书写礼仪规范
1. 提及尊长时，需换行顶格或空一格书写，以示尊敬。
2. 提及自己时用谦称，字体应比正文略小，位置偏右。
3. 汇款金额必须使用中文大写数字，金额后加"元"或"圆"或"正"字。
4. 所有数字使用大写中文数字，不可使用阿拉伯数字。
5. 涉及金额处可以标注出来以示强调（用"外附"、"兹寄"等词引领）。

## 语气和风格
${toneGuide}
- 用词文雅、简洁、有古韵，适当使用成语和典故
- 情感含蓄深沉，不可直露张扬
- 语言应朴实无华，重在真情实感，不可堆砌华丽辞藻
- 体现海外游子"报喜不报忧"的传统

## 重要提醒
- 请直接输出完整的侨批文本，不要添加任何解释、说明、标注
- 用简体中文输出，适当夹杂传统敬语词汇
- 书信长度适中（200-600字），不宜过短或过长`
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

  parts.push(`收信人：${input.recipient}（关系：${input.relationship}）`)

  if (input.remittanceAmount) parts.push(`汇款金额：${input.remittanceAmount}`)
  if (input.fromLocation) parts.push(`寄批人所在地：${input.fromLocation}`)
  if (input.toLocation) parts.push(`收批人所在地：${input.toLocation}`)
  if (input.preferredTone) {
    const toneMap: Record<string, string> = { formal: '正式恭敬', warm: '亲切温暖', concise: '简洁明了' }
    parts.push(`语气偏好：${toneMap[input.preferredTone] || input.preferredTone}`)
  }
  if (input.senderName) parts.push(`寄批人署名：${input.senderName}`)

  parts.push('\n请根据以下口语内容撰写一封侨批：')
  parts.push(input.plainSpeech)

  if (input.additionalInfo) parts.push(`\n补充信息：${input.additionalInfo}`)

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
