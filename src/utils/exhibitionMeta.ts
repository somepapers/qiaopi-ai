import type { ExhibitionImageMeta } from '@/types/exhibition'

/**
 * 展览馆图片的标题/说明/排序覆盖映射，按源文件名（含扩展名）索引。
 * 未收录的文件 fallback 标题 = 去扩展名的文件名；想改标题只改这里，不动图片。
 */

/** 侨批文化展示区（src/assets/exhibition/qiaopi/） */
export const QIAOPI_META: Record<string, ExhibitionImageMeta> = {
  '侨批1.jpg': { title: '侨批原件展示（一）' },
  '侨批2.jpg': { title: '侨批原件展示（二）' },
  '侨批3.jpg': { title: '侨批原件展示（三）' },
  '侨批4.jpg': { title: '侨批原件展示（四）' },
  '侨批5.jpg': { title: '侨批原件展示（五）' },
  '侨批6.jpg': { title: '侨批原件展示（六）' },
}

/** 团队IP设计区（src/assets/exhibition/ip/）——素材就绪后在此补充 */
export const IP_META: Record<string, ExhibitionImageMeta> = {}
