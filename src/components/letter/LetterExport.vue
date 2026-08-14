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

const CALIGRAPHY_FONT = '"honglei sim", "STKaiti", "KaiTi", "楷体", serif'

// 浏览器 Canvas 单边尺寸上限（超出会导致导出失败/空白），超长内容超出时按比例缩小字号
const MAX_CANVAS_DIM = 16000
// 横排纸张最小高度：内容过短时保留 2:1 的纸张比例，避免导出成细长条
const MIN_HORIZONTAL_HEIGHT = 540
// 竖排最大列数（基准 1920×1080 下可容纳 20 列）
const VERTICAL_MAX_COLS = 20

interface WrapLine {
  text: string
  red: boolean
  gapAfter: number
}

type MeasuredLayout =
  | { kind: 'horizontal'; wrapped: WrapLine[]; height: number }
  | { kind: 'vertical'; maxRows: number; height: number }

/** 横排：按最大宽度折行，保留段落间距与汇款金额红色标注 */
function wrapHorizontal(ctx: CanvasRenderingContext2D, content: string, scale: number, maxWidth: number): WrapLine[] {
  const gap = 4 * scale
  const out: WrapLine[] = []
  for (const line of content.split('\n')) {
    const isRemittance = /[外附寄汇奉特].*[壹贰叁肆伍陆柒捌玖拾佰仟\d]+.*(?:元|块|圆|新币|港币|美金)/.test(line)
    const isAmount = /[壹贰叁肆伍陆柒捌玖拾佰仟萬亿零\d]+(?:元|块|圆|角|分|新币|港币|美金|英镑|大洋|文)/.test(line)
    const red = isRemittance || isAmount
    if (!line) {
      out.push({ text: '', red: false, gapAfter: gap })
      continue
    }
    const words = [...line]
    let currentLine = ''
    for (const char of words) {
      const testLine = currentLine + char
      if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
        out.push({ text: currentLine, red, gapAfter: 0 })
        currentLine = char
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      out.push({ text: currentLine, red, gapAfter: gap })
    }
  }
  return out
}

/** 竖排：将内容拆为逐字单元，段落间以空字符串分隔 */
function buildVerticalUnits(content: string): string[] {
  const paragraphs = content.split('\n').filter(p => p.trim())
  const allChars: string[] = []
  for (const para of paragraphs) {
    for (const ch of para) {
      if (ch === ' ' || ch === '\r') continue
      allChars.push(ch)
    }
    allChars.push('')
  }
  return allChars
}

/** 横排：测量内容所需的画布高度（基准宽 1080） */
function prepareHorizontal(ctx: CanvasRenderingContext2D, content: string, scale: number): MeasuredLayout {
  const margin = 80 * scale
  ctx.font = `${28 * scale}px ${CALIGRAPHY_FONT}`
  const wrapped = wrapHorizontal(ctx, content, scale, 1080 - margin * 2)
  const lineHeight = 50 * scale
  const lineCount = wrapped.filter(l => l.text).length
  const totalGap = wrapped.reduce((sum, l) => sum + l.gapAfter, 0)
  const height = margin + lineCount * lineHeight + totalGap + 120 * scale
  return { kind: 'horizontal', wrapped, height }
}

/** 竖排：测量内容所需的画布高度（基准宽 1920，超长内容向下加长画布而非截断） */
function prepareVertical(units: string[], scale: number): MeasuredLayout {
  const margin = 60 * scale
  const colGap = 30 * scale * 1.6
  const baseMaxRows = Math.floor((1080 - margin * 2) / colGap)
  const maxRows = Math.max(baseMaxRows, Math.ceil(units.length / VERTICAL_MAX_COLS))
  const height = margin * 2 + maxRows * colGap
  return { kind: 'vertical', maxRows, height }
}

function drawHorizontal(ctx: CanvasRenderingContext2D, wrapped: WrapLine[], scale: number) {
  ctx.textAlign = 'left'
  const margin = 80 * scale
  const lineHeight = 50 * scale
  let y = margin

  for (const line of wrapped) {
    if (line.text) {
      ctx.fillStyle = line.red ? '#CC0000' : '#2C1810'
      ctx.fillText(line.text, margin, y)
      y += lineHeight
    }
    y += line.gapAfter
  }
}

function drawVertical(ctx: CanvasRenderingContext2D, units: string[], scale: number, w: number, maxRows: number) {
  const fontSize = 30 * scale
  ctx.fillStyle = '#2C1810'
  ctx.font = `${fontSize}px ${CALIGRAPHY_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const margin = 60 * scale
  const colGap = fontSize * 1.6

  // 从右向左逐列书写（传统中文竖排）
  let col = VERTICAL_MAX_COLS - 1
  let row = 0

  for (const ch of units) {
    if (row >= maxRows) {
      row = 0
      col--
    }
    if (col < 0) break

    const x = w - margin - col * colGap
    const y = margin + row * colGap

    if (ch === '') {
      row++ // 段落间空一格
    } else {
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

  const isVertical = layout.value === 'vertical'
  const baseW = isVertical ? 1920 : 1080

  // 先用离屏 canvas 测量排版尺寸，保证超长内容完整呈现（画布随内容伸缩）
  const measureCtx = document.createElement('canvas').getContext('2d')!
  const units = isVertical ? buildVerticalUnits(content) : []

  let scale = isVertical ? 1920 / 1080 : 1
  const measure = () =>
    isVertical
      ? prepareVertical(units, scale)
      : prepareHorizontal(measureCtx, content, scale)

  // 内容过长时按比例缩小字号，避免超出浏览器 canvas 尺寸上限
  while (measure().height > MAX_CANVAS_DIM) scale *= 0.9
  const measured = measure()

  const w = baseW
  // 横排：纸张高度随内容伸缩，短内容不再留大片空白（最短保留 2:1 比例）
  // 竖排：保持 1920×1080 基准，超长时向下加长
  const h = isVertical
    ? Math.max(1080, Math.ceil(measured.height))
    : Math.max(MIN_HORIZONTAL_HEIGHT, Math.ceil(measured.height))

  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

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
  if (measured.kind === 'vertical') {
    drawVertical(ctx, units, scale, w, measured.maxRows)
  } else {
    ctx.font = `${28 * scale}px ${CALIGRAPHY_FONT}`
    drawHorizontal(ctx, measured.wrapped, scale)
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
  store.triggerEnvelope()
  emit('close')
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
        store.triggerEnvelope()
        emit('close')
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
