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

export interface ExhibitionCatalog {
  order: string[]
  items: ExhibitionImage[]
}

export interface ManagedCatalog extends ExhibitionCatalog {
  revision: number
  trash: ExhibitionCatalog
}

export type CatalogAction = 'move' | 'trash' | 'restore'
