<script setup lang="ts">
import { featured } from '@/assets/exhibition/featured'

defineProps<{ src: string }>()
const { left, top, fraction } = featured.crop
const percent = (ratio: number) => (ratio * 100) + '%'
const marker = { left: percent(left), top: percent(top), width: percent(fraction), height: percent(fraction) }
const enlarged = { left: percent(-left / fraction), top: percent(-top / fraction), width: percent(1 / fraction) }
</script>

<template>
  <section aria-label="展品精读" class="reading">
    <figure>
      <figcaption>档案原件 · 全图</figcaption>
      <div class="relative">
        <img :src="src" :alt="featured.title" class="block aspect-[4/3] w-full" />
        <span aria-hidden="true" class="marker" :style="marker"></span>
      </div>
    </figure>
    <div>
      <figure>
        <figcaption>局部放大 · {{ featured.location }}</figcaption>
        <div class="relative aspect-[4/3] overflow-hidden">
          <img :src="src" alt="原图白框内的红线转角、黑色笔画与纸面缺口" class="absolute max-w-none" :style="enlarged" />
        </div>
      </figure>
      <p class="mt-3 leading-relaxed">{{ featured.reading }}</p>
    </div>
  </section>
</template>

<style scoped>
.reading { width: min(68rem,100%); margin-block: auto; display: grid; gap: 1.2rem; }
.reading figcaption { margin-bottom: .5rem; font-size: .95rem; color: #f3ddbb; }
.marker { position: absolute; border: 2px solid #fff; box-shadow: 0 0 0 1px #4b3026, inset 0 0 0 1px #4b3026; }
@media (min-width: 768px) {
  .reading { grid-template-columns: 1.55fr 1fr; align-items: start; gap: 2rem; }
}
</style>
