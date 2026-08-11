<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLetterStore } from '@/stores/letter'

const props = defineProps<{ content?: string }>()
const emit = defineEmits<{ stamped: [] }>()
const store = useLetterStore()

const revealed = ref(false)
const stampDown = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []

const paragraphs = computed(() => {
  const text = props.content ?? store.generatedContent ?? ''
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean)
  return lines.length ? lines : [text]
})

function highlight(line: string): string {
  return line
    .replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))
    .replace(
      /([壹贰叁肆伍陆柒捌玖拾佰仟萬亿零\d]+(?:元|块|圆|角|分|新币|港币|美金|英镑|大洋|文))/g,
      '<span class="remittance-highlight">$1</span>'
    )
}

onMounted(() => {
  // 时序：信纸飘落(0.9s) → 段落逐段浮现 → 印章盖下 → 通知父组件显示操作按钮
  timers.push(setTimeout(() => { revealed.value = true }, 650))
  const paraCount = Math.min(paragraphs.value.length, 12)
  const stampDelay = 650 + 220 + paraCount * 280 + 450
  timers.push(setTimeout(() => { stampDown.value = true }, stampDelay))
  timers.push(setTimeout(() => { emit('stamped') }, stampDelay + 350))
})

onUnmounted(() => {
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
        <div class="letter-scroll overflow-x-auto pb-2" style="direction: rtl">
          <article
            class="letter-vertical vintage-text mx-auto text-base md:text-lg"
            style="direction: ltr; max-height: 30rem; min-height: 16rem"
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

        <!-- 印章：盖在左下（竖排文末落款处） -->
        <div
          class="stamp-seal absolute bottom-8 left-8 md:bottom-10 md:left-12"
          :class="{ 'stamp-down': stampDown }"
        >
          <svg
            class="h-14 w-14 md:h-[76px] md:w-[76px]"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="侨批代书印"
          >
            <defs>
              <filter id="seal-grain-artifact">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
                <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.14 0" />
                <feComposite in2="SourceGraphic" operator="in" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode />
                </feMerge>
              </filter>
            </defs>
            <g style="filter: url(#seal-grain-artifact)">
              <rect x="5" y="5" width="90" height="90" fill="none" stroke="#8b3a3a" stroke-width="4" />
              <rect x="12" y="12" width="76" height="76" fill="#8b3a3a" opacity="0.92" />
              <text x="31" y="42" font-size="26" fill="#f4ecd8" font-weight="bold" text-anchor="middle" style="font-family: serif">侨</text>
              <text x="69" y="42" font-size="26" fill="#f4ecd8" font-weight="bold" text-anchor="middle" style="font-family: serif">批</text>
              <text x="31" y="80" font-size="26" fill="#f4ecd8" font-weight="bold" text-anchor="middle" style="font-family: serif">代</text>
              <text x="69" y="80" font-size="26" fill="#f4ecd8" font-weight="bold" text-anchor="middle" style="font-family: serif">书</text>
            </g>
          </svg>
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
