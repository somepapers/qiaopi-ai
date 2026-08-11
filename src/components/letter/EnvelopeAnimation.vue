<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLetterStore } from '@/stores/letter'
import { buildEnvelopeText } from '@/utils/envelope'
import QiaopiEnvelope from './QiaopiEnvelope.vue'

const emit = defineEmits<{ done: [] }>()
const store = useLetterStore()

const phase = ref<'enter' | 'insert' | 'reveal' | 'done'>('enter')
const isExiting = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []

const textVisible = computed(() => phase.value === 'reveal' || phase.value === 'done')
const actionsVisible = computed(() => phase.value === 'done')
const env = computed(() => buildEnvelopeText(store.input))

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
        <div class="qp-env-slot">
          <QiaopiEnvelope
            :title="env.title"
            :to-text="env.toText"
            :amount-text="env.amountText"
            :sender-text="env.senderText"
            :revealed="textVisible"
          />
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

/* 信封定位槽（相对舞台底部） */
.qp-env-slot {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 5;
  animation: qp-env-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes qp-env-in {
  from { opacity: 0; transform: translateY(26px); }
  to { opacity: 1; transform: translateY(0); }
}

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
  .qp-caption {
    transition-duration: 0.01ms !important;
  }
}
</style>
