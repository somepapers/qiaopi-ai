export type Gallery = 'qiaopi' | 'ip'

export interface ExhibitionImage {
  id: string
  gallery: Gallery
  title: string
  credit: string
  desc?: string
  thumb: string
  detail: string
}

export interface ExhibitionImageMeta {
  title?: string
  credit?: string
  desc?: string
  sort?: number
}
