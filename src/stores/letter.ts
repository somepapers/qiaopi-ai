import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LetterInput, GeneratedLetter } from '@/types/letter'
import { generateId } from '@/utils/format'

export const useLetterStore = defineStore('letter', () => {
  const input = ref<LetterInput | null>(null)
  const generatedContent = ref<string | null>(null)
  const isGenerating = ref(false)
  const editingContent = ref<string | null>(null)
  const exportImageUrl = ref<string | null>(null)
  const history = ref<GeneratedLetter[]>(loadHistory())
  const error = ref<string | null>(null)
  const showEnvelopeAnimation = ref(false)

  function loadHistory(): GeneratedLetter[] {
    try {
      const saved = localStorage.getItem('qiaopi-history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  function saveHistory() {
    localStorage.setItem('qiaopi-history', JSON.stringify(history.value.slice(0, 50)))
  }

  const latestLetter = computed(() =>
    history.value.length > 0 ? history.value[0] : null
  )

  function setInput(data: LetterInput) {
    input.value = data
    error.value = null
  }

  function startGenerating() {
    isGenerating.value = true
    error.value = null
    generatedContent.value = null
  }

  function appendContent(text: string) {
    generatedContent.value = (generatedContent.value || '') + text
  }

  function finishGenerating(content: string) {
    generatedContent.value = content
    isGenerating.value = false
    if (input.value) {
      const letter: GeneratedLetter = {
        id: generateId(),
        input: { ...input.value },
        content,
        sections: [],
        createdAt: new Date().toISOString(),
        modelVersion: 'chatbox-ai',
      }
      history.value.unshift(letter)
      saveHistory()
    }
  }

  function failGeneration(msg: string) {
    isGenerating.value = false
    error.value = msg
  }

  function startEdit() {
    editingContent.value = generatedContent.value
  }

  function saveEdit(content: string) {
    editingContent.value = null
    generatedContent.value = content
  }

  function cancelEdit() {
    editingContent.value = null
  }

  function setExportImage(url: string) {
    exportImageUrl.value = url
  }

  function deleteLetter(id: string) {
    history.value = history.value.filter((l) => l.id !== id)
    saveHistory()
  }

  function triggerEnvelope() {
    showEnvelopeAnimation.value = true
  }

  function dismissEnvelope() {
    showEnvelopeAnimation.value = false
  }

  function clearHistory() {
    history.value = []
    saveHistory()
  }

  return {
    input,
    generatedContent,
    isGenerating,
    editingContent,
    exportImageUrl,
    history,
    error,
    showEnvelopeAnimation,
    latestLetter,
    setInput,
    startGenerating,
    appendContent,
    finishGenerating,
    failGeneration,
    startEdit,
    saveEdit,
    cancelEdit,
    setExportImage,
    deleteLetter,
    triggerEnvelope,
    dismissEnvelope,
    clearHistory,
  }
})
