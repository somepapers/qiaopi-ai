<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import type { ExhibitionImage } from '@/types/exhibition'
import { featured } from '@/assets/exhibition/featured'
import FeaturedReading from './FeaturedReading.vue'

const props = defineProps<{ item: ExhibitionImage, index: number, total: number }>()
const emit = defineEmits<{ close: [], move: [direction: number] }>()
const dialog = ref<HTMLDialogElement>()
const ready = ref('')
const failed = ref(false)
const attempt = ref(0)
let previousOverflow = ''
let trigger: HTMLElement | null = null

watch(() => [props.item.detail, attempt.value], async (_, __, onCleanup) => {
  const image = new Image()
  let current = true
  onCleanup(() => { current = false; image.removeAttribute('src') })
  ready.value = ''
  failed.value = false
  image.decoding = 'async'
  image.src = props.item.detail
  try {
    await image.decode()
    if (current) ready.value = image.src
  } catch {
    if (current) failed.value = true
  }
}, { immediate: true })

onMounted(() => {
  trigger = document.activeElement as HTMLElement | null
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  dialog.value?.showModal()
})
onBeforeUnmount(() => {
  dialog.value?.close()
  document.body.style.overflow = previousOverflow
  trigger?.focus({ preventScroll: true })
})
</script>
<template>
  <Teleport to="body">
    <dialog ref="dialog" class="viewer" :aria-label="item.title" @cancel.prevent="emit('close')"
      @keydown.left.prevent="emit('move', -1)" @keydown.right.prevent="emit('move', 1)">
      <div class="viewer-inner" :class="{ 'with-reading': item.id === featured.id }" @click.self="emit('close')">
        <button autofocus class="close" aria-label="关闭" @click="emit('close')">关闭 ×</button>
        <FeaturedReading v-if="item.id === featured.id" :src="ready || item.thumb" />
        <div v-else class="frame" @click.self="emit('close')">
          <img :src="ready || item.thumb" :alt="item.title" />
        </div>
        <div class="controls">
          <button v-if="total > 1" aria-label="上一张" @click="emit('move', -1)">‹</button>
          <div aria-live="polite" class="info">
            <small>{{ index + 1 }} / {{ total }}</small><h2>{{ item.title }}</h2>
            <p v-if="item.credit">{{ item.credit }}</p><p v-if="item.desc">{{ item.desc }}</p>
            <button v-if="failed" class="retry" @click="attempt++">详情图未加载 · 重试</button>
            <small v-else-if="!ready">正在加载细节…</small>
          </div>
          <button v-if="total > 1" aria-label="下一张" @click="emit('move', 1)">›</button>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>
<style scoped>
.viewer[open] {
  position: fixed;
  inset: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  background: #251e19;
  color: #faefdd;
  border: 0;
}
.viewer::backdrop {
  background: #251e19;
}
.viewer-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem clamp(1rem,4vw,4rem);
  gap: .65rem;
}
.close {
  align-self: flex-end;
  padding: .45rem .9rem;
  border: 1px solid #ffffff50;
}
.with-reading {
  height: auto;
  min-height: 100%;
  gap: 1rem;
}
.with-reading .close { position: sticky; top: .5rem; z-index: 1; background: #251e19; }
.frame {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.frame img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.controls {
  display: flex;
  width: min(42rem,100%);
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.controls>button {
  width: 2.8rem;
  height: 2.8rem;
  border: 1px solid #ffffff50;
  font-size: 1.65rem;
  flex-shrink: 0;
}
.info {
  text-align: center;
  flex: 1;
  max-height: 29dvh;
  overflow: auto;
  overflow-wrap: anywhere;
}
.info h2 {
  font-size: 1.15rem;
}
.info small,.info p,.retry {
  font-size: .82rem;
  color: #e0d4c3;
}
.retry {
  text-decoration: underline;
}
</style>
