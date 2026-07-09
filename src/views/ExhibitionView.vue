<script setup lang="ts">
const photos = [
  { src: '/exhibition/侨批1.jpg', title: '侨批原件展示（一）' },
  { src: '/exhibition/侨批2.jpg', title: '侨批原件展示（二）' },
]
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-2xl md:text-3xl font-serif font-bold text-ink text-center mb-2">
      🏛️ 侨批展览馆
    </h1>
    <p class="text-center text-ink/50 font-serif mb-8">
      一纸侨批，百年乡愁。以下为珍贵的侨批历史原件影像。
    </p>

    <!-- Photo Grid: 2 per row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="vintage-paper rounded-xl overflow-hidden"
      >
        <div class="p-2 md:p-3">
          <img
            :src="photo.src"
            :alt="photo.title"
            loading="lazy"
            class="w-full rounded-lg"
          />
        </div>
      </div>
    </div>

    <!-- Credit -->
    <div class="mt-10 text-center">
      <div class="w-16 h-px bg-red-seal/20 mx-auto mb-4"></div>
      <p class="text-sm text-ink/50 font-serif">
        照片来源：福建省档案馆
      </p>
    </div>
  </div>
</template>
