<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{ done: [] }>()

const phase = ref<'fold' | 'insert' | 'seal' | 'done'>('fold')
const isExiting = ref(false)

onMounted(() => {
  // Stage timeline controlled by JS for reliable sequencing
  setTimeout(() => { phase.value = 'insert' }, 1200)   // Fold → insert
  setTimeout(() => { phase.value = 'seal' }, 2200)      // Insert → seal
  setTimeout(() => { phase.value = 'done' }, 3000)      // Seal → done
  setTimeout(() => { isExiting.value = true }, 3400)    // Start exit fade
  setTimeout(() => { emit('done') }, 3800)              // Remove from DOM
})
</script>

<template>
  <Teleport to="body">
    <div class="envelope-anim-overlay" :class="{ 'anim-exiting': isExiting }">
      <div class="envelope-anim-stage">

        <!-- Envelope (always visible, paper slides into it) -->
        <div class="envelope-container" :class="'phase-' + phase">
          <!-- Envelope body -->
          <div class="envelope-body">
            <!-- Back flap (behind paper) -->
            <div class="envelope-flap-back"></div>
            <!-- Front face with opening -->
            <div class="envelope-face">
              <div class="envelope-opening"></div>
            </div>
          </div>
          <!-- Front flap (closes down in seal phase) -->
          <div class="envelope-flap-front">
            <div class="flap-triangle"></div>
          </div>
          <!-- Red seal stamp -->
          <div class="seal-stamp" :class="{ 'seal-visible': phase === 'seal' || phase === 'done' }">
            <span class="seal-text">侨<br>批</span>
          </div>
        </div>

        <!-- Paper (folds and slides into envelope) -->
        <div class="paper-wrapper" :class="'paper-phase-' + phase">
          <div class="paper-sheet">
            <!-- Simulated text lines on paper -->
            <div class="paper-lines">
              <div class="paper-line" v-for="i in 12" :key="i" :style="{ width: (70 + Math.random() * 25) + '%' }"></div>
            </div>
            <!-- Red seal hint on paper -->
            <div class="paper-red-mark"></div>
          </div>
        </div>

        <!-- "已寄出" text -->
        <div class="sent-label" :class="{ 'sent-visible': phase === 'done' }">
          已寄出 ✉️
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ========== Overlay ========== */
.envelope-anim-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlay-in 0.4s ease both;
}

.envelope-anim-overlay.anim-exiting {
  animation: overlay-out 0.4s ease forwards;
}

@keyframes overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes overlay-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* ========== Stage Container ========== */
.envelope-anim-stage {
  position: relative;
  width: 300px;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ========== Paper ========== */
.paper-wrapper {
  position: absolute;
  width: 180px;
  /* Center the paper; it moves down during insert phase */
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              top 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.paper-sheet {
  background: #fdf8f0;
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 2px;
  padding: 12px 16px;
  box-shadow:
    0 1px 3px rgba(0,0,0,0.08),
    0 4px 16px rgba(0,0,0,0.06);
  /* Full paper height */
  height: 240px;
  overflow: hidden;
  position: relative;
  /* Transition for folding */
  transition: height 0.5s cubic-bezier(0.4, 0, 0.6, 1),
              padding 0.5s cubic-bezier(0.4, 0, 0.6, 1);
}

/* Paper text lines */
.paper-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
}

.paper-line {
  height: 3px;
  background: linear-gradient(90deg, rgba(44,24,16,0.25) 0%, rgba(44,24,16,0.08) 100%);
  border-radius: 1px;
}

/* Red chop mark on paper corner */
.paper-red-mark {
  position: absolute;
  bottom: 16px;
  right: 20px;
  width: 28px;
  height: 28px;
  border: 2px solid rgba(204, 0, 0, 0.5);
  border-radius: 50%;
  opacity: 0.6;
}

/* Phase: insert — paper folds smaller and moves down */
.paper-phase-insert .paper-wrapper {
  top: 110px;
}

.paper-phase-insert .paper-sheet {
  height: 40px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.paper-phase-insert .paper-lines {
  gap: 2px;
  opacity: 0.5;
}

.paper-phase-insert .paper-red-mark {
  opacity: 0;
}

/* Phase: seal — paper hidden inside envelope */
.paper-phase-seal .paper-wrapper,
.paper-phase-done .paper-wrapper {
  top: 190px;
  opacity: 0;
  transform: translateX(-50%) scale(0.8);
}

/* ========== Envelope ========== */
.envelope-container {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  z-index: 5;
}

.envelope-body {
  position: relative;
  width: 220px;
  height: 110px;
  background: linear-gradient(180deg, #f0deba 0%, #e8d09e 100%);
  border: 1.5px solid rgba(139, 90, 43, 0.35);
  border-radius: 4px;
  box-shadow:
    0 2px 6px rgba(0,0,0,0.1),
    0 8px 24px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* Back flap (inside envelope, behind opening) */
.envelope-flap-back {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 100px solid transparent;
  border-right: 100px solid transparent;
  border-top: 50px solid #edd7ac;
  z-index: 1;
}

/* Envelope face with V-shaped opening */
.envelope-face {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  /* Draw V-cut using two diagonal clipped sections */
  background:
    linear-gradient(135deg, #f0deba 0%, #f0deba 49%, transparent 50%, transparent 100%),
    linear-gradient(225deg, #f0deba 0%, #f0deba 49%, transparent 50%, transparent 100%);
  border-radius: 4px;
}

.envelope-opening {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 85px solid transparent;
  border-right: 85px solid transparent;
  border-bottom: 45px solid #fdf8f0;
  z-index: 3;
}

/* Front flap — triangle that closes down */
.envelope-flap-front {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%) rotateX(0deg);
  transform-origin: top center;
  z-index: 4;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.phase-seal .envelope-flap-front,
.phase-done .envelope-flap-front {
  transform: translateX(-50%) rotateX(180deg);
}

.flap-triangle {
  width: 0;
  height: 0;
  border-left: 100px solid transparent;
  border-right: 100px solid transparent;
  border-top: 50px solid #e8cc96;
  position: relative;
}

.flap-triangle::after {
  content: '';
  position: absolute;
  top: -52px;
  left: -102px;
  width: 0;
  height: 0;
  border-left: 102px solid transparent;
  border-right: 102px solid transparent;
  border-top: 52px solid rgba(139, 90, 43, 0.2);
}

/* ========== Seal Stamp ========== */
.seal-stamp {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 44px;
  height: 44px;
  border: 2.5px solid #cc0000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  background: rgba(255, 255, 255, 0.3);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.seal-stamp.seal-visible {
  transform: translate(-50%, -50%) scale(1);
}

.seal-text {
  font-family: var(--font-calligraphy);
  font-size: 16px;
  color: #cc0000;
  line-height: 1.1;
  text-align: center;
  font-weight: bold;
}

/* ========== Sent Label ========== */
.sent-label {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: #f5e6c8;
  opacity: 0;
  transition: all 0.6s ease;
  letter-spacing: 0.1em;
}

.sent-label.sent-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
