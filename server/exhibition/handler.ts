import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage } from 'node:http'
import { kv } from '@vercel/kv'
import { BlobNotFoundError, del, get, head, put } from '@vercel/blob'
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'
import { exhibitionVariants, MAX_BYTES } from './images.mjs'
import { appendPublication, catalogPage, editCatalog, initialCatalog, managedCatalog, prefix, Problem, publishedItem, readCatalog } from './catalog.js'
import type { ExhibitionImage, Gallery } from '../../src/types/exhibition.js'

type Request = Pick<IncomingMessage, 'headers' | 'socket' | 'method'> & {
  query: Record<string, unknown>
  body?: Record<string, unknown>
}
interface ResponseWriter {
  setHeader(name: string, value: string): unknown
  status(code: number): ResponseWriter
  json(data: unknown): unknown
}

const cookieName = 'exhibition_session'
const sessionAge = 8 * 3600
const extensions = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']])
const digest = (text: string) => createHash('sha256').update(text).digest()
function galleryOf(value: unknown): Gallery {
  if (value === 'qiaopi' || value === 'ip') return value
  throw new Problem(400, '请选择有效的展区')
}
function textField(input: unknown, max: number, optional = false) {
  if (optional && input === undefined) return ''
  if (typeof input !== 'string' || (!optional && !input.trim()) || input.trim().length > max) {
    throw new Problem(400, '请检查展品标题、来源和说明的长度')
  }
  return input.trim()
}
function uploadInfo(body: Record<string, unknown>) {
  const { id, mime } = body
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ||
      typeof mime !== 'string' || !extensions.has(mime)) throw new Problem(400, '图片或上传编号无效')
  return { id, mime, pathname: 'exhibition/incoming/' + id + '.' + extensions.get(mime) }
}
function sessionKey(token: string, password: string) {
  return prefix + 'session:' + digest(password + ':' + token).toString('hex')
}
function cookie(token: string, age: number) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return cookieName + '=' + token + '; HttpOnly; SameSite=Strict; Path=/api/exhibition; Max-Age=' + age + secure
}
async function login(req: Request, res: ResponseWriter, password: string) {
  const ip = process.env.VERCEL ? req.headers['x-vercel-forwarded-for'] ?? req.headers['x-forwarded-for'] : req.socket.remoteAddress
  const key = prefix + 'login:' + digest(String(ip).split(',')[0].trim()).toString('hex')
  const attempts = await kv.eval<[], number>(
    `local attempts = redis.call('INCR', KEYS[1])
     if attempts == 1 then redis.call('EXPIRE', KEYS[1], 900) end
     return attempts`,
    [key], [],
  )
  if (attempts > 5) throw new Problem(429, '尝试次数过多，请在 15 分钟后再试')
  const supplied = req.body?.password
  if (typeof supplied !== 'string' || !timingSafeEqual(digest(supplied), digest(password))) throw new Problem(401, '管理口令不正确')
  const token = randomBytes(32).toString('hex')
  await kv.set(sessionKey(token, password), 1, { ex: sessionAge })
  await kv.del(key)
  res.setHeader('Set-Cookie', cookie(token, sessionAge))
  return { authenticated: true }
}

async function authorize(body: Record<string, unknown>) {
  const { pathname, mime, id } = uploadInfo(body)
  if (!Number.isSafeInteger(body.size) || Number(body.size) <= 0 || Number(body.size) > MAX_BYTES) throw new Problem(413, '单张图片须在 20 MB 以内')
  // A lost response after a successful PUT or publication must be safe to retry.
  const published = await publishedItem(id)
  if (published) return { published }
  try {
    await head(pathname)
    return { uploaded: true }
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error
  }
  const token = await generateClientTokenFromReadWriteToken({
    token: process.env.BLOB_READ_WRITE_TOKEN, pathname, maximumSizeInBytes: MAX_BYTES, allowedContentTypes: [mime],
    validUntil: Date.now() + 10 * 60_000, addRandomSuffix: false, allowOverwrite: false, cacheControlMaxAge: 60,
  })
  return { pathname, token }
}
async function publish(body: Record<string, unknown>) {
  const { id, mime, pathname } = uploadInfo(body)
  const gallery = galleryOf(body.gallery)
  const title = textField(body.title, 80)
  const credit = textField(body.credit, 120)
  const desc = textField(body.desc, 600, true)
  const titleEn = textField(body.titleEn, 160, true)
  const creditEn = textField(body.creditEn, 240, true)
  const descEn = textField(body.descEn, 1800, true)
  const existing = await publishedItem(id)
  if (existing) return existing
  const source = await get(pathname, { access: 'public', useCache: false })
  if (!source || source.statusCode !== 200) {
    const concurrent = await publishedItem(id)
    if (concurrent) return concurrent
    throw new Problem(409, '原图尚未传完，请重试发布')
  }
  if (source.blob.size > MAX_BYTES) {
    await source.stream.cancel()
    throw new Problem(413, '原图超过 20 MB')
  }
  const input = Buffer.from(await new Response(source.stream).arrayBuffer())
  if (input.length > MAX_BYTES) throw new Problem(413, '原图超过 20 MB')
  let variants
  try {
    variants = await exhibitionVariants(input)
    if (variants.mime !== mime) throw new Error('类型不符')
  } catch {
    await del(pathname).catch(() => {})
    throw new Problem(422, '图片损坏、类型不符或尺寸过大，请选择 5000 万像素以内的单帧 JPG、PNG 或 WebP')
  }
  // Paths include a content version. Retrying a partial pair writes identical bytes.
  const base = 'exhibition/works/' + id + '/' + createHash('sha256').update(variants.detail).digest('hex').slice(0, 16)
  const options = { access: 'public', contentType: 'image/webp', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 31536000 } as const
  const thumb = await put(base + '-thumb.webp', variants.thumb, options)
  const detail = await put(base + '-detail.webp', variants.detail, options)
  const item: ExhibitionImage = { id, gallery, title, credit, desc, titleEn, creditEn, descEn, thumb: thumb.url, detail: detail.url }
  const result = await appendPublication(item)
  await del(pathname).catch(error => console.warn('展览馆原图清理未完成', error?.name))
  return result
}

export default async function exhibition(req: Request, res: ResponseWriter) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const action = req.query.action
    let result: unknown
    if (req.method === 'GET' && !action) {
      const gallery = galleryOf(req.query.gallery)
      const builtInOnly = !process.env.KV_REST_API_URL && !process.env.KV_REST_API_TOKEN
      result = catalogPage(builtInOnly ? initialCatalog(gallery) : await readCatalog(gallery))
    } else {
      const password = process.env.EXHIBITION_ADMIN_PASSWORD
      if (!password || !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN || !process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Problem(503, '团队后台尚未配置管理口令或展品存储')
      }
      const token = (req.headers.cookie ?? '').split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='))?.slice(cookieName.length + 1)
      const key = token && /^[a-f0-9]{64}$/.test(token) ? sessionKey(token, password) : null
      if (req.method === 'GET' && action === 'session') {
        result = { authenticated: Boolean(key && await kv.get(key)) }
      } else if (req.method === 'GET' && action === 'manage') {
        if (!key || !await kv.get(key)) throw new Problem(401, '请先登录团队后台')
        result = managedCatalog(await readCatalog(galleryOf(req.query.gallery)))
      } else {
        if (req.method !== 'POST') throw new Problem(405, '请求方式不正确')
        if (req.headers['x-exhibition-request'] !== '1' || !req.headers['content-type']?.startsWith('application/json')) {
          throw new Problem(403, '请求来源无效')
        }
        if (action === 'login') result = await login(req, res, password)
        else {
          if (!key || !await kv.get(key)) throw new Problem(401, '请先登录团队后台')
          if (action === 'logout') {
            await kv.del(key)
            res.setHeader('Set-Cookie', cookie('', 0))
            result = { authenticated: false }
          } else if (action === 'authorize') result = await authorize(req.body ?? {})
          else if (action === 'publish') result = { item: await publish(req.body ?? {}) }
          else if (action === 'move' || action === 'trash' || action === 'restore') {
            result = await editCatalog(galleryOf(req.body?.gallery), action, req.body ?? {})
          }
          else throw new Problem(404, '操作不存在')
        }
      }
    }
    res.status(200).json(result)
  } catch (error) {
    if (!(error instanceof Problem)) console.warn('展览馆存储暂不可用', (error as Error)?.name)
    res.status(error instanceof Problem ? error.status : 503).json({
      message: error instanceof Problem ? error.message : '在线展品服务暂时不可用，请稍后重试',
    })
  }
}
