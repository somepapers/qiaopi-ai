<script setup lang="ts">
import { mediaItems } from '@/data/media'

const sections = [
  { kind: 'article', label: '图文报道' },
  { kind: 'video', label: '团队影像' },
].map(section => ({
  ...section,
  items: mediaItems
    .filter(item => item.kind === section.kind)
    .sort((a, b) => b.date.localeCompare(a.date)),
}))

const dateFormat = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
})
</script>

<template>
  <div class="mx-auto max-w-4xl py-10 md:py-16">
    <h1 class="border-b border-red-seal/40 pb-5 text-4xl font-bold">媒体报道</h1>
    <section v-for="section in sections" :key="section.kind" :aria-labelledby="section.kind" class="mt-9">
      <h2 :id="section.kind" class="mb-1 border-l-2 border-red-seal pl-3 text-xl font-semibold">{{ section.label }}</h2>
      <article v-for="item in section.items" :key="item.title"
        class="grid gap-2 border-b border-ink/15 py-6 md:grid-cols-[9rem_1fr] md:gap-6">
        <time :datetime="item.date" class="pt-1 text-sm text-ink-light">
          {{ dateFormat.format(new Date(item.date)) }}
        </time>
        <div class="min-w-0">
          <h3 class="text-xl font-semibold leading-relaxed md:text-2xl">{{ item.title }}</h3>
          <p class="mt-2 leading-loose text-ink-light">{{ item.summary }}</p>
          <ul class="mt-3 flex flex-wrap items-start gap-x-6 gap-y-2">
            <li v-for="source in item.sources" :key="source.url">
              <a :href="source.url" class="inline-block py-1 text-red-seal underline underline-offset-4 focus-visible:outline-2">
                {{ source.label }} <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </div>
      </article>
    </section>
  </div>
</template>
