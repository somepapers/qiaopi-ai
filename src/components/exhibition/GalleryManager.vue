<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { resolveExhibits } from '@/composables/useExhibitionCatalog'
import type { CatalogAction, ExhibitionImage, Gallery, ManagedCatalog } from '@/types/exhibition'

const gallery = defineModel<Gallery>({ required: true })
const props = defineProps<{
  refresh: number
  disabled: boolean
  request: <T>(action: string, body?: object, gallery?: Gallery) => Promise<T>
}>()
const emit = defineEmits<{ saving: [value: boolean], trashed: [id: string] }>()
const catalog = ref<ManagedCatalog>()
const tab = ref<'active' | 'trash'>('active')
const saving = ref(false)
const notice = ref('')
const error = ref('')
const reload = ref(0)
const rows = computed(() => catalog.value
  ? resolveExhibits(gallery.value, tab.value === 'active' ? catalog.value : catalog.value.trash)
  : [])

function message(e: unknown) {
  return e instanceof Error ? e.message : '网络连接中断，请刷新列表'
}

watch([gallery, () => props.refresh, reload], async ([key], previous, onCleanup) => {
  let current = true
  onCleanup(() => { current = false })
  catalog.value = undefined
  notice.value = error.value = ''
  if (key !== previous[0] || props.refresh !== previous[1]) tab.value = 'active'
  try {
    const data = await props.request<ManagedCatalog>('manage', undefined, key)
    if (current) catalog.value = data
  } catch (e) {
    if (current) error.value = message(e)
  }
}, { immediate: true })

async function change(action: CatalogAction, item: ExhibitionImage, direction?: -1 | 1) {
  if (!catalog.value || saving.value || props.disabled) return
  if (action === 'trash' && !window.confirm('将《' + item.title + '》移入回收站？')) return
  saving.value = true
  emit('saving', true)
  error.value = notice.value = ''
  try {
    catalog.value = await props.request<ManagedCatalog>(action, {
      gallery: gallery.value, id: item.id, revision: catalog.value.revision, direction,
    })
    if (action === 'trash') emit('trashed', item.id)
    const result = action === 'trash' ? '已移入回收站' : action === 'restore' ? '已恢复展出' : '的顺序已保存'
    notice.value = '《' + item.title + '》' + result
  } catch (e) {
    // The write may have succeeded even if its response was lost.
    catalog.value = undefined
    error.value = message(e)
  } finally {
    saving.value = false
    emit('saving', false)
  }
}
</script>

<template>
  <section class="manager" aria-labelledby="catalog-title">
    <div class="heading">
      <h2 id="catalog-title">展品管理</h2>
      <label>展区
        <select v-model="gallery" :disabled="saving || disabled">
          <option value="qiaopi">侨批文化展示</option><option value="ip">团队 IP 设计</option>
        </select>
      </label>
    </div>
    <div class="tabs" role="group" aria-label="展示状态">
      <button :aria-pressed="tab === 'active'" :disabled="saving" @click="tab = 'active'">
        在展作品<span v-if="catalog">（{{ catalog.order.length }}）</span>
      </button>
      <button :aria-pressed="tab === 'trash'" :disabled="saving" @click="tab = 'trash'">
        回收站<span v-if="catalog">（{{ catalog.trash.order.length }}）</span>
      </button>
    </div>
    <p v-if="error" role="alert" class="feedback">{{ error }} <button @click="reload++">刷新列表</button></p>
    <p v-else-if="!catalog" role="status" class="feedback">正在读取展品…</p>
    <template v-else>
      <p v-if="!rows.length" class="feedback">{{ tab === 'active' ? '这个展区暂无在展作品。' : '这个展区的回收站为空。' }}</p>
      <ol v-else :aria-label="tab === 'active' ? '在展作品' : '回收站'">
        <li v-for="(item, index) in rows" :key="item.id">
          <span v-if="tab === 'active'" class="position">{{ index + 1 }}</span>
          <img :src="item.thumb" alt="" loading="lazy" width="64" height="56" />
          <div class="caption"><strong>{{ item.title }}</strong><small>{{ item.credit }}</small></div>
          <div class="controls" role="group" :aria-label="item.title">
            <template v-if="tab === 'active'">
              <button :disabled="disabled || saving || index === 0" @click="change('move', item, -1)">上移</button>
              <button :disabled="disabled || saving || index === rows.length - 1" @click="change('move', item, 1)">下移</button>
              <button class="trash" :disabled="disabled || saving" @click="change('trash', item)">移入回收站</button>
            </template>
            <button v-else :disabled="disabled || saving" @click="change('restore', item)">恢复</button>
          </div>
        </li>
      </ol>
      <p role="status" class="feedback" v-if="saving || notice">{{ saving ? '正在保存…' : notice }}</p>
    </template>
  </section>
</template>

<style scoped>
.manager { margin-top: 1.4rem; padding: clamp(1rem, 3vw, 2rem); border: 1px solid #75533836; background: #fffaf2; }
.heading, .tabs, li, .controls { display: flex; align-items: center; gap: .65rem; }
.heading { justify-content: space-between; flex-wrap: wrap; }
h2 { font-size: 1.3rem; font-weight: 600; }
label, .tabs, button { font-size: .9rem; }
select, .controls button { border: 1px solid #aa937a; background: #fffdf8; padding: .45rem .65rem; }
select { margin-left: .35rem; }
.tabs { margin-top: .9rem; border-bottom: 1px solid #75533836; }
.tabs button { padding: .65rem .35rem; border-bottom: 2px solid transparent; }
.tabs [aria-pressed=true] { border-color: #853a2d; color: #853a2d; font-weight: 600; }
li { padding: .75rem 0; border-bottom: 1px solid #75533826; }
.position { min-width: 1.5ch; color: #805746; font-variant-numeric: tabular-nums; }
li img { width: 4rem; height: 3.5rem; object-fit: contain; background: #efe5d4; }
.caption { flex: 1; min-width: 0; overflow-wrap: anywhere; }
small { display: block; color: #695746; font-size: .8rem; }
.controls { gap: .4rem; }
.trash, .feedback button { color: #873b2d; }
.feedback { margin-top: .8rem; color: #695746; font-size: .9rem; }
.feedback button { text-decoration: underline; }
button:disabled { opacity: .45; }
@media (max-width: 600px) {
  li { flex-wrap: wrap; }
  .controls { width: 100%; justify-content: flex-end; }
  .controls button { min-height: 2.75rem; }
}
</style>
