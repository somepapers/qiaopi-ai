/** 展览馆展示图（由 import.meta.glob 自动发现 + 元数据映射合并而成） */
export interface ExhibitionImage {
  /** 构建后的最终图片 URL（带内容哈希） */
  src: string
  /** 源文件名（含扩展名），如「侨批1.jpg」 */
  fileName: string
  /** 展示标题（优先取元数据映射，fallback 为去扩展名的文件名） */
  title: string
  /** 展示说明文字（可选） */
  desc?: string
  /** 显式排序权重，数值小者在前；未设置时按文件名中文自然排序 */
  sort?: number
}

/** 单张图的元数据覆盖：在 src/utils/exhibitionMeta.ts 中按文件名索引 */
export interface ExhibitionImageMeta {
  title?: string
  desc?: string
  sort?: number
}
