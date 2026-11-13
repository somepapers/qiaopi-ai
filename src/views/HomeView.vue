<script setup lang="ts">
import { featured } from '@/assets/exhibition/featured'
import { onMounted } from 'vue'
import { publishedRecords } from '@/utils/practice'

const latest = publishedRecords[0]
import { useVisitCount } from '@/composables/useVisitCount'

const { visitCount, recordVisit } = useVisitCount()

onMounted(async () => {
  // 与 App.vue 共享同一次计数请求，拿到本次访问 +1 后的最新值
  const count = await recordVisit()
  if (count !== null) return
  // 计数失败时兜底读取（只读，不再 +1）
  try {
    const res = await fetch('/api/stats')
    const data = await res.json()
    if (typeof data.count === 'number') {
      visitCount.value = data.count
    }
  } catch {
    // 静默失败，不阻塞页面
  }
})
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <section aria-labelledby="team-title" class="hero border-b border-ink/15">
      <div>
        <p class="mb-2 font-semibold tracking-widest text-[#873e30] lg:mb-4">闽江大学 · 社会实践团队</p>
        <h1 id="team-title" class="text-[clamp(2.1rem,4.2vw,3.6rem)] font-bold leading-tight text-ink">寻侨迹，传侨魂</h1>
        <p class="mt-3 max-w-lg text-base leading-relaxed text-ink-light lg:mt-6 lg:text-xl lg:leading-loose">
          一封侨批，既是海外亲人寄回的汇款凭证，也是写给家里人的信。
        </p>
        <h2 class="mt-5 border-t border-ink/15 pt-4 text-xl font-bold text-ink lg:mt-7 lg:pt-6 lg:text-2xl">
          <span class="text-sm font-semibold text-[#873e30] lg:text-base">团队重点成果 · </span>侨批 AI 代书人
        </h2>
        <p class="mt-2 max-w-lg leading-relaxed text-ink-light lg:text-lg">
          写下你想对家人说的话，AI 会帮你整理成一封侨批格式的家书。
        </p>
        <RouterLink to="/write" class="ink-button primary-action mt-4 min-h-11">用 AI 写家书</RouterLink>
      </div>
      <figure class="border border-ink/15 bg-[#fffaf1] p-3 shadow-sm lg:p-4">
        <RouterLink :to="featured.to" :aria-label="'读这件侨批 · ' + featured.title" class="block">
          <img :src="featured.photo" alt="木桌上的侨批，纸面上有红色长框和墨字" width="1920" height="1440" fetchpriority="high" class="w-full h-auto" />
        </RouterLink>
        <figcaption class="mt-3">
          <div class="flex flex-wrap items-baseline justify-between gap-x-2">
            <strong class="text-base lg:text-xl">{{ featured.title }}</strong>
            <span class="text-sm text-ink-light">{{ featured.credit }}</span>
          </div>
          <p class="mt-1 text-base leading-relaxed text-ink-light">{{ featured.guide }}</p>
          <RouterLink :to="featured.to" class="inline-flex min-h-11 items-center text-[#873e30] underline underline-offset-4">读这件侨批</RouterLink>
        </figcaption>
      </figure>
    </section>
    <section v-if="latest" class="border-b border-ink/15 py-8">
      <h2 class="mb-4 text-sm font-semibold tracking-widest text-red-seal">最新实践记录</h2>
      <RouterLink :to="{ name: 'practice-detail', params: { slug: latest.slug } }"
        class="group grid items-center gap-5 md:grid-cols-[1fr_2fr]">
        <img :src="latest.photos[0].src" :alt="latest.photos[0].alt" class="h-auto w-full" />
        <div>
          <h3 class="text-2xl font-bold group-hover:text-red-seal">{{ latest.title }}</h3>
          <p class="mt-3 leading-loose text-ink-light">{{ latest.summary }}</p>
        </div>
      </RouterLink>
    </section>
    <p v-if="visitCount !== null" class="mt-4 text-right font-serif text-xs text-ink-light">网站已使用 {{ visitCount.toLocaleString() }} 次</p>

  </div>
</template>

<style scoped>
.hero {
  display: grid;
  gap: 1rem;
  padding: 1.5rem 0;
}
.primary-action { background: #873e30; border-color: #873e30; color: #fffaf1; }
.primary-action:hover { background: #683023; }
@media (min-width: 768px) {
  .hero {
    grid-template-columns: 1fr 1.1fr;
    align-items: center;
    column-gap: clamp(2rem,4vw,4rem);
    padding-block: clamp(2rem,4.5vw,4.5rem);
  }
}
</style>
