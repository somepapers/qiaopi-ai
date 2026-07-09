import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LetterTemplate, Scenario, Relationship } from '@/types/letter'

export const useTemplateStore = defineStore('templates', () => {
  const templates = ref<LetterTemplate[]>([])
  const activeCategory = ref<Scenario | 'all'>('all')
  const activeRelationship = ref<Relationship | 'all'>('all')
  const searchQuery = ref('')

  const categories = computed(() => {
    const cats = new Map<string, number>()
    templates.value.forEach((t) => {
      cats.set(t.scenario, (cats.get(t.scenario) || 0) + 1)
    })
    return Array.from(cats.entries()).map(([scenario, count]) => ({
      scenario: scenario as Scenario,
      count,
    }))
  })

  const filteredTemplates = computed(() => {
    let result = templates.value

    if (activeCategory.value !== 'all') {
      result = result.filter((t) => t.scenario === activeCategory.value)
    }

    if (activeRelationship.value !== 'all') {
      result = result.filter((t) => t.relationship === activeRelationship.value)
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.includes(q) ||
          t.description.includes(q) ||
          t.tags.some((tag) => tag.includes(q)) ||
          t.example.includes(q)
      )
    }

    return result
  })

  const featuredTemplates = computed(() =>
    templates.value.filter((t) => t.isFeatured)
  )

  function setTemplates(list: LetterTemplate[]) {
    templates.value = list
  }

  function setCategory(cat: Scenario | 'all') {
    activeCategory.value = cat
  }

  function setRelationship(rel: Relationship | 'all') {
    activeRelationship.value = rel
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function getTemplateById(id: string): LetterTemplate | undefined {
    return templates.value.find((t) => t.id === id)
  }

  return {
    templates,
    activeCategory,
    activeRelationship,
    searchQuery,
    categories,
    filteredTemplates,
    featuredTemplates,
    setTemplates,
    setCategory,
    setRelationship,
    setSearchQuery,
    getTemplateById,
  }
})
