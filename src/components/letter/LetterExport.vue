<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLetterStore } from '@/stores/letter'
import type { PaperType, LetterLayout } from '@/types/letter'

const emit = defineEmits<{ close: [] }>()
const store = useLetterStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const previewUrl = ref<string | null>(null)
const paperType = ref<PaperType>('light')
const layout = ref<LetterLayout>('horizontal')
const includeEnvelope = ref(false)
const isExporting = ref(false)

const paperColors: Record<PaperType, string> = {
  light: '#F5E6C8',
  aged: '#E8D5A3',
  worn: '#D4B896',
}

function getCanvasSize() {
  if (layout.value === 'vertical') {
    return { w: 1920, h: 1080 }
  }
  return { w: 1080, h: 1527 }
}

const CALIGRAPHY_FONT = '"honglei sim", "STKaiti", "KaiTi", "楷体", serif'

function drawHorizontal(ctx: CanvasRenderingContext2D, content: string, scale: number, w: number, h: number) {
  ctx.fillStyle = '#2C1810'
  ctx.font = `${28 * scale}px ${CALIGRAPHY_FONT}`
  ctx.textAlign = 'left'

  const lines = content.split('\n')
  const lineHeight = 50 * scale
  const margin = 80 * scale
  const maxWidth = w - margin * 2
  let y = 80 * scale

  for (const line of lines) {
    if (y > h - margin * 1.5) break

    const isRemittance = /[外附寄汇奉特].*[壹贰叁肆伍陆柒捌玖拾佰仟\d]+.*(?:元|块|圆|新币|港币|美金)/.test(line)
    const isAmount = /[壹贰叁肆伍陆柒捌玖拾佰仟萬亿零\d]+(?:元|块|圆|角|分|新币|港币|美金|英镑|大洋|文)/.test(line)
    ctx.fillStyle = (isRemittance || isAmount) ? '#CC0000' : '#2C1810'

    const words = [...line]
    let currentLine = ''
    for (const char of words) {
      const testLine = currentLine + char
      if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
        ctx.fillText(currentLine, margin, y)
        y += lineHeight
        currentLine = char
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      ctx.fillText(currentLine, margin, y)
      y += lineHeight
    }
    y += 4 * scale
  }
}

function drawVertical(ctx: CanvasRenderingContext2D, content: string, scale: number, w: number, h: number) {
  ctx.fillStyle = '#2C1810'
  const fontSize = 30 * scale
  ctx.font = `${fontSize}px ${CALIGRAPHY_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const margin = 60 * scale
  const colGap = fontSize * 1.6
  const maxCols = 20
  const maxRows = Math.floor((h - margin * 2) / colGap)

  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim())

  // Combine all chars from all paragraphs
  const allChars: string[] = []
  for (const para of paragraphs) {
    for (const ch of para) {
      if (ch === ' ' || ch === '\r') continue
      allChars.push(ch)
    }
    allChars.push('')  // empty string as paragraph separator
  }

  // Draw from right to left (traditional Chinese vertical)
  let col = maxCols - 1
  let row = 0

  for (const ch of allChars) {
    if (col < 0) break
    if (row >= maxRows) {
      row = 0
      col--
    }
    if (col < 0) break

    const x = w - margin - col * colGap
    const y = margin + row * colGap

    if (ch === '') {
      // Paragraph separator - just extra space
      row++
    } else {
      // Check for remittance
      if ((row > 0 || col < maxCols - 1) && /\d/.test(ch)) {
        // Check surrounding context for amounts
        ctx.fillStyle = '#2C1810'
      }
      ctx.fillText(ch, x, y)
      row++
    }
  }
}

async function renderPreview() {
  const canvas = canvasRef.value
  if (!canvas) return
  const content = store.generatedContent
  if (!content) return

  // Ensure calligraphy font is loaded
  try {
    await document.fonts.load(`28px ${CALIGRAPHY_FONT}`)
  } catch { /* use fallback */ }

  const { w, h } = getCanvasSize()
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const scale = w / 1080

  // Draw paper background
  ctx.fillStyle = paperColors[paperType.value]
  ctx.fillRect(0, 0, w, h)

  // Draw subtle texture lines
  ctx.strokeStyle = 'rgba(139,90,43,0.03)'
  ctx.lineWidth = 0.5 * scale
  for (let y = 0; y < h; y += 4 * scale) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y + Math.sin(y * 0.01) * 2 * scale)
    ctx.stroke()
  }

  // Draw content based on layout
  if (layout.value === 'vertical') {
    drawVertical(ctx, content, scale, w, h)
  } else {
    drawHorizontal(ctx, content, scale, w, h)
  }

  // Draw vignette
  const vignetteGradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.5, w / 2, h / 2, w * 0.75)
  vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)')
  vignetteGradient.addColorStop(1, 'rgba(0,0,0,0.08)')
  ctx.fillStyle = vignetteGradient
  ctx.fillRect(0, 0, w, h)

  previewUrl.value = canvas.toDataURL('image/png', 0.5)
}

function downloadImage() {
  const canvas = canvasRef.value
  if (!canvas) return
  const url = canvas.toDataURL('image/png', 1.0)
  const a = document.createElement('a')
  a.href = url
  a.download = `侨批_${new Date().toISOString().slice(0, 10)}.png`
  a.click()
}

async function shareImage() {
  const canvas = canvasRef.value
  if (!canvas) return
  if (navigator.share) {
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], '侨批.png', { type: 'image/png' })
      try {
        await navigator.share({
          title: '侨批AI代书人',
          text: '我用AI写了一封侨批家书',
          files: [file],
        })
      } catch { /* user cancelled */ }
    }, 'image/png')
  } else {
    downloadImage()
  }
}

onMounted(() => {
  renderPreview()
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-[#faf6f0] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-serif font-semibold text-ink">导出书信图片</h3>
          <button class="text-ink/40 hover:text-ink text-xl leading-none" @click="emit('close')">&times;</button>
        </div>

        <!-- Paper type selector -->
        <div class="space-y-3 mb-4">
          <label class="block text-sm font-serif text-ink/70">纸张纹理</label>
          <div class="flex gap-2">
            <button
              v-for="pt in (['light', 'aged', 'worn'] as PaperType[])"
              :key="pt"
              @click="paperType = pt; renderPreview()"
              class="flex-1 py-2 rounded-lg text-sm font-serif border transition-colors"
              :class="paperType === pt ? 'border-red-seal bg-red-seal/5 text-red-seal' : 'border-ink/10 text-ink/60 hover:border-ink/20'"
              :style="{ backgroundColor: paperColors[pt] }"
            >
              {{ { light: '素笺', aged: '旧纸', worn: '毛边' }[pt] }}
            </button>
          </div>
        </div>

        <!-- Layout selector -->
        <div class="space-y-3 mb-4">
          <label class="block text-sm font-serif text-ink/70">排版方向</label>
          <div class="flex gap-2">
            <button
              @click="layout = 'horizontal'; renderPreview()"
              class="flex-1 py-2 rounded-lg text-sm font-serif border transition-colors"
              :class="layout === 'horizontal' ? 'border-red-seal bg-red-seal/5 text-red-seal' : 'border-ink/10 text-ink/60'"
            >
              横排（推荐）
            </button>
            <button
              @click="layout = 'vertical'; renderPreview()"
              class="flex-1 py-2 rounded-lg text-sm font-serif border transition-colors"
              :class="layout === 'vertical' ? 'border-red-seal bg-red-seal/5 text-red-seal' : 'border-ink/10 text-ink/60'"
            >
              竖排（传统）
            </button>
          </div>
        </div>

        <!-- Preview -->
        <div class="border border-ink/10 rounded-lg overflow-hidden mb-4 bg-white">
          <canvas ref="canvasRef" class="hidden"></canvas>
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="书信预览"
            class="w-full"
          />
          <div v-else class="aspect-[1/1.4] flex items-center justify-center text-ink/30">
            正在生成预览...
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button class="btn-primary flex-1" @click="downloadImage">
            💾 下载PNG
          </button>
          <button class="btn-secondary flex-1" @click="shareImage">
            📤 分享
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
