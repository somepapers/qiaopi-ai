<script setup lang="ts">
import { publishedRecords } from '@/utils/practice'
</script>

<template>
  <section class="mx-auto max-w-3xl py-10 md:py-16">
    <h1 class="border-b border-red-seal/40 pb-5 text-4xl font-bold">实践足迹</h1>
    <p v-if="!publishedRecords.length" class="py-10 text-ink-light">实践记录整理中</p>
    <ul v-else>
      <li v-for="record in publishedRecords" :key="record.slug" class="border-b border-ink/15">
        <RouterLink :to="{ name: 'practice-detail', params: { slug: record.slug } }" class="group block py-6">
          <p class="text-sm text-ink-light"><time :datetime="record.date">{{ record.date }}</time> · {{ record.location }}</p>
          <h2 class="my-2 text-2xl font-semibold group-hover:text-red-seal">{{ record.title }}</h2>
          <p class="leading-loose">{{ record.summary }}</p>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
