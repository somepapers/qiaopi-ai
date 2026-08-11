import LZString from 'lz-string'
import type { Relationship } from '@/types/letter'

// 分享链接：把信件内容压缩编码进 URL 的 hash 片段，无需数据库。
// hash 片段不会发送到服务器，内容仅存在于链接本身，隐私最佳。

export interface SharePayload {
  v: number
  content: string
  relationship?: Relationship
  toLocation?: string
  fromLocation?: string
  senderName?: string
  remittanceAmount?: string
}

const CURRENT_VERSION = 1

// 压缩时使用短键名以减小体积
interface CompactPayload {
  v: number
  c: string
  r?: Relationship
  t?: string
  f?: string
  s?: string
  a?: string
}

export function encodeLetter(payload: SharePayload): string {
  const compact: CompactPayload = {
    v: payload.v || CURRENT_VERSION,
    c: payload.content,
    r: payload.relationship,
    t: payload.toLocation,
    f: payload.fromLocation,
    s: payload.senderName,
    a: payload.remittanceAmount,
  }
  const json = JSON.stringify(compact)
  return LZString.compressToEncodedURIComponent(json)
}

export function decodeLetter(code: string): SharePayload | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(code)
    if (!json) return null
    const c = JSON.parse(json) as Partial<CompactPayload>
    if (!c || typeof c.c !== 'string' || !c.c.trim()) return null
    return {
      v: c.v ?? CURRENT_VERSION,
      content: c.c,
      relationship: c.r,
      toLocation: c.t,
      fromLocation: c.f,
      senderName: c.s,
      remittanceAmount: c.a,
    }
  } catch {
    return null
  }
}

export function buildShareUrl(payload: SharePayload): string {
  const code = encodeLetter(payload)
  return `${window.location.origin}/l#${code}`
}

// 从当前地址的 hash 片段读取分享内容（收信页使用）
export function readSharedFromHash(): SharePayload | null {
  const hash = window.location.hash
  if (!hash || hash.length < 2) return null
  return decodeLetter(hash.slice(1))
}
