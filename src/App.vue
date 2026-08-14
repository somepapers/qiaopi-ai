<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import { recordVisit } from '@/composables/useVisitCount'

// 进入网站：使用次数 +1（App 每次页面加载只挂载一次，路由跳转不重复计数）
onMounted(() => {
  recordVisit()
})
</script>

<template>
  <div class="min-h-screen bg-[#faf6f0] flex flex-col">
    <AppHeader />
    <main class="flex-1 px-4 sm:px-6 lg:px-8">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <footer class="text-center py-6 px-4 sm:px-6 lg:px-8 text-ink/40 text-sm font-serif">
      <p>侨批AI代书人 · 传承百年侨批  AI续写家书</p>
      <p class="mt-1">侨批档案 · 联合国教科文组织世界记忆遗产</p>
    </footer>
  </div>
</template>
