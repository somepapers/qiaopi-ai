import type { ExhibitionImage, ExhibitionImageMeta } from '@/types/exhibition'
import { IP_META, QIAOPI_META } from '@/utils/exhibitionMeta'

/**
 * 展览馆图片数据层：用 import.meta.glob 自动发现目录中的图片。
 * 放图进 qiaopi/ 或 ip/ 目录即自动出现在页面上，无需改代码；
 * 构建时图片带内容哈希进入 dist/assets/，命中 vercel.json 的 immutable 一年缓存。
 *
 * 注意：glob 模式必须是字面量（Vite 构建期静态分析，不能用运行时拼接），故两个目录分别写死。
 * eager: true 只是把 URL 字符串内联进 JS（每张几十字节），
 * 图片下载仍由 <img> 渲染时机 + loading="lazy" 决定。
 */
const qiaopiFiles = import.meta.glob<string>('./qiaopi/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const ipFiles = import.meta.glob<string>('./ip/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** 文件名自然排序：中文 locale + numeric，保证「侨批10」排在「侨批2」之后 */
function compareFileName(a: string, b: string): number {
  return a.localeCompare(b, 'zh-Hans-CN', { numeric: true })
}

function buildImages(files: Record<string, string>, meta: Record<string, ExhibitionImageMeta>): ExhibitionImage[] {
  return Object.entries(files)
    .map(([path, src]) => {
      const fileName = path.split('/').pop() ?? path
      const m = meta[fileName] ?? {}
      return {
        src,
        fileName,
        title: m.title ?? fileName.replace(/\.[^.]+$/, ''),
        ...(m.desc !== undefined ? { desc: m.desc } : {}),
        ...(m.sort !== undefined ? { sort: m.sort } : {}),
      }
    })
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || compareFileName(a.fileName, b.fileName))
}

/** 侨批文化展示区图片 */
export const qiaopiImages: ExhibitionImage[] = buildImages(qiaopiFiles, QIAOPI_META)

/** 团队IP设计区图片（素材就绪后自动出现） */
export const ipImages: ExhibitionImage[] = buildImages(ipFiles, IP_META)
