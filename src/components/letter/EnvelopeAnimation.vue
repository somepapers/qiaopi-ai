<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLetterStore } from '@/stores/letter'
import type { Relationship } from '@/types/letter'

const emit = defineEmits<{ done: [] }>()
const store = useLetterStore()

const phase = ref<'enter' | 'insert' | 'reveal' | 'done'>('enter')
const isExiting = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []

const textVisible = computed(() => phase.value === 'reveal' || phase.value === 'done')
const actionsVisible = computed(() => phase.value === 'done')

onMounted(() => {
  // 信纸折叠没入 → 封面题字浮现 → 停留（不自动关闭，等用户操作）
  timers.push(setTimeout(() => { phase.value = 'insert' }, 900))
  timers.push(setTimeout(() => { phase.value = 'reveal' }, 1900))
  timers.push(setTimeout(() => { phase.value = 'done' }, 2900))
})

onUnmounted(() => {
  timers.forEach(clearTimeout)
})

function close() {
  if (isExiting.value) return
  isExiting.value = true
  setTimeout(() => emit('done'), 380)
}

// ========== 封面题字（由 store 中的真实输入生成，不写死图片文字） ==========

// 中央红条：收信人称谓（侨批封题格式：称谓 + 安展/台展 等敬辞）
const ENVELOPE_TITLE: Record<Relationship, string> = {
  parents: '双亲大人安展',
  father: '家严大人安展',
  mother: '家慈大人安展',
  wife: '贤妻如晤',
  husband: '夫君大人安展',
  son: '吾儿知悉',
  daughter: '吾女知悉',
  older_brother: '家兄大人台展',
  younger_brother: '贤弟台展',
  older_sister: '家姊妆次',
  younger_sister: '贤妹妆次',
  grandfather: '祖父大人安展',
  grandmother: '祖母大人安展',
  uncle: '叔父大人安展',
  aunt: '姑母大人安展',
  friend: '仁兄台展',
  other: '台启展',
}

const DAXIE = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const DAXIE_UNITS = ['', '拾', '佰', '仟']

// 纯数字金额转中文大写（侨批封「外银」惯用大写），仅处理 1~9999，其余原样
function intToDaxie(n: number): string {
  if (n === 0) return '零'
  if (n < 1 || n > 9999) return String(n)
  const s = String(n)
  const len = s.length
  let out = ''
  let pendingZero = false
  for (let i = 0; i < len; i++) {
    const d = Number(s[i])
    if (d === 0) {
      pendingZero = true
    } else {
      if (pendingZero) { out += '零'; pendingZero = false }
      out += DAXIE[d] + DAXIE_UNITS[len - 1 - i]
    }
  }
  return out
}

function formatAmount(raw: string): string {
  const m = raw.trim().match(/^(\d{1,4})\s*元?$/)
  if (m) return `外附 ${intToDaxie(Number(m[1]))}元正`
  return `外附 ${raw.trim()}`
}

const titleText = computed(() => {
  const rel = store.input?.relationship
  return (rel && ENVELOPE_TITLE[rel]) || '台启展'
})

const toText = computed(() => {
  const to = store.input?.toLocation?.trim()
  return `${to || '唐山故里'}　交`
})

const amountText = computed(() => {
  const amt = store.input?.remittanceAmount?.trim()
  return amt ? formatAmount(amt) : ''
})

const senderText = computed(() => {
  const from = store.input?.fromLocation?.trim() || '南洋'
  const name = store.input?.senderName?.trim() || '游子'
  return `${from}　${name}　缄`
})
</script>

<template>
  <Teleport to="body">
    <div class="qp-overlay" :class="{ 'qp-exiting': isExiting }" @click.self="close">
      <!-- 右上角关闭 -->
      <button class="qp-close-x" aria-label="关闭" @click="close">&times;</button>

      <div class="qp-stage">
        <!-- 信纸：折叠后没入信封（在信封后方，被信封正面遮挡） -->
        <div class="qp-paper" :class="'qp-paper--' + phase">
          <div class="qp-paper-sheet">
            <div class="qp-paper-cols">
              <span
                v-for="i in 9"
                :key="i"
                class="qp-paper-col"
                :style="{ height: (55 + ((i * 37) % 40)) + '%' }"
              ></span>
            </div>
          </div>
        </div>

        <!-- 信封：竖式侨批红条封 -->
        <div class="qp-envelope">
          <div class="qp-env-aging"></div>

          <!-- 右列：寄达地址 -->
          <div class="qp-col qp-col-right" :class="{ 'qp-show': textVisible }">
            <span class="qp-v">{{ toText }}</span>
          </div>

          <!-- 中央红条：收信人称谓 -->
          <div class="qp-stripe">
            <span class="qp-v qp-title" :class="{ 'qp-show': textVisible }">{{ titleText }}</span>
          </div>

          <!-- 左区：汇款金额 + 寄款人 -->
          <div class="qp-col qp-col-left" :class="{ 'qp-show': textVisible }">
            <span v-if="amountText" class="qp-v qp-amount">{{ amountText }}</span>
            <span class="qp-v">{{ senderText }}</span>
          </div>

          <!-- 邮戳 -->
          <div class="qp-postmark" :class="{ 'qp-show': textVisible }">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#8b3a3a" stroke-width="3" />
              <circle cx="50" cy="50" r="34" fill="none" stroke="#8b3a3a" stroke-width="1.2" />
              <text x="50" y="40" font-size="15" fill="#8b3a3a" text-anchor="middle" style="font-family: serif">大清</text>
              <text x="50" y="66" font-size="15" fill="#8b3a3a" text-anchor="middle" style="font-family: serif">邮政</text>
            </svg>
          </div>
        </div>
      </div>

      <!-- 提示 + 关闭按钮 -->
      <div class="qp-caption" :class="{ 'qp-show': textVisible }">
        <p class="qp-caption-main">侨 批 已 封</p>
        <p class="qp-caption-sub">点 击 空 白 处 或 「收 妥」关 闭</p>
      </div>
      <button class="qp-done-btn" :class="{ 'qp-show': actionsVisible }" @click="close">
        收 妥
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
/* ========== 遮罩 ========== */
.qp-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(30, 18, 10, 0.62);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  animation: qp-overlay-in 0.4s ease both;
}

.qp-overlay.qp-exiting {
  animation: qp-overlay-out 0.4s ease forwards;
}

@keyframes qp-overlay-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes qp-overlay-out { from { opacity: 1; } to { opacity: 0; } }

/* ========== 舞台 ========== */
.qp-stage {
  position: relative;
  width: 220px;
  height: 580px;
}

@media (max-width: 639px) {
  .qp-stage {
    transform: scale(0.78);
    transform-origin: center;
    margin: -60px 0;
  }
}

/* ========== 信封（竖式红条封） ========== */
.qp-envelope {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 220px;
  height: 372px;
  background:
    radial-gradient(rgba(120, 85, 40, 0.06) 1px, transparent 1.5px),
    linear-gradient(160deg, #f2e6c6 0%, #ece0bd 45%, #e6d6ac 100%);
  background-size: 9px 9px, 100% 100%;
  border: 1px solid rgba(120, 85, 40, 0.4);
  border-radius: 3px;
  box-shadow:
    inset 0 0 40px rgba(110, 75, 35, 0.22),
    0 10px 34px -12px rgba(40, 25, 10, 0.55);
  overflow: hidden;
  z-index: 5;
  animation: qp-env-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes qp-env-in {
  from { opacity: 0; transform: translateY(26px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 做旧斑渍 / 磨损 */
.qp-env-aging {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 82% 12%, rgba(120, 80, 35, 0.16), transparent 22%),
    radial-gradient(circle at 12% 88%, rgba(120, 80, 35, 0.14), transparent 20%),
    radial-gradient(circle at 90% 70%, rgba(90, 60, 25, 0.1), transparent 18%);
}

/* 中央红条 */
.qp-stripe {
  position: absolute;
  top: 20px;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  background:
    linear-gradient(180deg, #d23a2b 0%, #c8352a 50%, #cf3a2c 100%);
  box-shadow: inset 0 0 12px rgba(120, 20, 10, 0.35);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14px;
  z-index: 2;
}

/* 红条做旧磨白 */
.qp-stripe::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 240, 220, 0.25), transparent 30%),
    radial-gradient(circle at 70% 85%, rgba(255, 240, 220, 0.2), transparent 28%);
  mix-blend-mode: screen;
  pointer-events: none;
}

/* ========== 竖排文字通用 ========== */
.qp-v {
  writing-mode: vertical-rl;
  font-family: var(--font-calligraphy);
  color: #241108;
  letter-spacing: 0.08em;
  line-height: 1.7;
  white-space: nowrap;
}

/* 题字浮现（墨迹晕开） */
.qp-col,
.qp-title,
.qp-postmark {
  opacity: 0;
  filter: blur(4px);
  transition: opacity 0.6s ease, filter 0.6s ease;
}

.qp-col.qp-show,
.qp-title.qp-show,
.qp-postmark.qp-show {
  opacity: 1;
  filter: blur(0);
}

/* 交错浮现节奏 */
.qp-col-right.qp-show { transition-delay: 0.1s; }
.qp-title.qp-show { transition-delay: 0.4s; }
.qp-col-left.qp-show { transition-delay: 0.7s; }
.qp-postmark.qp-show { transition-delay: 1s; }

/* 红条上的称谓（大字、墨黑） */
.qp-title {
  font-size: 25px;
  font-weight: 600;
  color: #1a0d06;
  z-index: 3;
}

/* 右列：寄达地址 */
.qp-col-right {
  position: absolute;
  top: 22px;
  right: 16px;
  z-index: 2;
}

.qp-col-right .qp-v {
  font-size: 19px;
  font-weight: 600;
}

/* 左区：汇款 + 寄款人（两列并排，右起） */
.qp-col-left {
  position: absolute;
  bottom: 20px;
  left: 14px;
  display: flex;
  flex-direction: row-reverse;
  gap: 6px;
  z-index: 2;
}

.qp-col-left .qp-v {
  font-size: 16px;
}

.qp-amount {
  font-weight: 600;
}

/* 邮戳 */
.qp-postmark {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 52px;
  height: 52px;
  transform: rotate(-11deg);
  opacity: 0;
  z-index: 4;
  mix-blend-mode: multiply;
}

.qp-postmark.qp-show {
  opacity: 0.78;
}

.qp-postmark svg { width: 100%; height: 100%; }

/* ========== 信纸（折叠没入） ========== */
.qp-paper {
  position: absolute;
  top: 10px;
  left: 50%;
  width: 150px;
  transform: translateX(-50%);
  z-index: 3;
  opacity: 1;
  transition:
    top 0.75s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.75s ease;
  animation: qp-paper-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes qp-paper-in {
  from { opacity: 0; transform: translateX(-50%) translateY(-24px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.qp-paper-sheet {
  height: 180px;
  background: linear-gradient(175deg, #fdf9f1, #f6ecda);
  border: 1px solid rgba(139, 90, 43, 0.25);
  border-radius: 2px;
  box-shadow: 0 3px 12px rgba(60, 40, 20, 0.18);
  overflow: hidden;
  transition: width 0.65s cubic-bezier(0.4, 0, 0.6, 1);
  /* 竖排信笺：竖线 */
  padding: 16px 12px;
}

.qp-paper-cols {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  justify-content: center;
  gap: 9px;
  height: 100%;
}

.qp-paper-col {
  width: 3px;
  background: linear-gradient(180deg, rgba(44, 24, 16, 0.28), rgba(44, 24, 16, 0.08));
  border-radius: 1px;
}

/* 折叠没入：信纸收窄成条，下移进入信封后方被遮挡 */
.qp-paper--insert,
.qp-paper--reveal,
.qp-paper--done {
  top: 250px;
  opacity: 0;
}

.qp-paper--insert .qp-paper-sheet,
.qp-paper--reveal .qp-paper-sheet,
.qp-paper--done .qp-paper-sheet {
  width: 56px;
}

/* ========== 提示文字 ========== */
.qp-caption {
  text-align: center;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: 0.5s;
}

.qp-caption.qp-show {
  opacity: 1;
  transform: translateY(0);
}

.qp-caption-main {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  letter-spacing: 0.3em;
  color: #f5e6c8;
  text-indent: 0.3em;
}

.qp-caption-sub {
  margin-top: 0.5rem;
  font-family: var(--font-serif);
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  color: rgba(245, 230, 200, 0.55);
}

/* ========== 关闭控件 ========== */
.qp-close-x {
  position: absolute;
  top: 1rem;
  right: 1.2rem;
  width: 40px;
  height: 40px;
  font-size: 1.8rem;
  line-height: 1;
  color: rgba(245, 230, 200, 0.7);
  background: transparent;
  border: 1px solid rgba(245, 230, 200, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s ease;
}

.qp-close-x:hover {
  color: #f5e6c8;
  border-color: rgba(245, 230, 200, 0.7);
  background: rgba(245, 230, 200, 0.08);
}

.qp-done-btn {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  letter-spacing: 0.4em;
  text-indent: 0.4em;
  color: #f5e6c8;
  background: transparent;
  border: 1px solid rgba(245, 230, 200, 0.45);
  border-radius: 0;
  padding: 0.7rem 2.2rem;
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
  transition: opacity 0.5s ease, transform 0.5s ease, background 0.4s ease, letter-spacing 0.4s ease;
}

.qp-done-btn.qp-show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.qp-done-btn:hover {
  background: rgba(245, 230, 200, 0.12);
  letter-spacing: 0.52em;
}

/* 尊重「减少动态效果」偏好 */
@media (prefers-reduced-motion: reduce) {
  .qp-paper,
  .qp-paper-sheet,
  .qp-col,
  .qp-title,
  .qp-postmark,
  .qp-caption {
    transition-duration: 0.01ms !important;
  }
}
</style>
