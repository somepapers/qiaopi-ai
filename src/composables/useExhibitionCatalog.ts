import { computed, ref, toValue, watch, type MaybeRef } from 'vue'
import { ipImages, qiaopiImages } from '@/assets/exhibition'
import { featured } from '@/assets/exhibition/featured'
import { locale, t } from '@/i18n'
import type { ExhibitCaption, ExhibitionCatalog, ExhibitionImage, Gallery } from '@/types/exhibition'

const collections = { ip: ipImages, qiaopi: qiaopiImages }

export function exhibitCaption(item: ExhibitCaption) {
  if (locale.value === 'zh-CN') return { title: item.title, credit: item.credit, desc: item.desc }
  return { title: item.titleEn || t(item.title), credit: item.creditEn || t(item.credit), desc: item.descEn || t(item.desc) }
}

export function resolveExhibits(gallery: Gallery, page: ExhibitionCatalog): ExhibitionImage[] {
  const byId = new Map([...collections[gallery], ...page.items].map(item => [item.id, item]))
  return page.order.flatMap(id => {
    const item = byId.get(id)
    return item ? [{ ...item, ...exhibitCaption(item) }] : []
  })
}

export function useExhibitionCatalog(gallery: MaybeRef<Gallery>) {
  const catalog = ref<ExhibitionCatalog>()
  const items = computed(() => {
    const key = toValue(gallery)
    if (import.meta.env.VITE_EXHIBITION_STATIC === 'true') {
      return collections[key].map(item => ({ ...item, ...exhibitCaption(item) }))
    }
    return catalog.value ? resolveExhibits(key, catalog.value) : []
  })
  const state = ref<'loading' | 'ready' | 'error'>('loading')
  const attempt = ref(0)
  watch([() => toValue(gallery), attempt], async ([key], _, onCleanup) => {
    if (import.meta.env.VITE_EXHIBITION_STATIC === 'true') {
      state.value = 'ready'
      return
    }
    const controller = new AbortController()
    onCleanup(() => controller.abort())
    catalog.value = undefined
    state.value = 'loading'
    try {
      const response = await fetch('/api/exhibition?gallery=' + key, { signal: controller.signal, cache: 'no-store' })
      if (!response.ok) throw new Error()
      const page = await response.json() as ExhibitionCatalog
      if (!Array.isArray(page.order) || !Array.isArray(page.items)) throw new Error()
      if (!controller.signal.aborted) {
        catalog.value = page
        state.value = 'ready'
      }
    } catch {
      if (!controller.signal.aborted) state.value = 'error'
    }
  }, { immediate: true })
  return { items, state, retry: () => { attempt.value++ } }
}

export function useFeaturedExhibit() {
  const { items, state, retry } = useExhibitionCatalog('qiaopi')
  return { visible: computed(() => items.value.some(item => item.id === featured.id)), state, retry }
}
