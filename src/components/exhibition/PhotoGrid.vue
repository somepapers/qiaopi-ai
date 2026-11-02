<script setup lang="ts">
import { ref } from 'vue'
import type { ExhibitionImage } from '@/types/exhibition'

defineProps<{ images: ExhibitionImage[] }>()
const emit = defineEmits<{ open: [index: number] }>()

/** 已加载完成的图片 URL 集合：加载前显示骨架微光，加载后淡入 */
const loadedImages = ref(new Set<string>())
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    <button
      v-for="(image, index) in images"
      :key="image.fileName"
      type="button"
      class="vintage-paper rounded-xl overflow-hidden text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-seal/50 cursor-zoom-in"
      @click="emit('open', index)"
    >
      <div class="p-2 md:p-3">
        <!-- 固定比例盒：从源头消除加载中/加载后的布局跳动（CLS） -->
        <div class="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper-aged/30">
          <div v-if="!loadedImages.has(image.src)" class="absolute inset-0 skeleton-shimmer"></div>
          <img
            :src="image.src"
            :alt="image.title"
            loading="lazy"
            decoding="async"
            class="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
            :class="loadedImages.has(image.src) ? 'opacity-100' : 'opacity-0'"
            @load="loadedImages.add(image.src)"
          />
        </div>
        <div class="px-1.5 pt-2.5 pb-1">
          <h3 class="text-sm md:text-base font-serif font-semibold text-ink group-hover:text-red-seal transition-colors">
            {{ image.title }}
          </h3>
          <p v-if="image.desc" class="text-xs md:text-sm text-ink/60 font-serif mt-1">{{ image.desc }}</p>
        </div>
      </div>
    </button>
  </div>
</template>
