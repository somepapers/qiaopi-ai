import type { ExhibitionImageMeta } from '@/types/exhibition'

export const QIAOPI_META: Record<string, ExhibitionImageMeta> = Object.fromEntries(
  ['一', '二', '三', '四', '五', '六'].map((number, index) => [
    '侨批' + (index + 1) + '.jpg',
    { title: '侨批原件展示（' + number + '）', credit: '福建省档案馆' },
  ]),
)

export const IP_META: Record<string, ExhibitionImageMeta> = {
  '侨燕.jpg': { title: '团队吉祥物“侨燕”', credit: '寻侨迹，传侨魂 · 实践团队', sort: -2 },
  '侨燕马克杯.jpg': { title: '“侨燕”主题马克杯', credit: '寻侨迹，传侨魂 · 实践团队', sort: -1 },
}
