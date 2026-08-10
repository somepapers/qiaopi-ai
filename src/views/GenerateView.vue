<script setup lang="ts">
import { useRouter } from 'vue-router'
import LetterInput from '@/components/letter/LetterInput.vue'
import LetterPreview from '@/components/letter/LetterPreview.vue'
import LetterExport from '@/components/letter/LetterExport.vue'
import { useLetterStore } from '@/stores/letter'
import { useTemplateStore } from '@/stores/templates'
import { ref, onMounted } from 'vue'

const router = useRouter()
const letterStore = useLetterStore()
const templateStore = useTemplateStore()
const showExport = ref(false)

onMounted(() => {
  const templateId = router.currentRoute.value.query.template as string
  if (templateId) {
    const tmpl = templateStore.getTemplateById(templateId)
    if (tmpl) {
      letterStore.setInput({
        plainSpeech: '',
        recipient: '',
        relationship: tmpl.relationship,
        fromLocation: '',
        toLocation: '',
      })
    }
  }
})

function handleGenerated() {
  // Content is now available, user can export
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(letterStore.generatedContent || '')
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = letterStore.generatedContent || ''
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <h1 class="text-2xl md:text-3xl font-serif font-bold text-ink text-center mb-8">
      ✍️ 写一封侨批
    </h1>

    <!-- Step: Input -->
    <section v-if="!letterStore.generatedContent" class="vintage-paper rounded-xl p-6 md:p-8">
      <LetterInput />
    </section>

    <!-- Step: Preview & Actions -->
    <section v-else class="space-y-6">
      <LetterPreview />

      <div class="flex flex-wrap justify-center gap-3">
        <button class="btn-secondary" @click="letterStore.startEdit()">
          ✏️ 编辑修改
        </button>
        <button
          class="btn-primary"
          @click="letterStore.setInput(letterStore.input!); letterStore.generatedContent = null"
        >
          🔄 重新生成
        </button>
        <button class="btn-primary" @click="showExport = true">
          📷 导出图片
        </button>
        <button
          class="btn-secondary"
          @click="copyToClipboard()"
        >
          📋 复制文本
        </button>
      </div>

      <!-- Edit Modal -->
      <Teleport to="body">
        <div
          v-if="letterStore.editingContent !== null"
          class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        >
          <div class="bg-[#faf6f0] rounded-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <h3 class="text-lg font-serif font-semibold text-ink mb-4">编辑侨批</h3>
            <textarea
              v-model="letterStore.editingContent"
              class="flex-1 w-full p-4 rounded-lg border border-ink/20 font-serif text-ink resize-none focus:outline-none focus:border-red-seal/50"
              rows="15"
            ></textarea>
            <div class="flex justify-end gap-3 mt-4">
              <button class="btn-secondary" @click="letterStore.cancelEdit()">取消</button>
              <button class="btn-primary" @click="letterStore.saveEdit(letterStore.editingContent!)">
                保存
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Export Modal -->
      <LetterExport v-if="showExport" @close="showExport = false" />
    </section>
  </div>
</template>
