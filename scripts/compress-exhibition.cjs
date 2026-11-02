// 团队素材库 → Vite 内容哈希资源。源稿无需随线上站点部署。
const fs = require('node:fs/promises')
const path = require('node:path')
const { existsSync } = require('node:fs')

async function main() {
  const { exhibitionVariants } = await import('../server/exhibition/images.mjs')
  const force = process.argv.includes('--force')
  const prune = !process.argv.includes('--no-prune')
  const seal = '侨批印章设计.png'
  for (const [folder, gallery] of [['侨批展示库', 'qiaopi'], ['IP素材库', 'ip']]) {
    const output = path.join('src/assets/exhibition', gallery)
    const present = existsSync(folder)
    const files = present ? (await fs.readdir(folder)).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).map(f => path.join(folder, f)) : []
    if (gallery === 'ip' && existsSync(seal) && !files.some(f => path.basename(f) === seal)) files.push(seal)
    await fs.mkdir(output, { recursive: true })
    const kept = new Set()
    for (const file of files) {
      const base = path.basename(file)
      const thumb = path.join(output, base + '.thumb.webp')
      const detail = path.join(output, base + '.detail.webp')
      kept.add(path.basename(thumb))
      kept.add(path.basename(detail))
      const source = await fs.stat(file)
      if (!force && existsSync(thumb) && existsSync(detail) &&
          Math.min((await fs.stat(thumb)).mtimeMs, (await fs.stat(detail)).mtimeMs) >= source.mtimeMs) continue
      const variants = await exhibitionVariants(await fs.readFile(file))
      await fs.writeFile(thumb, variants.thumb)
      await fs.writeFile(detail, variants.detail)
      console.log(base, Math.ceil(variants.thumb.length / 1024) + ' KiB 缩略图')
    }
    if (prune && present) {
      for (const name of await fs.readdir(output)) {
        // 首展印章的源稿只保存在团队本机，干净检出仍保留已提交的展图。
        if (gallery === 'ip' && name.startsWith(seal + '.')) continue
        if (/\.(thumb|detail)\.webp$/.test(name) && !kept.has(name)) await fs.unlink(path.join(output, name))
      }
    }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
