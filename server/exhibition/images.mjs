import sharp from 'sharp'

export const MAX_BYTES = 20 * 1024 * 1024
export const MAX_PIXELS = 50_000_000

/** Decode by content, reject animated/multipage inputs and preserve transparency. */
export async function exhibitionVariants(input) {
  const pipeline = sharp(input, { limitInputPixels: MAX_PIXELS, failOn: 'warning' })
  const meta = await pipeline.metadata()
  if (!['jpeg', 'png', 'webp'].includes(meta.format) || (meta.pages ?? 1) !== 1) {
    throw new Error('仅支持单帧 JPG、PNG 和 WebP 图片')
  }
  const render = (edge, quality) => pipeline.clone().rotate()
    .resize(edge, edge, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality }).toBuffer()
  const thumb = await render(640, 78)
  const detail = await render(1920, 85)
  return { thumb, detail, mime: 'image/' + meta.format }
}
