<script setup lang="ts">
import { useRouter } from 'vue-router'
import LetterInput from '@/components/letter/LetterInput.vue'
import LetterPreview from '@/components/letter/LetterPreview.vue'
import LetterArtifact from '@/components/letter/LetterArtifact.vue'
import LetterExport from '@/components/letter/LetterExport.vue'
import EnvelopeAnimation from '@/components/letter/EnvelopeAnimation.vue'
import { useLetterStore } from '@/stores/letter'
import { useTemplateStore } from '@/stores/templates'
import { buildShareUrl } from '@/utils/share'
import { ref, computed, onMounted } from 'vue'

const router = useRouter()
const letterStore = useLetterStore()
const templateStore = useTemplateStore()
const showExport = ref(false)
const showActions = ref(false)
const shareUrl = ref<string | null>(null)
const shortUrl = ref<string | null>(null)
const shortening = ref(false) // 短链生成中：弹窗内显示等待提示
const shareCopied = ref(false)
const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

// 分享链接：优先展示短链，短链生成失败时自动回退为长链接
const displayShareUrl = computed(() => shortUrl.value ?? shareUrl.value)

function regenerate() {
  showActions.value = false
  letterStore.setInput(letterStore.input!)
  letterStore.generatedContent = null
}

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
    letterStore.triggerEnvelope()
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = letterStore.generatedContent || ''
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    letterStore.triggerEnvelope()
  }
}

async function copyLink(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    document.body.removeChild(ta)
    return ok
  }
}

async function shareToFamily() {
  if (!letterStore.generatedContent) return
  const url = buildShareUrl({
    v: 1,
    content: letterStore.generatedContent,
    relationship: letterStore.input?.relationship,
    recipient: letterStore.input?.recipient,
    toLocation: letterStore.input?.toLocation,
    fromLocation: letterStore.input?.fromLocation,
    senderName: letterStore.input?.senderName,
    remittanceAmount: letterStore.input?.remittanceAmount,
  })
  shareUrl.value = url
  shortUrl.value = null
  shortening.value = false
  shareCopied.value = await copyLink(url)
  shortenShareLink(url)
}

// 调用 /api/shorten 缩短分享链接；失败静默降级，继续用长链接
async function shortenShareLink(url: string) {
  shortening.value = true
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return
    const data = await res.json()
    if (data?.shortUrl) shortUrl.value = data.shortUrl
  } catch {
    // 短链生成失败：保持长链接展示，不影响分享功能
  } finally {
    shortening.value = false
  }
}

async function copyShareLink() {
  if (!displayShareUrl.value) return
  shareCopied.value = await copyLink(displayShareUrl.value)
}

async function nativeShare() {
  if (!displayShareUrl.value || !navigator.share) return
  try {
    await navigator.share({
      title: '一封侨批',
      text: '先生替我写了一封侨批，给你看看。',
      url: displayShareUrl.value,
    })
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <h1 class="text-2xl md:text-3xl font-serif font-bold text-ink text-center mb-8">
      ✍️ 写一封侨批
    </h1>

    <!-- Step: Input -->
    <section
      v-if="!letterStore.generatedContent && !letterStore.isGenerating && !letterStore.error"
      class="vintage-paper rounded-xl p-6 md:p-8"
    >
      <LetterInput />
    </section>

    <!-- Step: Preview & Actions -->
    <section v-else class="space-y-6">
      <!-- 生成中 / 出错：流式预览 -->
      <LetterPreview v-if="letterStore.isGenerating || letterStore.error" />
      <!-- 生成完成：成品信纸（竖排 + 落纸 + 墨迹浮现） -->
      <LetterArtifact v-else @stamped="showActions = true" />

      <!-- 操作按钮：段落浮现后显示 -->
      <div
        v-if="!letterStore.isGenerating && !letterStore.error"
        class="grid grid-cols-2 gap-2 transition-all duration-700 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-4"
        :class="showActions ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'"
      >
        <div class="col-span-2 flex flex-col items-center gap-1.5 sm:col-span-1">
          <button class="ink-button w-full sm:w-auto" @click="shareToFamily()">
            寄给亲人
          </button>
          <span class="text-sm text-ink/70">生成分享链接</span>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <button class="ink-button ghost w-full sm:w-auto" @click="showExport = true">
            保存为图片
          </button>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <button class="ink-button ghost w-full sm:w-auto" @click="copyToClipboard()">
            复制全文
          </button>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <button class="ink-button ghost w-full sm:w-auto" @click="letterStore.startEdit()">
            提笔修改
          </button>
          <span class="hidden text-[10px] tracking-[0.3em] text-ink/45 sm:block">亲 手 改 几 句</span>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <button class="ink-button ghost w-full sm:w-auto" @click="regenerate()">
            重新研墨
          </button>
          <span class="hidden text-[10px] tracking-[0.3em] text-ink/45 sm:block">请 先 生 再 写 一 遍</span>
        </div>
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

      <!-- Share Modal -->
      <Teleport to="body">
        <div
          v-if="shareUrl"
          class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          @click.self="shareUrl = null"
        >
          <div class="bg-[#faf6f0] rounded-xl p-6 w-full max-w-md">
            <h3 class="text-lg font-serif font-semibold text-ink mb-2">侨批已装封 · 寄给亲人</h3>
            <p class="text-sm text-ink/60 font-serif mb-4 leading-relaxed">
              把下面的链接发给家人，对方打开即可拆封阅读。信件内容都藏在链接里，不经服务器保存，链接永久有效。
            </p>
            <p v-if="shortening" class="text-xs text-ink/50 font-serif mb-1">⏳ 正在生成短链接，稍候即可使用…</p>
            <p v-else-if="shortUrl" class="text-xs text-red-seal/80 font-serif mb-1">🔗 已生成短链接，发送更便捷</p>
            <div class="w-full max-h-24 overflow-y-auto p-3 rounded-lg border border-ink/20 bg-white/60 text-xs text-ink/60 break-all select-all mb-4">
              {{ displayShareUrl }}
            </div>
            <p v-if="shortUrl" class="text-[10px] text-ink/35 break-all -mt-2 mb-4">
              原始链接：{{ shareUrl }}
            </p>
            <div class="flex gap-3">
              <button class="ink-button flex-1" @click="copyShareLink()">
                {{ shareCopied ? '已复制 ✓' : '复制链接' }}
              </button>
              <button v-if="canNativeShare" class="ink-button ghost flex-1" @click="nativeShare()">
                分享
              </button>
              <button class="ink-button ghost flex-1" @click="shareUrl = null">
                关闭
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Envelope Animation -->
      <EnvelopeAnimation
        v-if="letterStore.showEnvelopeAnimation"
        @done="letterStore.dismissEnvelope()"
      />
    </section>
  </div>
</template>
