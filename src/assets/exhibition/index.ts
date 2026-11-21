import type { ExhibitionImage, ExhibitionImageMeta, Gallery } from '@/types/exhibition'
import { builtInFiles, IP_META, QIAOPI_META } from '../../../server/exhibition/builtins.js'

const urls = import.meta.glob<string>('./{qiaopi,ip}/*.{thumb,detail}.webp', {
  eager: true, query: '?url&no-inline', import: 'default',
})

function collection(gallery: Gallery, meta: Record<string, ExhibitionImageMeta>): ExhibitionImage[] {
  const prefix = './' + gallery + '/'
  return builtInFiles(gallery).map(name => {
    const info = meta[name]
    const detail = urls[prefix + name + '.detail.webp']
    const thumb = urls[prefix + name + '.thumb.webp']
    if (!thumb || !detail) throw new Error('展品缺少图片：' + name)
    return {
      id: gallery + '-' + name, gallery,
      title: info?.title ?? name.replace(/\.[^.]+$/, ''),
      credit: info?.credit ?? '', desc: info?.desc,
      thumb, detail,
    }
  })
}

export const qiaopiImages = collection('qiaopi', QIAOPI_META)
export const ipImages = collection('ip', IP_META)
