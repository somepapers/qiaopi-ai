import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ code: 'METHOD_NOT_ALLOWED', message: '仅支持GET请求' })
    return
  }

  try {
    // 从 KV 读取累计写批次数，默认 0
    const count = (await kv.get<number>('qiaopi:total')) || 0

    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    res.status(200).json({ count })
  } catch (err) {
    console.error('Stats error:', err)
    // KV 未配置时返回占位值，不阻塞页面
    res.status(200).json({ count: 0, unconfigured: true })
  }
}
