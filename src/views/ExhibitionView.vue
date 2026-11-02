<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ipImages, qiaopiImages } from '@/assets/exhibition'
import type { ExhibitionImage } from '@/types/exhibition'
import PhotoGrid from '@/components/exhibition/PhotoGrid.vue'
import Lightbox from '@/components/exhibition/Lightbox.vue'

const route = useRoute()
const router = useRouter()

type TabKey = 'qiaopi' | 'ip'

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'qiaopi', label: '侨批文化展示', icon: '📜' },
  { key: 'ip', label: '团队IP设计', icon: '🎨' },
]

// URL 查询参数为唯一事实源：可分享直达（?tab=ip）、刷新保持、前进后退正常
const activeTab = computed<TabKey>(() => (route.query.tab === 'ip' ? 'ip' : 'qiaopi'))

function switchTab(key: TabKey) {
  if (key === activeTab.value) return
  // 用 replace 而非 push：浏览器后退直接离开页面，而不是逐级回退 Tab 历史
  router.replace({ query: { ...route.query, tab: key } })
}

// 灯箱状态（打开时全屏遮罩盖住 Tab，切换期间 activeImages 不会变化）
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const activeImages = computed<ExhibitionImage[]>(() =>
  activeTab.value === 'qiaopi' ? qiaopiImages : ipImages,
)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
</script>

<template>
  <div class="max-w-5xl mx-auto py-8 px-4">
    <h1 class="text-2xl md:text-3xl font-serif font-bold text-ink text-center mb-2">
      🏛️ 侨批展览馆
    </h1>
    <p class="text-center text-ink/50 font-serif mb-8">
      一纸侨批，百年乡愁。走进展览馆，领略侨批文化的厚重与新生。
    </p>

    <!-- Tab 栏 -->
    <div class="flex justify-center gap-2 mb-8">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :aria-pressed="activeTab === tab.key"
        class="px-5 py-2.5 font-serif tracking-widest text-sm md:text-base border rounded-sm transition-all duration-200"
        :class="activeTab === tab.key
          ? 'bg-red-seal text-paper-light border-red-seal shadow-md shadow-red-seal/20'
          : 'text-ink/60 border-ink/15 hover:bg-ink/5 hover:text-ink'"
        @click="switchTab(tab.key)"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- ===== 侨批文化展示区 ===== -->
    <section v-if="activeTab === 'qiaopi'">
      <div class="vintage-paper rounded-xl p-5 md:p-8 mb-8">
        <p class="text-sm md:text-base text-ink/80 font-serif leading-loose">
          侨批，是海外华侨通过民间渠道寄回故乡的家书与汇款凭证的合称，承载着游子对故土的思念与家国的担当。以下原件影像来自福建省档案馆，一纸一墨，皆是历史的回响。点击图片可放大端详。
        </p>
      </div>

      <PhotoGrid v-if="qiaopiImages.length" :images="qiaopiImages" @open="openLightbox" />

      <!-- Credit -->
      <div class="mt-10 text-center">
        <div class="w-16 h-px bg-red-seal/20 mx-auto mb-4"></div>
        <p class="text-sm text-ink/50 font-serif">照片来源：福建省档案馆</p>
      </div>
    </section>

    <!-- ===== 团队IP设计区 ===== -->
    <section v-else>
      <div class="vintage-paper rounded-xl p-5 md:p-8 mb-8">
        <p class="text-sm md:text-base text-ink/80 font-serif leading-loose">
          以侨批文化为灵感，团队创作了一系列 IP 形象设计作品，让百年家书在当代语境中焕发新的生命力。点击作品可放大欣赏细节。
        </p>
      </div>

      <PhotoGrid v-if="ipImages.length" :images="ipImages" @open="openLightbox" />

      <!-- 空状态：IP 素材就绪前优雅占位（放图进素材库并压缩后自动出现） -->
      <div v-else class="flex justify-center py-10">
        <div class="vintage-paper rounded-xl px-8 py-10 text-center -rotate-3">
          <div class="inline-block border-2 border-red-seal rounded-sm px-6 py-3 mb-4">
            <p class="font-calligraphy text-2xl md:text-3xl text-red-seal tracking-widest">
              作品整理中
            </p>
          </div>
          <p class="text-sm text-ink/50 font-serif">团队 IP 形象成果将于近期展出，敬请期待。</p>
        </div>
      </div>
    </section>

    <!-- 灯箱 -->
    <Lightbox
      v-if="lightboxOpen && activeImages.length"
      v-model:index="lightboxIndex"
      :images="activeImages"
      @close="lightboxOpen = false"
    />
  </div>
</template>
