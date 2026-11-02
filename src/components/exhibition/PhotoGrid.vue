<script setup lang="ts">
import { reactive } from 'vue'
import type { ExhibitionImage } from '@/types/exhibition'

defineProps<{ images: ExhibitionImage[], design: boolean }>()
const emit = defineEmits<{ open: [id: string] }>()
const failed = reactive(new Set<string>())
const loaded = reactive(new Set<string>())
const attempts = reactive<Record<string, number>>({})

function retry(id: string) {
  failed.delete(id)
  attempts[id] = (attempts[id] ?? 0) + 1
}
</script>

<template>
  <div class="cards" :class="{ designs: design }">
    <article v-for="(image, index) in images" :key="image.id">
      <button class="work" type="button" :aria-label="'放大查看 · ' + image.title" @click="emit('open', image.id)">
        <span class="mount">
          <span v-if="!loaded.has(image.id) && !failed.has(image.id)" class="absolute inset-0 skeleton-shimmer"></span>
          <img v-if="!failed.has(image.id)" :key="attempts[image.id] ?? 0" :src="image.thumb" :alt="image.title"
            :loading="index === 0 ? 'eager' : 'lazy'" :fetchpriority="index === 0 ? 'high' : 'auto'" decoding="async"
            @load="loaded.add(image.id)" @error="failed.add(image.id)" />
          <span v-else class="text-sm text-ink/60">预览图暂时不可用</span>
        </span>
        <span class="caption">
          <span class="number">{{ design ? '设计作品' : '馆藏影像' }} · {{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ image.title }}</strong>
          <span v-if="image.credit" class="credit">{{ design ? '署名' : '来源' }} · {{ image.credit }}</span>
          <span v-if="image.desc" class="description">{{ image.desc }}</span>
        </span>
      </button>
      <button v-if="failed.has(image.id)" class="retry" @click="retry(image.id)">重新加载预览图</button>
    </article>
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  gap: 1.3rem;
  grid-template-columns: repeat(3,minmax(0,1fr));
}
article {
  border: 1px solid #67472c30;
  background: #fffaf1;
  min-width: 0;
}
.work {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  cursor: zoom-in;
  color: var(--color-ink);
}
.work:focus-visible,.retry:focus-visible {
  outline: 3px solid #973c2c;
  outline-offset: 3px;
}
.mount {
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 4/3;
  background: #e9dfce;
  border: 9px solid #f2e9da;
}
.mount img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  inset: 0;
}
.caption {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .4rem;
  padding: 1.1rem 1.2rem;
  overflow-wrap: anywhere;
}
.number {
  color: #8c3529;
  font-size: .72rem;
  letter-spacing: .13em;
}
.caption strong {
  font-size: 1.15rem;
  font-weight: 600;
}
.credit,.description {
  font-size: .87rem;
  line-height: 1.7;
  color: #645142;
}
.work:hover strong {
  color: #913b30;
}
.designs {
  grid-template-columns: repeat(2,minmax(0,1fr));
}
.designs .mount {
  aspect-ratio: 1;
}
.retry {
  color: #893628;
  padding: .4rem 1.2rem;
  text-decoration: underline;
}
@media(max-width:850px) {
  .cards {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }
}
@media(max-width:640px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .caption {
    padding: 1rem;
  }
}
</style>
