import type { ServerResponse } from 'node:http'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream } from 'node:stream/web'
import { get } from '@vercel/blob'
import type { ExhibitionImage } from '../../src/types/exhibition.js'

const workImagePath = /^exhibition\/works\/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\/[a-f0-9]{16}-(?:thumb|detail)\.webp$/i
const blobOrigin = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i

function sameOriginUrl(url: string) {
  const path = url.replace(blobOrigin, '')
  if (path === url || !workImagePath.test(path)) return url
  return '/api/exhibition?' + new URLSearchParams({ action: 'image', path })
}

export function withImageDelivery(item: ExhibitionImage): ExhibitionImage {
  return { ...item, thumb: sameOriginUrl(item.thumb), detail: sameOriginUrl(item.detail) }
}

export async function sendWorkImage(path: unknown, res: ServerResponse) {
  if (typeof path !== 'string' || !workImagePath.test(path)) return false

  // Only the published image namespace in the configured Blob store is readable here.
  const image = await get(path, { access: 'public', abortSignal: AbortSignal.timeout(10_000) })
  if (!image || image.statusCode !== 200) return false
  if (image.blob.contentType !== 'image/webp') {
    await image.stream.cancel()
    throw new Error('Unexpected exhibition image content type')
  }

  res.setHeader('Content-Type', 'image/webp')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=86400')
  // The SDK types the fetch stream with DOM declarations, while Node uses its own Web stream types.
  await pipeline(Readable.fromWeb(image.stream as ReadableStream<Uint8Array>), res)
  return true
}
