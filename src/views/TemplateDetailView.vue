<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTemplateStore } from '@/stores/templates'
import { SCENARIO_METADATA, RELATIONSHIP_LABELS } from '@/utils/constants'
import { onMounted } from 'vue'
import { templateData } from '@/utils/templateData'

const route = useRoute()
const router = useRouter()
const store = useTemplateStore()

onMounted(() => {
  store.setTemplates(templateData)
})

const template = computed(() => {
  const id = route.params.id as string
  return store.getTemplateById(id)
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <!-- Not Found -->
    <div v-if="!template" class="text-center py-20">
      <div class="text-4xl mb-4">📭</div>
      <p class="text-ink/50 font-serif">未找到该模板</p>
      <router-link to="/templates" class="btn-secondary mt-4 inline-block">返回范文库</router-link>
    </div>

    <!-- Template Detail -->
    <template v-else>
      <div class="mb-6">
        <router-link to="/templates" class="text-sm text-ink/50 font-serif hover:text-red-seal transition-colors">
          ← 返回范文库
        </router-link>
      </div>

      <div class="vintage-paper rounded-xl p-6 md:p-10 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <span class="text-3xl mr-3">{{ SCENARIO_METADATA[template.scenario]?.icon || '✉️' }}</span>
            <h1 class="text-2xl font-serif font-bold text-ink inline">{{ template.title }}</h1>
          </div>
          <span class="text-sm text-ink/40 font-serif">{{ RELATIONSHIP_LABELS[template.relationship] }}</span>
        </div>

        <p class="text-ink/60 font-serif mb-6">{{ template.description }}</p>

        <!-- Example letter -->
        <div class="border-t border-ink/10 pt-6">
          <h3 class="text-sm text-ink/50 font-serif mb-3">范文示例</h3>
          <div class="vintage-text text-lg whitespace-pre-line leading-loose">
            {{ template.example }}
          </div>
        </div>
      </div>

      <!-- Structure breakdown -->
      <div class="vintage-paper rounded-xl p-6 md:p-8 mb-6">
        <h3 class="text-lg font-serif font-semibold text-ink mb-4">📋 书信结构解析</h3>
        <div class="space-y-3">
          <div
            v-for="(section, idx) in template.structure"
            :key="idx"
            class="flex items-start gap-3 p-3 rounded-lg"
            :class="section.isVariable ? 'bg-amber-50/50' : 'bg-green-50/30'"
          >
            <span class="text-xs px-2 py-0.5 rounded-full font-serif shrink-0 mt-0.5"
              :class="section.isVariable ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'"
            >
              {{ section.isVariable ? '可修改' : '固定格式' }}
            </span>
            <div>
              <p class="font-serif text-ink font-semibold text-sm">{{ section.label }}</p>
              <p class="text-xs text-ink/50 font-serif mt-0.5">"{{ section.example.slice(0, 80) }}{{ section.example.length > 80 ? '...' : '' }}"</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <router-link
          :to="`/write?template=${template.id}`"
          class="btn-primary no-underline inline-block text-lg px-10"
        >
          🖋️ 以此模板为基础写信
        </router-link>
      </div>
    </template>
  </div>
</template>
