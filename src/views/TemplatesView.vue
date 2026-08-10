<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTemplateStore } from '@/stores/templates'
import { SCENARIO_METADATA, RELATIONSHIP_LABELS } from '@/utils/constants'
import { templateData } from '@/utils/templateData'
import TemplateCard from '@/components/template/TemplateCard.vue'
import type { Scenario, Relationship } from '@/types/letter'

const store = useTemplateStore()

onMounted(() => {
  store.setTemplates(templateData)
})

const scenarioOptions = computed(() => [
  { value: 'all' as const, label: '全部场景' },
  ...Array.from(
    new Map(templateData.map((t) => [t.scenario, SCENARIO_METADATA[t.scenario]])).entries()
  ).map(([scenario, info]) => ({
    value: scenario,
    label: `${info?.icon || ''} ${info?.label || scenario}`,
  })),
])

const relationshipOptions = computed(() => [
  { value: 'all' as const, label: '全部关系' },
  ...Array.from(new Set(templateData.map((t) => t.relationship))).map((rel) => ({
    value: rel,
    label: RELATIONSHIP_LABELS[rel] || rel,
  })),
])
</script>

<template>
  <div class="max-w-5xl mx-auto py-8">
    <h1 class="text-2xl md:text-3xl font-serif font-bold text-ink text-center mb-2">
      📜 侨批范文库
    </h1>
    <p class="text-center text-ink/50 font-serif mb-8">
      浏览经典侨批模板，找到适合你的场景，以此为基础生成专属家书
    </p>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <!-- Scenario filter -->
      <div class="flex-1 space-y-2">
        <label class="text-xs text-ink/50 font-serif">按场景筛选</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in scenarioOptions"
            :key="opt.value"
            @click="store.setCategory(opt.value)"
            class="px-3 py-1.5 rounded-full text-xs font-serif transition-colors"
            :class="store.activeCategory === opt.value
              ? 'bg-red-seal text-white'
              : 'bg-ink/5 text-ink/70 hover:bg-ink/10'"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Relationship filter -->
      <div class="md:w-48 space-y-2">
        <label class="text-xs text-ink/50 font-serif">按关系筛选</label>
        <select
          :value="store.activeRelationship"
          @change="store.setRelationship(($event.target as HTMLSelectElement).value as Relationship | 'all')"
          class="w-full px-3 py-2 rounded-lg border border-ink/20 bg-white/80 font-serif text-sm text-ink focus:outline-none focus:border-red-seal/50"
        >
          <option
            v-for="opt in relationshipOptions"
            :key="opt.value"
            :value="opt.value"
          >{{ opt.label }}</option>
        </select>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-8">
      <input
        v-model="store.searchQuery"
        type="text"
        placeholder="搜索模板..."
        class="w-full max-w-md px-4 py-2.5 rounded-lg border border-ink/20 bg-white/80 font-serif text-ink placeholder:text-ink/30 focus:outline-none focus:border-red-seal/50"
      />
    </div>

    <!-- Template Grid -->
    <div
      v-if="store.filteredTemplates.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <TemplateCard
        v-for="tmpl in store.filteredTemplates"
        :key="tmpl.id"
        :template="tmpl"
      />
    </div>

    <!-- Empty -->
    <div v-else class="text-center py-20">
      <div class="text-4xl mb-4">📭</div>
      <p class="text-ink/50 font-serif">没有找到匹配的模板</p>
      <button class="btn-secondary mt-4" @click="store.setCategory('all'); store.setRelationship('all'); store.searchQuery = ''">
        清除筛选
      </button>
    </div>
  </div>
</template>
