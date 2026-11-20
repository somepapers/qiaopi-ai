<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { publishedRecords } from '@/utils/practice'
import PracticePhoto from '@/components/practice/PracticePhoto.vue'
import writerImage from '@/assets/practice/ai-writer.webp'
import filmImage from '@/assets/practice/film.webp'
import qiaoyanImage from '@/assets/practice/qiaoyan.webp'

const openingPhoto = publishedRecords[0]?.photos[0]
const route = useRoute()
onMounted(() => {
  const target = route.hash ? document.getElementById(route.hash.slice(1)) : null
  if (target) target.scrollIntoView()
  else window.scrollTo({ top: 0 })
})
const stops = ['首站', '第二站', '第三站', '第四站', '第五站', '归程']
const creations = [
  { title: '把牵挂写成一封家书', label: 'AI 代书', image: writerImage, alt: '侨批代书程序的手机端界面', description: '从口述心意到数字侨批，在书写中体会纸短情长。', to: '/write', action: '体验 AI 代书', contain: true },
  { title: '让沿途的故事被看见', label: '实践影像', image: filmImage, alt: '实践宣传视频主题画面', description: '用镜头记录寻访，以青年视角讲述侨乡的故事。', to: '/media', action: '查看视频与报道', contain: false },
  { title: '让侨燕飞进日常生活', label: 'IP 与文创', image: qiaoyanImage, alt: '侨燕 IP 帆布袋文创设计', description: '燕子衔笺、归巢传信，让侨乡记忆有了新的模样。', to: '/exhibition?tab=ip', action: '走进文创展览', contain: true },
]
</script>

<template>
  <div class="journey-page">
    <header class="journey-heading">
      <p class="eyebrow">寻侨迹，传侨魂 <span>社会实践纪行</span></p>
      <div class="heading-line"><h1>实践足迹</h1><p>循着一纸侨批<br />走进百年侨乡</p></div>
    </header>
    <template v-if="publishedRecords.length">
      <section class="journey-intro" aria-labelledby="journey-intro-title">
        <div class="intro-copy">
          <p class="section-label">从福州出发，再带着故事归来</p>
          <h2 id="journey-intro-title">一程山海，<br />一纸情长。</h2>
          <p class="intro-text">在档案中追溯历史，在侨乡里寻找记忆，在访谈中聆听人生。我们循着侨批的线索走过福建，再把一路所见所闻，写进属于青年的数字作品。</p>
          <a href="#journey-route" class="journey-button">展开我们的旅程</a>
          <p class="intro-note">闽江大学“寻侨迹，传侨魂”社会实践队</p>
        </div>
        <PracticePhoto v-if="openingPhoto" :photo="openingPhoto" priority />
      </section>
      <nav id="journey-route" class="route-strip" aria-label="实践行程导航">
        <div class="route-title"><span>寻访路线</span><small>沿着足迹，读懂侨批</small></div>
        <ol>
          <li v-for="(record, index) in publishedRecords" :key="record.slug">
            <a :href="`#${record.slug}`"><span class="route-city"><span>{{ record.city || record.location }}</span><small>{{ stops[index] || '寻访' }}</small></span><span class="route-place">{{ record.station || record.title }}</span></a>
          </li>
        </ol>
      </nav>
      <section class="field-notes" aria-labelledby="field-notes-title">
        <div class="section-heading"><div><p class="section-label">在行走中认识历史</p><h2 id="field-notes-title">我们的寻侨手记</h2></div><span>从档案原件，到指尖传承</span></div>
        <ol class="timeline">
          <li v-for="(record, index) in publishedRecords" :id="record.slug" :key="record.slug" class="journey-stop">
            <div class="stop-marker"><span>{{ stops[index] || '寻访' }}</span></div>
            <div class="stop-body">
              <div class="stop-copy">
                <p class="stop-location">{{ record.city }}<span aria-hidden="true"> / </span>{{ record.theme }}</p>
                <p class="stop-station">{{ record.station || record.location }}</p>
                <h3>{{ record.title }}</h3>
                <p class="stop-summary">{{ record.summary }}</p>
                <ul v-if="record.tags?.length" class="tags" aria-label="本站关键词"><li v-for="tag in record.tags" :key="tag">{{ tag }}</li></ul>
                <RouterLink :to="{ name: 'practice-detail', params: { slug: record.slug } }" class="story-link">阅读本站手记</RouterLink>
              </div>
              <PracticePhoto v-if="record.photos[0]" :photo="record.photos[0]" :contain="record.slug === 'fuzhou-digital-creation'" />
              <aside v-else class="reflection" aria-label="这一站的思考">
                <span class="reflection-label">古城里的思考</span>
                <p>如何让年轻人<br />停下来，<br /><em>读一封侨批？</em></p>
                <span class="reflection-note">从静态展陈，走向可以参与的文化体验。</span>
              </aside>
            </div>
          </li>
        </ol>
      </section>
      <section class="creations" aria-labelledby="creations-title">
        <div class="section-heading"><div><p class="section-label">旅程之后，故事继续</p><h2 id="creations-title">把调研带回，把侨情传开</h2></div></div>
        <div class="creation-grid">
          <article v-for="item in creations" :key="item.to">
            <RouterLink :to="item.to" :aria-label="item.action" class="creation-image"><img :src="item.image" :alt="item.alt" :class="{ contain: item.contain }" loading="lazy" decoding="async" /></RouterLink>
            <p class="creation-label">{{ item.label }}</p><h3>{{ item.title }}</h3><p class="creation-description">{{ item.description }}</p>
            <RouterLink :to="item.to" class="story-link">{{ item.action }}</RouterLink>
          </article>
        </div>
      </section>
      <div class="journey-ending"><span class="ending-seal" aria-hidden="true">侨</span><p>让实践留下足迹，让侨批继续传情。</p><a href="#journey-route">重温寻访路线</a></div>
    </template>
    <p v-else class="empty-state">实践记录整理中</p>
  </div>
</template>

<style scoped>
.journey-page { --accent: #873e30; --muted: #76665a; max-width: 1120px; margin: auto; padding-top: 2.5rem; }
.journey-heading { border-bottom: 1px solid #493a2c35; padding-bottom: 1.5rem; }
.eyebrow { display: flex; justify-content: space-between; gap: 1rem; font-size: .875rem; letter-spacing: .15em; color: var(--accent); }
.eyebrow span { color: var(--muted); }
.heading-line { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-top: 1.4rem; }
.heading-line h1 { font-size: clamp(2.6rem, 6vw, 4.8rem); font-weight: 700; letter-spacing: .12em; line-height: 1.15; }
.heading-line p { color: var(--muted); font-size: 1rem; line-height: 1.9; text-align: right; }
.journey-intro { display: grid; grid-template-columns: .85fr 1.15fr; align-items: center; gap: 3rem; padding: 3.5rem 0; }
.section-label { font-size: .875rem; letter-spacing: .1em; color: var(--accent); }
.intro-copy h2 { font-size: clamp(2rem, 3.8vw, 3.15rem); font-weight: 600; line-height: 1.5; margin: 1rem 0; letter-spacing: .04em; }
.intro-text { line-height: 2; color: #645347; font-size: 1rem; }
.journey-button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; margin-top: 1.6rem; padding: .7rem 1.5rem; background: var(--accent); color: #fffaf1; font-size: 1rem; transition: background .2s; }
.journey-button:hover { background: #613024; }
.intro-note { margin-top: 1.3rem; font-size: .875rem; line-height: 1.7; color: var(--muted); }
.route-strip { scroll-margin-top: 88px; border-block: 1px solid #493a2c35; padding: 1.5rem 0; }
.route-title { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; font-size: 1rem; color: var(--accent); }
.route-title small { color: var(--muted); font-size: .875rem; }
.route-strip ol { display: grid; grid-template-columns: repeat(6, 1fr); gap: .7rem; }
.route-strip li { border-left: 2px solid #873e3030; }
.route-strip a { display: block; min-height: 90px; padding: .5rem .65rem; transition: background .2s; }
.route-strip a:hover { background: #873e300a; }
.route-city { display: flex; flex-wrap: wrap; align-items: center; gap: .3rem .6rem; font-size: 1.25rem; font-weight: 600; }
.route-city > span { white-space: nowrap; }
.route-city small { font-size: .875rem; font-weight: 400; color: var(--accent); white-space: nowrap; }
.route-place { display: block; font-size: .875rem; color: var(--muted); margin-top: .5rem; line-height: 1.6; }
.field-notes { padding-top: 4.5rem; }
.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 2rem; }
.section-heading h2 { margin-top: .65rem; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 600; line-height: 1.5; }
.section-heading > span { font-size: .875rem; color: var(--muted); }
.journey-stop { position: relative; padding-left: 5.2rem; scroll-margin-top: 90px; }
.journey-stop::before { content: ''; position: absolute; left: 1.4rem; top: 0; bottom: 0; width: 1px; background: #873e3038; }
.journey-stop:last-child::before { bottom: 2.8rem; }
.stop-marker { position: absolute; left: 0; top: 0; padding: .5rem 0; background: #faf6f0; color: var(--accent); font-size: .875rem; }
.stop-marker span { display: inline-block; width: 2.9rem; padding: .55rem .2rem; text-align: center; border: 1px solid #873e3060; }
.stop-body { display: grid; grid-template-columns: 1fr 1.08fr; gap: 2.5rem; align-items: center; padding: .5rem 0 2.8rem; margin-bottom: 2.8rem; border-bottom: 1px solid #493a2c25; }
.stop-location { color: var(--accent); font-size: .875rem; letter-spacing: .08em; }
.stop-location span { padding-inline: .6rem; opacity: .5; }
.stop-station { margin-top: .75rem; font-size: 1rem; color: var(--muted); }
.stop-copy h3 { margin: .75rem 0 1rem; font-size: clamp(1.45rem, 2.2vw, 1.8rem); font-weight: 600; line-height: 1.6; text-wrap: pretty; }
.stop-summary { font-size: 1rem; line-height: 2; color: #645347; }
.tags { display: flex; flex-wrap: wrap; gap: .4rem .8rem; margin-top: 1rem; color: #796252; font-size: .875rem; }
.tags li { border-bottom: 1px solid #79625235; padding-bottom: .15rem; }
.story-link { display: inline-flex; align-items: center; min-height: 44px; margin-top: .9rem; color: var(--accent); font-size: 1rem; text-decoration: underline; text-underline-offset: 6px; text-decoration-color: #873e3060; }
.story-link:hover { text-decoration-color: currentColor; }
.reflection { min-height: 300px; padding: 2rem 2.2rem; background: #ede5d8; border-right: 3px solid #873e3060; }
.reflection-label { font-size: .875rem; letter-spacing: .2em; color: var(--muted); }
.reflection p { margin: 1.2rem 0; font-size: clamp(1.5rem, 2.5vw, 2rem); line-height: 1.65; }
.reflection em { font-style: normal; color: var(--accent); }
.reflection-note { font-size: .875rem; color: var(--muted); line-height: 1.8; }
.creations { padding: 2.8rem; background: #eee7dc; }
.creation-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
.creation-image { display: block; overflow: hidden; background: #f7f3ed; }
.creation-image img { width: 100%; height: 190px; object-fit: cover; }
.creation-image img.contain { object-fit: contain; }
.creation-label { margin-top: 1.25rem; font-size: .875rem; color: var(--accent); }
.creation-grid h3 { margin-top: .6rem; font-size: 1.25rem; font-weight: 600; line-height: 1.6; }
.creation-description { margin-top: .75rem; line-height: 1.9; color: #645347; }
.journey-ending { padding: 4rem 0 2rem; text-align: center; }
.ending-seal { display: inline-flex; justify-content: center; align-items: center; width: 42px; height: 42px; border: 3px double #faf6f0; background: var(--accent); color: #faf6f0; font-size: 1.5rem; transform: rotate(-5deg); }
.journey-ending p { margin: 1.2rem 0 .5rem; font-size: clamp(1.1rem, 2.5vw, 1.5rem); line-height: 1.8; }
.journey-ending a { display: inline-flex; align-items: center; min-height: 44px; font-size: .875rem; color: var(--muted); text-decoration: underline; text-underline-offset: 5px; }
 a:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
.empty-state { padding-block: 4rem; }
@media (max-width: 900px) {
  .journey-intro { gap: 1.8rem; }
  .route-strip ol { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .stop-body { gap: 1.5rem; }
  .journey-stop { padding-left: 4rem; }
  .creations { padding: 2rem; }
  .creation-grid { gap: 1.3rem; }
}
@media (max-width: 640px) {
  .journey-page { padding-top: 1.5rem; }
  .eyebrow { font-size: .875rem; letter-spacing: .03em; }
  .heading-line { margin-top: 1.2rem; }
  .heading-line p { font-size: .875rem; }
  .journey-intro { grid-template-columns: 1fr; gap: 1.8rem; padding: 2rem 0; }
  .intro-copy h2 { font-size: 2.25rem; }
  .route-strip a { padding-left: .5rem; }
  .route-city { font-size: 1.1rem; gap: .4rem; }
  .route-title small { display: none; }
  .field-notes { padding-top: 3rem; }
  .section-heading > span { display: none; }
  .journey-stop { padding-left: 2.6rem; }
  .journey-stop::before { left: .8rem; }
  .stop-marker { top: .3rem; }
  .stop-marker span { width: 1.7rem; padding: .35rem .15rem; writing-mode: vertical-rl; letter-spacing: .2em; }
  .stop-body { grid-template-columns: 1fr; gap: 1.2rem; padding-bottom: 2rem; margin-bottom: 2rem; }
  .stop-copy h3 { font-size: 1.5rem; }
  .reflection { min-height: auto; padding: 1.5rem; }
  .reflection p { font-size: 1.6rem; }
  .creations { padding: 1.5rem; }
  .creation-grid { grid-template-columns: 1fr; gap: 2rem; }
  .creation-image img { height: 210px; }
  .journey-ending { padding-top: 3rem; }
}
@media (prefers-reduced-motion: reduce) { a { transition: none; } }
</style>
