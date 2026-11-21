import { readonly, ref, watchEffect } from 'vue'
import interfaceText from './interface.en.json'
import fieldwork from './fieldwork.en.json'
import letters from './letters.en.json'

export type Locale = 'zh-CN' | 'en'
const storageKey = 'qiaopi.locale'
const english: Record<string, string> = { ...interfaceText, ...fieldwork, ...letters }
const current = ref<Locale>('zh-CN')
export const locale = readonly(current)

export function t(source: string | undefined | null, values?: Record<string, string | number>): string {
  if (!source) return ''
  const message = current.value === 'en' && Object.hasOwn(english, source) ? english[source]! : source
  return values ? message.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match)) : message
}

export function setLocale(value: Locale) {
  current.value = value
  try { localStorage.setItem(storageKey, value) } catch { /* Language still works for this visit. */ }
}

export function initializeLocale() {
  try { if (localStorage.getItem(storageKey) === 'en') current.value = 'en' } catch { /* Use Chinese by default. */ }
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  const originalDescription = description?.content
  watchEffect(() => {
    document.documentElement.lang = current.value
    document.title = t('寻侨迹，传侨魂')
    if (description && originalDescription) description.content = t(originalDescription)
  })
}
