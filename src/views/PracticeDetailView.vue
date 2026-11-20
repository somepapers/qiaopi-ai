<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { publishedRecords } from '@/utils/practice'
import PracticePhoto from '@/components/practice/PracticePhoto.vue'
const route = useRoute()
const index = computed(() => publishedRecords.findIndex(item => item.slug === route.params.slug))
const record = computed(() => publishedRecords[index.value])
const previous = computed(() => publishedRecords[index.value - 1])
const next = computed(() => publishedRecords[index.value + 1])
// 页面有 out-in 过渡；在新内容挂载后复位，避免沿用列表中部的滚动位置。
onMounted(() => window.scrollTo({ top: 0 }))
watch(() => route.params.slug, () => window.scrollTo({ top: 0 }), { flush: 'post' })
</script>

<template>
  <div class="practice-detail">
    <RouterLink to="/practice" class="back-link">实践足迹 / 寻侨手记</RouterLink>
    <article v-if="record" :key="record.slug">
      <header>
        <p class="detail-theme">{{ record.city }} · {{ record.theme || '实践记录' }}</p>
        <h1>{{ record.title }}</h1>
        <p class="detail-location"><time v-if="record.date" :datetime="record.date">{{ record.date }} · </time>{{ record.location }}</p>
      </header>
      <p class="detail-lead">{{ record.lead }}</p>
      <PracticePhoto v-if="record.photos[0]" :photo="record.photos[0]" priority :contain="record.slug === 'fuzhou-digital-creation'" />
      <div class="detail-prose"><p v-for="(paragraph, i) in record.paragraphs" :key="i">{{ paragraph }}</p></div>
      <section v-if="record.photos.length > 1" class="detail-gallery" aria-label="现场与成果影像">
        <PracticePhoto v-for="photo in record.photos.slice(1)" :key="photo.src" :photo="photo" :contain="record.slug === 'fuzhou-digital-creation'" />
      </section>
      <div v-if="record.slug === 'fuzhou-digital-creation'" class="detail-actions">
        <RouterLink to="/write">体验 AI 代书</RouterLink><RouterLink to="/media">观看实践影像与报道</RouterLink><RouterLink to="/exhibition?tab=ip">浏览侨燕文创</RouterLink>
      </div>
      <nav class="adjacent-stops" aria-label="继续阅读实践足迹">
        <RouterLink v-if="previous" :to="`/practice/${previous.slug}`"><span>上一站</span>{{ previous.station || previous.title }}</RouterLink>
        <RouterLink v-if="next" :to="`/practice/${next.slug}`" class="next-stop"><span>下一站</span>{{ next.station || next.title }}</RouterLink>
      </nav>
    </article>
    <h1 v-else class="not-found">未找到这篇实践记录</h1>
    <RouterLink to="/practice" class="back-link bottom-link">返回完整实践路线</RouterLink>
  </div>
</template>

<style scoped>
.practice-detail { max-width: 820px; margin: auto; padding-block: 2.5rem; }
.back-link { display: inline-flex; min-height: 44px; align-items: center; color: #873e30; font-size: .875rem; }
header { margin-top: 2.5rem; }
.detail-theme { color: #873e30; font-size: .875rem; letter-spacing: .15em; }
h1 { margin-top: 1rem; font-size: clamp(1.9rem, 4vw, 3rem); font-weight: 600; line-height: 1.5; }
.detail-location { margin-top: 1rem; color: #75685e; line-height: 1.8; }
.detail-lead { margin-block: 2rem; padding-left: 1.3rem; border-left: 2px solid #873e30; font-size: 1.15rem; line-height: 2; color: #645347; }
.detail-prose { max-width: 700px; margin: 2.5rem auto; }
.detail-prose p { margin-top: 1.4rem; font-size: 1.1rem; line-height: 2.2; }
.detail-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
.detail-gallery > :only-child { grid-column: 1 / -1; }
.detail-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
.detail-actions a { padding: .8rem 1rem; border: 1px solid #873e3060; color: #873e30; }
.adjacent-stops { display: flex; justify-content: space-between; gap: 1.5rem; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #493a2c35; }
.adjacent-stops a { max-width: 48%; line-height: 1.8; }
.adjacent-stops span { display: block; font-size: .875rem; color: #75685e; margin-bottom: .4rem; }
.next-stop { margin-left: auto; text-align: right; }
.bottom-link { margin-top: 2rem; text-decoration: underline; text-underline-offset: 5px; }
a:hover { color: #a5503f; }
a:focus-visible { outline: 2px solid #873e30; outline-offset: 4px; }
.not-found { margin-block: 3rem; }
@media (max-width: 640px) { .detail-gallery { grid-template-columns: 1fr; } header { margin-top: 1.5rem; } .detail-prose p { font-size: 1rem; } }
</style>
