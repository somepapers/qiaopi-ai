<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ExhibitionImage } from '@/types/exhibition'

const props = defineProps<{ images: ExhibitionImage[] }>()
const index = defineModel<number>('index', { required: true })
const emit = defineEmits<{ close: [] }>()

/** 过渡状态：挂载后置 true 播放 enter；关闭时先置 false 播放 leave，播完再通知父组件卸载 */
const visible = ref(false)
const imageLoaded = ref(false)
let lastFocused: HTMLElement | null = null

const total = computed(() => props.images.length)
const current = computed(() => props.images[index.value] ?? null)

function prev() {
  index.value = (index.value - 1 + total.value) % total.value
}
function next() {
  index.value = (index.value + 1) % total.value
}

function close() {
  visible.value = false
  setTimeout(() => emit('close'), 200)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
}

/** 预加载左右邻图：切换零等待 */
function preloadNeighbors() {
  const n = total.value
  if (n <= 1) return
  for (const offset of [-1, 1]) {
    const img = props.images[(index.value + offset + n) % n]
    new Image().src = img.src
  }
}

watch(index, () => {
  imageLoaded.value = false
  preloadNeighbors()
})

onMounted(() => {
  lastFocused = document.activeElement as HTMLElement | null
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
  nextTick(() => {
    visible.value = true
  })
  preloadNeighbors()
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
  lastFocused?.focus?.()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div
        v-if="visible && current"
        class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink/95 px-4 py-6"
        role="dialog"
        aria-modal="true"
        :aria-label="current.title"
        @click.self="close"
      >
        <!-- 关闭按钮 -->
        <button
          type="button"
          class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-paper-light/70 hover:text-paper-light hover:bg-paper-light/10 transition-colors text-2xl font-serif"
          aria-label="关闭"
          @click="close"
        >
          ✕
        </button>

        <!-- 图片区：点击空白处关闭，点击图片本体不关闭 -->
        <div class="relative flex-1 min-h-0 w-full flex items-center justify-center" @click.self="close">
          <div v-if="!imageLoaded" class="absolute w-10 h-10 rounded-full border-2 border-paper-light/30 border-t-paper-light animate-spin"></div>
          <img
            :key="current.src"
            :src="current.src"
            :alt="current.title"
            class="max-w-full max-h-full object-contain select-none transition-opacity duration-300"
            :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
            @load="imageLoaded = true"
          />
        </div>

        <!-- 左右切换（首尾循环） -->
        <button
          v-if="total > 1"
          type="button"
          class="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-paper-light/10 text-paper-light hover:bg-paper-light/25 transition-colors text-2xl"
          aria-label="上一张"
          @click="prev"
        >
          ‹
        </button>
        <button
          v-if="total > 1"
          type="button"
          class="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-paper-light/10 text-paper-light hover:bg-paper-light/25 transition-colors text-2xl"
          aria-label="下一张"
          @click="next"
        >
          ›
        </button>

        <!-- 底部标题 / 说明 / 计数 -->
        <div class="mt-4 text-center max-w-2xl" @click.self="close">
          <h3 class="text-base md:text-lg font-serif font-semibold text-paper-light">{{ current.title }}</h3>
          <p v-if="current.desc" class="text-sm text-paper-light/70 font-serif mt-1">{{ current.desc }}</p>
          <p class="text-xs text-paper-light/50 font-serif mt-2 tracking-widest">{{ index + 1 }} / {{ total }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>
