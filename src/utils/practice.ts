import type { PracticeRecord } from '@/data/practice'

declare const __PRACTICE_RECORDS__: PracticeRecord[]
const photos = import.meta.glob('../assets/practice/*.webp', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>

export const publishedRecords: PracticeRecord[] = __PRACTICE_RECORDS__.map(record => ({
  ...record,
  photos: record.photos.map(photo => ({
    ...photo,
    src: photo.src.startsWith('practice:')
      ? photos[`../assets/practice/${photo.src.slice('practice:'.length)}`] ?? photo.src
      : photo.src,
  })),
}))
