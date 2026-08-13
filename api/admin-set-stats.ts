import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

export const config = {
  runtime: 'nodejs',
}

// 临时管理端点：设置写批计数初始值，用后即删
const ADMIN_KEY = '95128fc79e2ffea115826cebd3ee7481'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' || req.headers['x-admin-key'] !== ADMIN_KEY) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: '无权访问' })
    return
  }

  try {
    const { value } = req.body
    await kv.set('qiaopi:total', typeof value === 'number' && value > 0 ? value : 320)
    const count = await kv.get('qiaopi:total')
    res.status(200).json({ ok: true, count })
  } catch (err) {
    console.error('Set stats error:', err)
    res.status(500).json({ code: 'KV_ERROR', message: String(err) })
  }
}
