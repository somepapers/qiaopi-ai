interface Photo {
  src: string
  alt: string
  caption: string
}

export interface PracticeRecord {
  slug: string
  status: 'draft' | 'published'
  title: string
  date: string // 活动日期，YYYY-MM-DD
  location: string
  summary: string
  lead: string
  paragraphs: string[]
  photos: [Photo, ...Photo[]] // 第一张同时作为首页照片
}

export const records: PracticeRecord[] = []
