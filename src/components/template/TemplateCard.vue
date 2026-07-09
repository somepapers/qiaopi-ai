<script setup lang="ts">
import type { LetterTemplate } from '@/types/letter'
import { SCENARIO_METADATA, RELATIONSHIP_LABELS } from '@/utils/constants'

defineProps<{ template: LetterTemplate }>()
</script>

<template>
  <router-link
    :to="`/templates/${template.id}`"
    class="vintage-paper rounded-xl p-5 block no-underline hover:shadow-md transition-shadow group"
  >
    <div class="flex items-start justify-between mb-2">
      <span class="text-2xl">{{ SCENARIO_METADATA[template.scenario]?.icon || '✉️' }}</span>
      <span class="text-xs text-ink/30 font-serif">{{ RELATIONSHIP_LABELS[template.relationship] }}</span>
    </div>
    <h3 class="text-base font-serif font-semibold text-ink mb-1 group-hover:text-red-seal transition-colors">
      {{ template.title }}
    </h3>
    <p class="text-sm text-ink/50 font-serif line-clamp-2 mb-3">{{ template.description }}</p>
    <div class="flex flex-wrap gap-1">
      <span
        v-for="tag in template.tags.slice(0, 3)"
        :key="tag"
        class="px-2 py-0.5 rounded-full text-xs bg-ink/5 text-ink/50 font-serif"
      >{{ tag }}</span>
    </div>
    <p class="mt-3 text-xs text-ink/30 font-serif line-clamp-2 leading-relaxed italic">
      "{{ template.example.slice(0, 60) }}..."
    </p>
  </router-link>
</template>
