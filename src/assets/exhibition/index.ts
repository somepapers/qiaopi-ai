import type { ExhibitionImage, ExhibitionImageMeta, Gallery } from '@/types/exhibition'
import { IP_META, QIAOPI_META } from '@/utils/exhibitionMeta'

const urls = import.meta.glob<string>('./{qiaopi,ip}/*.{thumb,detail}.webp', {
  eager: true, query: '?url&no-inline', import: 'default',
})

function collection(gallery: Gallery, meta: Record<string, ExhibitionImageMeta>): ExhibitionImage[] {
  const prefix = './' + gallery + '/'
  return Object.keys(urls)
    .filter(key => key.startsWith(prefix) && key.endsWith('.thumb.webp'))
    .map(key => key.slice(prefix.length, -'.thumb.webp'.length))
    .sort((a, b) => (meta[a]?.sort ?? 0) - (meta[b]?.sort ?? 0) || a.localeCompare(b, 'zh-CN', { numeric: true }))
    .map(name => {
      const info = meta[name]
      const detail = urls[prefix + name + '.detail.webp']
      if (!detail) throw new Error('展品缺少详情图：' + name)
      return {
        id: gallery + '-' + name, gallery,
        title: info?.title ?? name.replace(/\.[^.]+$/, ''),
        credit: info?.credit ?? '', desc: info?.desc,
        thumb: urls[prefix + name + '.thumb.webp'], detail,
      }
    })
}

export const qiaopiImages = collection('qiaopi', QIAOPI_META)
export const ipImages = collection('ip', IP_META)
