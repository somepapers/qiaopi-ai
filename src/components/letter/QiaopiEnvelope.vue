<script setup lang="ts">
// 可复用的竖式侨批红条封（纯 CSS 绘制）。
// 装入动画（EnvelopeAnimation）与收信拆封页（LetterReceive）共用。
withDefaults(
  defineProps<{
    title: string
    toText: string
    amountText?: string
    senderText: string
    revealed?: boolean
    showPostmark?: boolean
  }>(),
  {
    amountText: '',
    revealed: true,
    showPostmark: true,
  }
)
</script>

<template>
  <div class="qp-envelope">
    <div class="qp-env-aging"></div>

    <!-- 右列：寄达地址 -->
    <div class="qp-col qp-col-right" :class="{ 'qp-show': revealed }">
      <span class="qp-v">{{ toText }}</span>
    </div>

    <!-- 中央红条：收信人称谓 -->
    <div class="qp-stripe">
      <span class="qp-v qp-title" :class="{ 'qp-show': revealed }">{{ title }}</span>
    </div>

    <!-- 左区：汇款金额 + 寄款人 -->
    <div class="qp-col qp-col-left" :class="{ 'qp-show': revealed }">
      <span v-if="amountText" class="qp-v qp-amount">{{ amountText }}</span>
      <span class="qp-v">{{ senderText }}</span>
    </div>

    <!-- 邮戳 -->
    <div v-if="showPostmark" class="qp-postmark" :class="{ 'qp-show': revealed }">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#8b3a3a" stroke-width="3" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#8b3a3a" stroke-width="1.2" />
        <text x="50" y="40" font-size="15" fill="#8b3a3a" text-anchor="middle" style="font-family: serif">大清</text>
        <text x="50" y="66" font-size="15" fill="#8b3a3a" text-anchor="middle" style="font-family: serif">邮政</text>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.qp-envelope {
  position: relative;
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
  background: linear-gradient(180deg, #d23a2b 0%, #c8352a 50%, #cf3a2c 100%);
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

/* 竖排文字通用 */
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

/* 红条上的称谓 */
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

@media (prefers-reduced-motion: reduce) {
  .qp-col,
  .qp-title,
  .qp-postmark {
    transition-duration: 0.01ms !important;
  }
}
</style>
