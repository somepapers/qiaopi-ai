<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const primary = [
  { path: '/practice', label: '实践足迹' },
  { path: '/exhibition', label: '展览馆' },
  { path: '/write', label: '写侨批' },
]
const secondary = [
  { path: '/templates', label: '范文库' },
  { path: '/culture', label: '侨批文化' },
  { path: '/media', label: '媒体报道' },
  { path: '/about', label: '关于' },
]
const route = useRoute()
const open = ref(false)
const more = ref<HTMLElement>()
const toggle = ref<HTMLButtonElement>()

function closeOnOutside(event: Event) {
  if (!more.value?.contains(event.target as Node)) open.value = false
}
function escape(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    open.value = false
    toggle.value?.focus()
  }
}
watch(() => route.fullPath, () => { open.value = false })
onMounted(() => {
  document.addEventListener('pointerdown', closeOnOutside)
  document.addEventListener('focusin', closeOnOutside)
  document.addEventListener('keydown', escape)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOnOutside)
  document.removeEventListener('focusin', closeOnOutside)
  document.removeEventListener('keydown', escape)
})
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-ink/15 bg-[#faf6f0]/95 backdrop-blur-sm">
    <nav aria-label="主导航" class="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-1 px-3 lg:min-h-16 lg:px-8">
      <RouterLink to="/" aria-label="首页 · 寻侨迹，传侨魂" class="brand">
        <span aria-hidden="true" class="seal">侨</span>
        <span class="lg:hidden">首页</span><span class="hidden text-xl font-bold lg:inline">寻侨迹，传侨魂</span>
      </RouterLink>
      <div class="flex items-center sm:gap-2">
        <RouterLink v-for="item in primary" :key="item.path" :to="item.path" class="nav-link">{{ item.label }}</RouterLink>
        <div class="hidden items-center gap-2 lg:flex">
          <RouterLink v-for="item in secondary" :key="item.path" :to="item.path" class="nav-link">{{ item.label }}</RouterLink>
        </div>
        <div ref="more" class="relative lg:hidden">
          <button ref="toggle" type="button" class="nav-link" :aria-expanded="open" aria-controls="more-links" @click="open = !open">
            更多 <span aria-hidden="true">{{ open ? '▴' : '▾' }}</span>
          </button>
          <div id="more-links" v-show="open" class="absolute right-0 top-full grid min-w-32 border border-ink/20 bg-[#fffaf1] p-1 shadow-lg">
            <RouterLink v-for="item in secondary" :key="item.path" :to="item.path" class="nav-link" @click="open = false">{{ item.label }}</RouterLink>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.brand,.nav-link {
  display: inline-flex;
  align-items: center;
  gap: .25rem;
  min-height: 44px;
  white-space: nowrap;
  font-size: .9rem;
}
.nav-link { justify-content: center; padding-inline: clamp(.36rem, 1.2vw, .75rem); }
.seal { background: #933f30; color: #fff4dc; border: 3px double #fff4dc; padding: 0 .2em; font-size: 1.2rem; }
.nav-link:hover,.nav-link.router-link-active,.nav-link[aria-expanded=true] { color: #873429; background: #923f300d; }
.brand:focus-visible,.nav-link:focus-visible { outline: 2px solid #873429; outline-offset: 1px; }
</style>
