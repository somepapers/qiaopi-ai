import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  runtime: 'nodejs',
}

// 仅允许缩短本站分享链接，防止短链 API 密钥被他人借道滥用
const ALLOWED_HOSTS = new Set([
  'qiaopi-ai-krc9.cn',
  'www.qiaopi-ai-krc9.cn',
  'qiaopi-ai-krc9.vercel.app',
  'localhost',
])

// 短链服务返回结构未在文档中固定，递归查找 link.rfseo.cn 域名的链接作为短链
function findShortUrl(data: unknown): string | null {
  if (typeof data === 'string') {
    return data.startsWith('https://link.rfseo.cn/') || data.startsWith('http://link.rfseo.cn/')
      ? data
      : null
  }
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findShortUrl(item)
      if (found) return found
    }
    return null
  }
  if (data && typeof data === 'object') {
    for (const value of Object.values(data as Record<string, unknown>)) {
      const found = findShortUrl(value)
      if (found) return found
    }
  }
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ code: 'METHOD_NOT_ALLOWED', message: '仅支持POST请求' })
    return
  }

  try {
    const { url } = req.body
    if (!url || typeof url !== 'string') {
      res.status(400).json({ code: 'INVALID_INPUT', message: '缺少链接' })
      return
    }

    let host: string
    try {
      host = new URL(url).hostname
    } catch {
      res.status(400).json({ code: 'INVALID_URL', message: '链接格式无效' })
      return
    }
    if (!ALLOWED_HOSTS.has(host)) {
      res.status(403).json({ code: 'FORBIDDEN_URL', message: '仅支持缩短本站链接' })
      return
    }

    const apiKey = process.env.SHORTLINK_API_KEY
    if (!apiKey) {
      // 调试：返回线上函数可见的环境变量名（不含值），用于排查配置未生效问题
      const envNames = Object.keys(process.env)
        .filter((k) => !/^(VERCEL|NODE_|PATH|HOME|LANG|TZ|AWS_|HOSTNAME|PWD|SHELL|TERM|USER|NPM|npm_|CI|SHLVL|OLDPWD|_HANDLER)/.test(k))
        .sort()
      res.status(503).json({ code: 'NOT_CONFIGURED', message: '短链服务未配置', debug: { envNames } })
      return
    }

    const resp = await fetch('https://link.rfseo.cn/api/url/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ url }),
    })
    if (!resp.ok) {
      console.error('Shortlink API error:', resp.status)
      res.status(502).json({ code: 'SHORTEN_FAILED', message: '短链服务暂时不可用' })
      return
    }

    const data = await resp.json()
    if (data && data.error === 1) {
      console.error('Shortlink API rejected:', data.message)
      res.status(502).json({ code: 'SHORTEN_FAILED', message: '短链生成失败' })
      return
    }
    const shortUrl = findShortUrl(data)
    if (!shortUrl) {
      res.status(502).json({ code: 'SHORTEN_FAILED', message: '短链生成失败' })
      return
    }
    console.log(`🔗 短链生成 → ${shortUrl}`)
    res.json({ shortUrl })
  } catch (err) {
    console.error('Shorten error:', err)
    res.status(500).json({ code: 'SERVER_ERROR', message: '生成短链失败' })
  }
}
