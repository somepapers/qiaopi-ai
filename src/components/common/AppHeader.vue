<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navItems = [
  { path: '/', label: '首页' },
  { path: '/write', label: '写侨批' },
  { path: '/templates', label: '范文库' },
  { path: '/culture', label: '侨批文化' },
  { path: '/about', label: '关于' },
]
</script>

<template>
  <header class="sticky top-0 z-50 bg-[#faf6f0]/95 backdrop-blur-sm border-b border-ink/10">
    <nav class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-2 no-underline">
        <span class="text-2xl">📮</span>
        <span class="text-xl font-serif font-semibold text-ink hidden sm:inline">侨批AI代书人</span>
      </router-link>

      <div class="flex items-center gap-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="px-3 py-2 rounded-md text-sm font-serif text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors"
          active-class="!text-red-seal !bg-red-seal/5"
        >
          {{ item.label }}
        </router-link>
      </div>
    </nav>
  </header>
</template>
