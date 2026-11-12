<script setup lang="ts">
import archivePhoto from '@/assets/exhibition/qiaopi/侨批1.jpg.detail.webp'
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
    <section aria-labelledby="team-title" class="grid items-center gap-8 border-b border-ink/15 py-10 md:grid-cols-2 md:gap-12 md:py-16">
      <div class="font-serif">
        <p class="mb-4 text-sm font-semibold tracking-widest text-red-seal">闽江大学 · 暑期社会实践团队</p>
        <h1 id="team-title" class="text-4xl font-bold leading-tight text-ink lg:text-5xl">寻侨迹，传侨魂</h1>
        <p class="mt-6 max-w-lg leading-loose text-ink-light">
          一封侨批，既是海外亲人寄回的汇款凭证，也是写给家里人的信。我们想让更多人有机会读到这些家书，看看远隔重洋的一家人怎样报平安、寄牵挂。
        </p>
        <p class="mt-3 max-w-lg leading-loose text-ink-light">
          我们把侨批影像收进线上展览馆，设计了团队吉祥物“侨燕”，也做了 AI 代书人，让你用自己的话写一封家书。
        </p>
        <div class="mt-7 flex flex-wrap items-center gap-4">
          <router-link to="/exhibition" class="btn-primary">走进展览馆</router-link>
          <router-link to="/write" class="btn-secondary">体验 AI 写侨批</router-link>
        </div>
        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-red-seal">
          <router-link to="/culture" class="underline underline-offset-4">了解侨批文化</router-link>
          <router-link to="/media" class="underline underline-offset-4">查看媒体报道</router-link>
        </div>
      </div>
      <figure class="m-0 border border-ink/15 bg-[#fffaf1] p-3 shadow-sm sm:p-4">
        <img :src="archivePhoto" alt="展览馆展出的第一件侨批原件影像" fetchpriority="high" class="aspect-[4/3] w-full bg-[#eee6d9] object-contain" />
        <figcaption class="mt-3 flex flex-wrap justify-between gap-2 font-serif text-sm text-ink-light">
          <span>侨批原件展示（一）</span><span>福建省档案馆</span>
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

    <!-- Feature Cards -->
    <section class="py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="vintage-paper compact-card rounded-xl p-4 md:p-6 text-center">
        <div class="text-3xl md:text-4xl mb-2">🤖</div>
        <h3 class="text-lg font-serif font-semibold text-ink mb-1.5">AI智能生成</h3>
        <p class="text-sm text-ink-light font-serif">
          口语说你想说的话，AI自动将其转化为传统侨批格式的古典家书
        </p>
      </div>
      <div class="vintage-paper compact-card rounded-xl p-4 md:p-6 text-center">
        <div class="text-3xl md:text-4xl mb-2">📜</div>
        <h3 class="text-lg font-serif font-semibold text-ink mb-1.5">经典模板</h3>
        <p class="text-sm text-ink-light font-serif">
          收录多种场景的侨批范文模板，寄钱汇款、节日祝福、问候平安一应俱全
        </p>
      </div>
      <div class="vintage-paper compact-card rounded-xl p-4 md:p-6 text-center">
        <div class="text-3xl md:text-4xl mb-2">🏛️</div>
        <h3 class="text-lg font-serif font-semibold text-ink mb-1.5">文化传承</h3>
        <p class="text-sm text-ink-light font-serif">
          了解侨批历史、书写格式、敬语传统，让百年文化遗产在指尖延续
        </p>
      </div>
    </section>

    <!-- Quick Start -->
    <section class="py-12 text-center">
      <h2 class="text-2xl font-serif font-bold text-ink mb-6">三步写一封侨批</h2>
      <div class="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-3xl mx-auto">
        <div class="flex-1 vintage-paper compact-card rounded-xl p-4 md:p-5 text-center">
          <div class="w-9 h-9 mx-auto mb-2 rounded-full bg-red-seal/10 flex items-center justify-center text-red-seal font-bold text-lg">1</div>
          <p class="font-serif text-ink font-semibold">选择收信人</p>
          <p class="text-sm text-ink-light mt-1">父母、妻子、兄弟……告诉AI给谁写信</p>
        </div>
        <div class="hidden md:flex items-center justify-center text-ink/20 text-2xl shrink-0">→</div>
        <div class="flex-1 vintage-paper compact-card rounded-xl p-4 md:p-5 text-center">
          <div class="w-9 h-9 mx-auto mb-2 rounded-full bg-red-seal/10 flex items-center justify-center text-red-seal font-bold text-lg">2</div>
          <p class="font-serif text-ink font-semibold">输入想说的话</p>
          <p class="text-sm text-ink-light mt-1">用口语描述你想传达的内容</p>
        </div>
        <div class="hidden md:flex items-center justify-center text-ink/20 text-2xl shrink-0">→</div>
        <div class="flex-1 vintage-paper compact-card rounded-xl p-4 md:p-5 text-center">
          <div class="w-9 h-9 mx-auto mb-2 rounded-full bg-red-seal/10 flex items-center justify-center text-red-seal font-bold text-lg">3</div>
          <p class="font-serif text-ink font-semibold">AI生成侨批</p>
          <p class="text-sm text-ink-light mt-1">一键生成，导出精美书信图片分享</p>
        </div>
      </div>
    </section>
  </div>
</template>
