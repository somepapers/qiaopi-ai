export type Gallery = 'qiaopi' | 'ip'

export interface ExhibitCaption {
  title: string
  credit: string
  desc?: string
  titleEn?: string
  creditEn?: string
  descEn?: string
}

export interface ExhibitionImage extends ExhibitCaption {
  id: string
  gallery: Gallery
  thumb: string
  detail: string
}

export interface ExhibitionImageMeta {
  title?: string
  credit?: string
  desc?: string
  sort?: number
}

export interface ExhibitionCatalog {
  order: string[]
  items: ExhibitionImage[]
}

export interface ManagedCatalog extends ExhibitionCatalog {
  revision: number
  trash: ExhibitionCatalog
}

export type CatalogAction = 'move' | 'trash' | 'restore'
