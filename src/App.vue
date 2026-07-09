<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-[#faf6f0] flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <footer class="text-center py-6 text-ink/40 text-sm font-serif">
      <p>侨批AI代书人 · 传承百年侨批  AI续写家书</p>
      <p class="mt-1">侨批档案 · 联合国教科文组织世界记忆遗产</p>
    </footer>
  </div>
</template>
