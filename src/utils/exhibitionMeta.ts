import type { ExhibitionImageMeta } from '@/types/exhibition'

export const QIAOPI_META: Record<string, ExhibitionImageMeta> = Object.fromEntries(
  ['一', '二', '三', '四', '五', '六'].map((number, index) => [
    '侨批' + (index + 1) + '.jpg',
    { title: '侨批原件展示（' + number + '）', credit: '福建省档案馆' },
  ]),
)

export const IP_META: Record<string, ExhibitionImageMeta> = {
  '侨批印章设计.png': { title: '侨批印章设计', credit: '寻侨迹，传侨魂 · 实践团队', desc: '团队视觉设计', sort: -1 },
}
