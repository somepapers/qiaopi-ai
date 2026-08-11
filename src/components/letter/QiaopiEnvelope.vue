<script setup lang="ts">
import { computed } from 'vue'

// 可复用的竖式侨批红条封（纯 CSS 绘制）。
// 装入动画（EnvelopeAnimation）与收信拆封页（LetterReceive）共用。
const props = withDefaults(
  defineProps<{
    title: string
    toText: string
    amountText?: string
    senderText: string
    revealed?: boolean
    showSeal?: boolean
  }>(),
  {
    amountText: '',
    revealed: true,
    showSeal: true,
  }
)

// 红条可书高度约 318px（372 - 上下留白 - 顶部内距），行高 1.7；
// 题字（名讳＋敬辞）字数多时收缩字号，保证一列直书不溢出
const titleFontSize = computed(() => {
  const len = props.title.length || 1
  return Math.min(25, Math.max(14, Math.floor(318 / (len * 1.7))))
})
</script>

<template>
  <div class="qp-envelope">
    <div class="qp-env-aging"></div>

    <!-- 右列：寄达地址 -->
    <div class="qp-col qp-col-right" :class="{ 'qp-show': revealed }">
      <span class="qp-v">{{ toText }}</span>
    </div>

    <!-- 中央红条：收信人名讳＋启封敬辞 -->
    <div class="qp-stripe">
      <span
        class="qp-v qp-title"
        :class="{ 'qp-show': revealed }"
        :style="{ fontSize: titleFontSize + 'px' }"
      >{{ title }}</span>
    </div>

    <!-- 左区：汇款金额 + 寄款人 -->
    <div class="qp-col qp-col-left" :class="{ 'qp-show': revealed }">
      <span v-if="amountText" class="qp-v qp-amount">{{ amountText }}</span>
      <span class="qp-v">{{ senderText }}</span>
    </div>

    <!-- 「寻侨迹 传侨魂」馆藏印章：钤于右下 -->
    <img
      v-if="showSeal"
      class="qp-seal"
      :class="{ 'qp-show': revealed }"
      src="/qiaopi-seal.png"
      alt=""
      aria-hidden="true"
      draggable="false"
    />
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
.qp-title {
  opacity: 0;
  filter: blur(4px);
  transition: opacity 0.6s ease, filter 0.6s ease;
}

.qp-col.qp-show,
.qp-title.qp-show {
  opacity: 1;
  filter: blur(0);
}

/* 交错浮现节奏 */
.qp-col-right.qp-show { transition-delay: 0.1s; }
.qp-title.qp-show { transition-delay: 0.4s; }
.qp-col-left.qp-show { transition-delay: 0.7s; }

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

/* 「寻侨迹 传侨魂」印章：multiply 融入纸底，浮现时带盖章按压回弹 */
.qp-seal {
  position: absolute;
  right: 5px;
  bottom: 16px;
  width: 92px;
  opacity: 0;
  transform: rotate(-7deg) scale(1.22);
  mix-blend-mode: multiply;
  pointer-events: none;
  user-select: none;
  z-index: 5;
  transition:
    opacity 0.4s ease,
    transform 0.5s cubic-bezier(0.22, 1.35, 0.36, 1);
}

.qp-seal.qp-show {
  opacity: 0.9;
  transform: rotate(-7deg) scale(1);
  transition-delay: 1s;
}

@media (prefers-reduced-motion: reduce) {
  .qp-col,
  .qp-title,
  .qp-seal {
    transition-duration: 0.01ms !important;
  }
}
</style>
