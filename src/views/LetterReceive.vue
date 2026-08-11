<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { readSharedFromHash, type SharePayload } from '@/utils/share'
import { buildEnvelopeText } from '@/utils/envelope'
import QiaopiEnvelope from '@/components/letter/QiaopiEnvelope.vue'
import LetterArtifact from '@/components/letter/LetterArtifact.vue'

type Phase = 'loading' | 'sealed' | 'opening' | 'reading' | 'missing'

const phase = ref<Phase>('loading')
const payload = ref<SharePayload | null>(null)

const env = computed(() => buildEnvelopeText(payload.value))
const fromLabel = computed(() => payload.value?.fromLocation?.trim() || '远方')

onMounted(() => {
  const p = readSharedFromHash()
  if (!p) {
    phase.value = 'missing'
    return
  }
  payload.value = p
  phase.value = 'sealed'
})

function openLetter() {
  if (phase.value !== 'sealed') return
  phase.value = 'opening'
  // 拆封动画播放后进入阅读态
  setTimeout(() => { phase.value = 'reading' }, 1300)
}
</script>

<template>
  <div class="rc-root">
    <!-- 找不到内容 -->
    <div v-if="phase === 'missing'" class="rc-missing">
      <p class="rc-missing-title">这 封 侨 批 没 有 找 到</p>
      <p class="rc-missing-sub">链接可能不完整，或已失效。每一封侨批只随链接而存，别处寻不见。</p>
      <router-link to="/write" class="ink-button mt-2">我 来 写 一 封</router-link>
    </div>

    <!-- 封着 / 拆封中 -->
    <div v-else-if="phase === 'sealed' || phase === 'opening'" class="rc-stage-wrap">
      <div class="rc-stage" :class="'rc-' + phase" @click="openLetter">
        <!-- 抽出的信纸（示意，拆封时升起） -->
        <div class="rc-paper">
          <div class="rc-paper-sheet">
            <div class="rc-paper-cols">
              <span
                v-for="i in 9"
                :key="i"
                class="rc-paper-col"
                :style="{ height: (55 + ((i * 37) % 40)) + '%' }"
              ></span>
            </div>
          </div>
        </div>
        <!-- 信封 -->
        <div class="rc-env">
          <QiaopiEnvelope
            :title="env.title"
            :to-text="env.toText"
            :amount-text="env.amountText"
            :sender-text="env.senderText"
            :revealed="true"
          />
        </div>
      </div>

      <p class="rc-hint" :class="{ 'rc-hint-hidden': phase === 'opening' }">
        轻 触 · 拆 开 这 封 侨 批
      </p>
    </div>

    <!-- 阅读 -->
    <div v-else-if="phase === 'reading'" class="rc-reading">
      <p class="rc-from">{{ fromLabel }}　寄 来 一 封 侨 批</p>
      <LetterArtifact :content="payload!.content" />
      <div class="rc-cta">
        <p class="rc-sign">— 侨批AI代书人 代 书 —</p>
        <router-link to="/write" class="ink-button">我 也 写 一 封</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rc-root {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(139, 90, 43, 0.06) 0%, transparent 55%),
    #f4ecd8;
}

/* ========== 找不到 ========== */
.rc-missing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  max-width: 26rem;
}

.rc-missing-title {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  letter-spacing: 0.2em;
  color: var(--color-ink);
  text-indent: 0.2em;
}

.rc-missing-sub {
  font-family: var(--font-serif);
  font-size: 0.85rem;
  line-height: 1.9;
  letter-spacing: 0.05em;
  color: rgba(44, 24, 16, 0.55);
}

/* ========== 拆封舞台 ========== */
.rc-stage-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.rc-stage {
  position: relative;
  width: 220px;
  height: 372px;
  cursor: pointer;
}

@media (max-width: 639px) {
  .rc-stage {
    transform: scale(0.82);
    transform-origin: center;
  }
}

.rc-env {
  position: absolute;
  inset: 0;
  z-index: 5;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease;
}

/* 封着时轻微浮动，引导点击 */
.rc-sealed .rc-env {
  animation: rc-breathe 2.6s ease-in-out infinite;
}

@keyframes rc-breathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* 拆封：信封下沉淡出 */
.rc-opening .rc-env {
  animation: none;
  transform: translateY(46px);
  opacity: 0;
}

/* 抽出的信纸条 */
.rc-paper {
  position: absolute;
  top: 70px;
  left: 50%;
  width: 130px;
  transform: translateX(-50%);
  z-index: 3;
  opacity: 0;
  transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease;
}

.rc-paper-sheet {
  height: 150px;
  background: linear-gradient(175deg, #fdf9f1, #f6ecda);
  border: 1px solid rgba(139, 90, 43, 0.25);
  border-radius: 2px;
  box-shadow: 0 6px 18px rgba(60, 40, 20, 0.2);
  overflow: hidden;
  padding: 14px 10px;
}

.rc-paper-cols {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  height: 100%;
}

.rc-paper-col {
  width: 3px;
  background: linear-gradient(180deg, rgba(44, 24, 16, 0.28), rgba(44, 24, 16, 0.08));
  border-radius: 1px;
}

/* 拆封：信纸升起并展开 */
.rc-opening .rc-paper {
  opacity: 1;
  transform: translateX(-50%) translateY(-70px);
}

/* ========== 提示 ========== */
.rc-hint {
  font-family: var(--font-serif);
  font-size: 0.9rem;
  letter-spacing: 0.25em;
  text-indent: 0.25em;
  color: rgba(44, 24, 16, 0.5);
  animation: rc-hint-pulse 2.6s ease-in-out infinite;
  transition: opacity 0.4s ease;
}

.rc-hint-hidden {
  opacity: 0;
}

@keyframes rc-hint-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.85; }
}

/* ========== 阅读 ========== */
.rc-reading {
  width: 100%;
  max-width: 48rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: rc-fade-in 0.6s ease both;
}

@keyframes rc-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.rc-from {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  letter-spacing: 0.2em;
  text-indent: 0.2em;
  color: rgba(44, 24, 16, 0.6);
}

.rc-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-top: 0.5rem;
}

.rc-sign {
  font-family: var(--font-serif);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: rgba(44, 24, 16, 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .rc-env,
  .rc-paper {
    transition-duration: 0.01ms !important;
  }
  .rc-sealed .rc-env,
  .rc-hint {
    animation: none;
  }
}
</style>
