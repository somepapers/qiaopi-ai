import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import sharp from 'sharp'
import { exhibitionVariants } from '../server/exhibition/images.mjs'

test('首展六份侨批缩略图合计不超过 160 KiB，且每张都有详情图', async () => {
  const directory = new URL('../src/assets/exhibition/qiaopi/', import.meta.url)
  let bytes = 0
  for (let index = 1; index <= 6; index++) {
    const name = '侨批' + index + '.jpg'
    for (const [variant, edge] of [['thumb', 640], ['detail', 1920]]) {
      const file = await readFile(new URL(name + '.' + variant + '.webp', directory))
      const metadata = await sharp(file).metadata()
      assert.equal(metadata.format, 'webp')
      assert.ok(Math.max(metadata.width, metadata.height) <= edge)
      if (variant === 'thumb') bytes += file.length
    }
  }
  assert.ok(bytes <= 160 * 1024, '缩略图合计 ' + bytes + ' 字节')
})

test('自动旋转相机照片，生成两个原比例尺寸', async () => {
  const input = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: '#a05840' } })
    .jpeg().withMetadata({ orientation: 6 }).toBuffer()
  const { thumb, detail, mime } = await exhibitionVariants(input)
  assert.equal(mime, 'image/jpeg')
  for (const [file, width, height] of [[thumb, 320, 640], [detail, 960, 1920]]) {
    const meta = await sharp(file).metadata()
    assert.deepEqual([meta.width, meta.height], [width, height])
  }
})

test('保留小幅 IP 图的透明度和尺寸，拒绝伪装或损坏的图片', async () => {
  const input = await sharp({ create: { width: 48, height: 72, channels: 4, background: '#00000000' } }).png().toBuffer()
  const { thumb, detail } = await exhibitionVariants(input)
  for (const file of [thumb, detail]) {
    const meta = await sharp(file).metadata()
    assert.deepEqual([meta.width, meta.height, meta.hasAlpha], [48, 72, true])
  }
  await assert.rejects(exhibitionVariants(Buffer.from('broken')))
  await assert.rejects(exhibitionVariants(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"/>')))
})
