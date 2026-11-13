import type { ExhibitionImageMeta } from '@/types/exhibition'

export const QIAOPI_META: Record<string, ExhibitionImageMeta> = {
  '侨批1.jpg': { title: '侨批原件展示（一）', credit: '福建省档案馆' },
  '侨批2.jpg': { title: '侨批原件展示（二）', credit: '福建省档案馆' },
  '侨批3.jpg': { title: '侨批原件展示（三）', credit: '云霄县收藏家协会' },
  '侨批4.jpg': { title: '侨批原件展示（四）', credit: '云霄县收藏家协会' },
  '侨批5.jpg': { title: '侨批原件展示（五）', credit: '晋江市吾林村落侨批馆' },
  '侨批6.jpg': { title: '侨批原件展示（六）', credit: '晋江市吾林村落侨批馆' },
}

export const IP_META: Record<string, ExhibitionImageMeta> = {
  '侨燕.jpg': { title: '团队吉祥物“侨燕”', credit: '闽江大学“寻侨迹，传侨魂”社会实践团队', sort: -2 },
  '侨燕马克杯.jpg': { title: '“侨燕”主题马克杯', credit: '闽江大学“寻侨迹，传侨魂”社会实践团队', sort: -1 },
}
