import photo from './qiaopi/侨批4.jpg.detail.webp'
import { QIAOPI_META } from '@/utils/exhibitionMeta'

const filename = '侨批4.jpg'
const id = 'qiaopi-' + filename
const meta = QIAOPI_META[filename]!

export const featured = {
  id, photo, title: meta.title, credit: meta.credit,
  to: { name: 'exhibition', query: { tab: 'qiaopi', work: id } },
  guide: '看红框的左端，几处浅褐色的缺口截断了墨字旁的红线。',
  location: '红框左端的转角',
  reading: '红线在这里折成两个角。沿着上边的线往右看，纸面几处剥落，红线和旁边的黑色笔画都出现了断口。再看全图，红框外也写着一行行墨字。',
  // 以整张影像的左上角为起点，宽和高各取原图的同一比例。
  crop: { left: 0.32, top: 0.38, fraction: 0.32 },
}
