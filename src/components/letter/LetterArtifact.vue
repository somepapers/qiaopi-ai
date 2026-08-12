<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useLetterStore } from '@/stores/letter'

const props = defineProps<{ content?: string }>()
const emit = defineEmits<{ stamped: [] }>()
const store = useLetterStore()

const revealed = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const scrollEl = ref<HTMLElement | null>(null)
// 字号自适应：内容多则字号缩小，让整封信一屏可见、免去横向拖动
const fontSize = ref(18)
const MIN_FONT = 8
const MAX_FONT = 18

const paragraphs = computed(() => {
  const text = props.content ?? store.generatedContent ?? ''
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean)
  return lines.length ? lines : [text]
})

// 竖排布局估算：每列可容字符数 = 可用高度 / (字号 × 行高2.2)，
// 每字符占宽 ≈ 字号 × (1 + 字距0.18em)，段落间隔 1.2em。
// 二分找出"总列宽 ≤ 容器宽度"的最大字号。
function computeFontSize() {
  const el = scrollEl.value
  if (!el) return
  const width = el.clientWidth
  if (!width) return
  const paraLens = paragraphs.value.map((p) => p.length)
  if (!paraLens.length || paraLens.every((n) => n === 0)) return
  const isMobile = window.matchMedia('(max-width: 639px)').matches
  const maxHeight = isMobile ? 352 : 480 // 与 CSS 中 22rem / 30rem 对应
  const paraGap = Math.max(0, paraLens.length - 1) * 1.2

  const fits = (fs: number) => {
    const rowsPerCol = Math.max(1, Math.floor(maxHeight / (fs * 2.2)))
    const cols = paraLens.reduce((sum, len) => sum + Math.ceil(len / rowsPerCol), 0)
    return (cols * 1.18 + paraGap) * fs <= width * 0.96
  }
  if (fits(MAX_FONT)) {
    fontSize.value = MAX_FONT
    return
  }
  if (!fits(MIN_FONT)) {
    fontSize.value = MIN_FONT // 超长内容：保持最小可读字号，允许滚动
    return
  }
  let lo = MIN_FONT
  let hi = MAX_FONT
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (fits(mid)) lo = mid
    else hi = mid
  }
  fontSize.value = Math.floor(lo * 2) / 2 // 取 0.5px 粒度，避免视觉抖动
}

watch(paragraphs, computeFontSize)

function highlight(line: string): string {
  return line
    .replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))
    .replace(
      /([壹贰叁肆伍陆柒捌玖拾佰仟萬亿零\d]+(?:元|块|圆|角|分|新币|港币|美金|英镑|大洋|文))/g,
      '<span class="remittance-highlight">$1</span>'
    )
}

onMounted(() => {
  computeFontSize()
  window.addEventListener('resize', computeFontSize)
  // 时序：信纸飘落(0.9s) → 段落逐段浮现 → 通知父组件显示操作按钮
  timers.push(setTimeout(() => { revealed.value = true }, 650))
  const paraCount = Math.min(paragraphs.value.length, 12)
  const doneDelay = 650 + 220 + paraCount * 280 + 450
  timers.push(setTimeout(() => { emit('stamped') }, doneDelay))
})

onUnmounted(() => {
  window.removeEventListener('resize', computeFontSize)
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div class="flex w-full justify-center">
    <div class="paper-drop w-full max-w-3xl">
      <div class="qiaopi-paper relative rounded-sm px-6 py-8 md:px-12 md:py-12">
        <!-- 左上角水印 -->
        <div class="pointer-events-none absolute left-3 top-3 text-[10px] tracking-[0.3em] text-ink/40 select-none">
          QIAOPI · 侨批
        </div>

        <!-- 竖排正文（direction:rtl 让初始滚动位置在最右侧 = 文章开头） -->
        <div ref="scrollEl" class="letter-scroll overflow-x-auto pb-2" style="direction: rtl">
          <article
            class="letter-vertical vintage-text mx-auto"
            :style="{ direction: 'ltr', maxHeight: '30rem', minHeight: '16rem', fontSize: fontSize + 'px' }"
          >
            <p
              v-for="(p, i) in paragraphs"
              :key="i"
              class="ink-para whitespace-pre-wrap"
              :class="{ 'ink-revealed': revealed }"
              :style="{ transitionDelay: revealed ? (0.2 + Math.min(i, 12) * 0.28) + 's' : '0s', marginInlineEnd: i > 0 ? '1.2em' : '0' }"
              v-html="highlight(p)"
            ></p>
          </article>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* 竖排滚动条样式：细且贴合纸色 */
.letter-scroll::-webkit-scrollbar {
  height: 5px;
}

.letter-scroll::-webkit-scrollbar-thumb {
  background: rgba(139, 69, 19, 0.25);
  border-radius: 3px;
}

.letter-scroll::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 639px) {
  .letter-vertical {
    max-height: 22rem !important;
    min-height: 14rem !important;
  }
}
</style>
