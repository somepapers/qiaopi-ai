<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ipImages, qiaopiImages } from '@/assets/exhibition'
import type { ExhibitionImage, Gallery } from '@/types/exhibition'
import PhotoGrid from '@/components/exhibition/PhotoGrid.vue'
import Lightbox from '@/components/exhibition/Lightbox.vue'

const route = useRoute()
const router = useRouter()
const tabs = [
  { key: 'qiaopi', number: '01', label: '侨批文化展示' },
  { key: 'ip', number: '02', label: '团队 IP 设计' },
] as const
const gallery = computed<Gallery>(() => route.query.tab === 'ip' ? 'ip' : 'qiaopi')
const isDesign = computed(() => gallery.value === 'ip')
const online = ref<ExhibitionImage[]>([])
const unavailable = ref(false)
const revision = ref(0)
const items = computed(() => [...(isDesign.value ? ipImages : qiaopiImages), ...online.value])
const index = computed(() => items.value.findIndex(item => item.id === route.query.work))
const current = computed(() => items.value[index.value])
function select(key: Gallery, work?: string) {
  void router.replace({ query: { ...route.query, tab: key, work } })
}
function move(direction: number) {
  select(gallery.value, items.value[(index.value + direction + items.value.length) % items.value.length]?.id)
}
watch([gallery, revision], async ([key], _, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  online.value = []
  unavailable.value = false
  try {
    const response = await fetch('/api/exhibition?gallery=' + key, { signal: controller.signal })
    if (!response.ok) throw new Error()
    const data = await response.json()
    if (!Array.isArray(data.items)) throw new Error()
    if (!controller.signal.aborted) online.value = data.items
  } catch {
    if (!controller.signal.aborted) unavailable.value = true
  }
}, { immediate: true })
</script>

<template>
  <div class="museum">
    <header class="mast">
      <div class="eyebrow"><span class="rule"></span> 寻侨迹，传侨魂 · 数字展厅</div>
      <h1>侨批展览馆</h1>
      <p>从一封远渡重洋的家书，到一方当代印记。</p>
      <span class="stamp" aria-hidden="true">侨批<br>展馆</span>
    </header>
    <nav aria-label="展区" class="halls">
      <button v-for="tab in tabs" :key="tab.key" :aria-pressed="gallery === tab.key"
        @click="gallery !== tab.key && select(tab.key)">
        <span>{{ tab.number }}</span>{{ tab.label }}
      </button>
    </nav>
    <section :aria-label="isDesign ? '团队 IP 设计' : '侨批文化展示'">
      <header class="section-head">
        <div class="eyebrow">{{ isDesign ? '第二展厅 · 设计作品' : '第一展厅 · 历史档案' }}</div>
        <h2>{{ isDesign ? '团队 IP 设计' : '侨批文化展示' }}</h2>
        <p>{{ isDesign ? '戴着斗笠、挎着邮包的侨燕，是团队的吉祥物。点开作品，细看它的形象设计与马克杯上的图案。' : '侨批将家书与汇款连在一起。点开影像，细看信封上的字迹与邮戳。' }}</p>
      </header>
      <PhotoGrid :key="gallery" :images="items" :design="isDesign" @open="select(gallery, $event)" />
      <p v-if="unavailable" role="status" class="catalog-note">正在展示内置馆藏，在线目录暂时不可用。<button @click="revision++">重新读取</button></p>
    </section>
    <footer class="museum-foot"><span>寻侨迹，传侨魂 · 社会实践团队</span></footer>
    <Lightbox v-if="current" :item="current" :index="index" :total="items.length" @move="move" @close="select(gallery)" />
  </div>
</template>

<style scoped>
.museum {
  max-width: 64rem;
  margin: 0 auto;
  padding: clamp(1rem,3vw,2.5rem) 0;
  color: var(--color-ink);
}
.mast {
  position: relative;
  padding: clamp(1.5rem,4vw,3rem);
  border-block: 1px solid #8b694b55;
  background: linear-gradient(110deg,#f5ebd9,#ece0cb);
  overflow: hidden;
}
.eyebrow {
  font-size: .73rem;
  letter-spacing: .18em;
  color: #843b2e;
  font-weight: 600;
}
.rule {
  display: inline-block;
  width: 2.2rem;
  height: 1px;
  vertical-align: middle;
  background: #923f32;
  margin-right: .35rem;
}
.mast h1 {
  font-size: clamp(2.45rem,6vw,4.5rem);
  line-height: 1.2;
  letter-spacing: .07em;
  font-weight: 650;
  margin: .6rem 0;
}
.mast p,.section-head p {
  color: #695744;
  line-height: 1.8;
  font-size: .95rem;
}
.mast p {
  text-wrap: balance;
}
.stamp {
  position: absolute;
  right: 7%;
  top: 50%;
  transform: translateY(-50%) rotate(-8deg);
  color: #944634a6;
  border: 4px double currentColor;
  border-radius: .35rem;
  font-size: clamp(2rem,5vw,3.7rem);
  line-height: 1.05;
  letter-spacing: .07em;
  padding: .25em .16em .2em .24em;
}
.halls {
  display: flex;
  border-bottom: 1px solid #775d4236;
}
.halls button {
  display: flex;
  gap: .7rem;
  align-items: baseline;
  justify-content: center;
  padding: 1rem 1.4rem;
  color: #675544;
  border-bottom: 3px solid transparent;
}
.halls button[aria-pressed=true] {
  color: #8e3527;
  border-color: #8e3527;
  font-weight: 650;
}
.halls span {
  font-family: Georgia,serif;
  font-size: .85rem;
}
.section-head {
  margin: 2.1rem 0 1.2rem;
}
.section-head h2 {
  font-size: clamp(1.45rem,3.5vw,2.05rem);
  font-weight: 650;
  margin: .3rem 0;
}
.museum-foot,.catalog-note {
  font-size: .83rem;
  color: #6c5946;
}
.catalog-note {
  margin-top: 1.5rem;
}
.catalog-note button,.museum-foot a {
  color: #873d30;
  text-decoration: underline;
  text-underline-offset: .2em;
}
.museum-foot {
  border-top: 1px solid #775d4236;
  margin: 2.5rem 0 0;
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  gap: .6rem;
}
@media(max-width:640px) {
  .stamp {
    font-size: 1.45rem;
    right: 1rem;
    top: 1.2rem;
    transform: rotate(-8deg);
  }
  .mast {
    padding: 1.25rem;
  }
  .mast p {
    max-width: 18rem;
  }
  .halls button {
    padding: .9rem .25rem;
    flex: 1;
    gap: .4rem;
  }
  .section-head {
    margin-top: 1.5rem;
  }
}
</style>
