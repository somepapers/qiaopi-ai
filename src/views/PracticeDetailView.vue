<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { publishedRecords } from '@/utils/practice'

const route = useRoute()
const record = computed(() => publishedRecords.find(item => item.slug === route.params.slug))
</script>

<template>
  <div class="mx-auto max-w-2xl py-10 md:py-16">
    <article v-if="record">
      <h1 class="text-3xl font-bold leading-snug md:text-4xl">{{ record.title }}</h1>
      <p class="mt-4 text-sm text-ink-light"><time :datetime="record.date">{{ record.date }}</time> · {{ record.location }}</p>
      <p class="my-8 border-l-2 border-red-seal pl-4 text-lg leading-loose">{{ record.lead }}</p>
      <p v-for="(paragraph, index) in record.paragraphs" :key="index" class="mt-4 leading-loose">{{ paragraph }}</p>
      <figure v-for="photo in record.photos" :key="photo.src" class="mt-8">
        <img :src="photo.src" :alt="photo.alt" class="h-auto w-full" />
        <figcaption class="mt-2 text-sm leading-relaxed text-ink-light">{{ photo.caption }}</figcaption>
      </figure>
    </article>
    <h1 v-else class="text-2xl font-semibold">未找到这篇实践记录</h1>
    <RouterLink to="/practice" class="mt-10 inline-block text-red-seal underline underline-offset-4">返回实践足迹</RouterLink>
  </div>
</template>
