<script setup lang="ts">
import { useLetterStore } from '@/stores/letter'
import { computed } from 'vue'

const store = useLetterStore()

const displayContent = computed(() => store.editingContent ?? store.generatedContent ?? '')

const formattedContent = computed(() => {
  const text = displayContent.value
  if (!text) return ''
  return text
    // Highlight amounts (大写数字 followed by 元/块/圆)
    .replace(/([壹贰叁肆伍陆柒捌玖拾佰仟萬亿零\d]+(?:元|块|圆|角|分|新币|港币|美金|英镑|大洋|文))/g, '<span class="remittance-highlight">$1</span>')
    // Highlight amounts preceded by common patterns
    .replace(/([外附寄汇奉特][^。，\n]*?(?:壹贰叁肆伍陆柒捌玖拾佰仟萬亿零\d]+(?:元|块|圆|新币|港币|美金)))</g, '<span class="remittance-highlight">$1</span>')
})
</script>

<template>
  <div class="vintage-paper rounded-xl p-6 md:p-10">
    <!-- Title -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-serif font-bold text-ink tracking-widest">侨 批</h2>
      <div class="w-16 h-px bg-ink/20 mx-auto mt-2"></div>
    </div>

    <!-- Content with typewriter effect for streaming -->
    <div
      v-if="store.isGenerating"
      class="vintage-text whitespace-pre-line text-base md:text-lg"
      v-html="formattedContent"
    ></div>

    <!-- Finished content -->
    <div
      v-else
      class="vintage-text whitespace-pre-line text-base md:text-lg"
      v-html="formattedContent"
    ></div>

    <!-- Loading state -->
    <div
      v-if="store.isGenerating && !displayContent"
      class="flex flex-col items-center justify-center py-12"
    >
      <div class="text-4xl animate-bounce mb-4">🖋️</div>
      <p class="text-ink/50 font-serif">AI代书先生正在研墨挥毫...</p>
      <p class="text-xs text-ink/30 font-serif mt-1">请稍候，精雕细琢需要一点时间</p>
    </div>

    <!-- Error state -->
    <div
      v-if="store.error"
      class="flex flex-col items-center justify-center py-12"
    >
      <div class="text-4xl mb-4">😔</div>
      <p class="text-red-seal font-serif">{{ store.error }}</p>
      <button class="btn-secondary mt-4" @click="store.generatedContent = null">
        重试
      </button>
    </div>
  </div>
</template>
