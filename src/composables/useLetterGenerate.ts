import { ref } from 'vue'
import { useLetterStore } from '@/stores/letter'
import { generateLetterStream } from '@/api/chatbox'
import type { LetterInput } from '@/types/letter'

export function useLetterGenerate() {
  const store = useLetterStore()
  const isPending = ref(false)

  async function generate(input: LetterInput): Promise<void> {
    isPending.value = true
    store.startGenerating()

    await generateLetterStream(input, {
      onMessage(text: string) {
        store.appendContent(text)
      },
      onError(msg: string) {
        store.failGeneration(msg)
        isPending.value = false
      },
      onDone(content: string) {
        store.finishGenerating(content)
        isPending.value = false
      },
    })
  }

  return { generate, isPending }
}
