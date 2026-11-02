import { kv } from '@vercel/kv'

export const config = {
  runtime: 'nodejs',
}

// 网站使用次数计数器：首次访问时以此基线值初始化
const VISIT_BASELINE = 10032
const VISIT_KEY = 'qiaopi:visits'

/** 首次访问时写入基线值（写入的是常量，幂等，并发安全） */
async function ensureBaseline() {
  if ((await kv.get(VISIT_KEY)) === null) {
    await kv.set(VISIT_KEY, VISIT_BASELINE)
  }
}

interface StatsResponse {
  setHeader(name: string, value: string): unknown
  status(code: number): { json(body: unknown): unknown }
}

export default async function handler(req: { method?: string }, res: StatsResponse) {
  try {
    if (req.method === 'POST') {
      // 进入网站：计数 +1 并返回最新值
      await ensureBaseline()
      const count = await kv.incr(VISIT_KEY)
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
      res.status(200).json({ count })
      return
    }

    if (req.method !== 'GET') {
      res.status(405).json({ code: 'METHOD_NOT_ALLOWED', message: '仅支持GET/POST请求' })
      return
    }

    // 读取累计使用次数
    await ensureBaseline()
    const count = (await kv.get<number>(VISIT_KEY)) ?? VISIT_BASELINE

    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    res.status(200).json({ count })
  } catch (err) {
    console.error('Stats error:', err)
    // KV 未配置时返回占位值，不阻塞页面
    res.status(200).json({ count: VISIT_BASELINE, unconfigured: true })
  }
}
