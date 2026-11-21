<script setup lang="ts">
import { t } from '@/i18n'
import { ref } from 'vue'
import type { Photo } from '@/data/practice'
defineProps<{ photo: Photo; priority?: boolean; contain?: boolean }>()
const dialog = ref<HTMLDialogElement>()
const expanded = ref(false)
function showPhoto() {
  expanded.value = true
  dialog.value?.showModal()
}
</script>

<template>
  <figure class="practice-photo" :class="{ contain }">
    <button class="photo-trigger" type="button" :aria-label="t('放大照片：{title}', { title: t(photo.alt) })" @click="showPhoto">
      <img :src="photo.src" :alt="t(photo.alt)" :loading="priority ? 'eager' : 'lazy'" :fetchpriority="priority ? 'high' : 'auto'" decoding="async" />
      <span class="zoom-label" aria-hidden="true">{{ t('查看大图') }} <span>＋</span></span>
    </button>
    <figcaption>{{ t(photo.caption) }}</figcaption>
    <dialog ref="dialog" class="photo-dialog" :aria-label="t('实践照片大图')" @close="expanded = false" @click="($event.target === dialog) && dialog.close()">
      <div class="dialog-content">
        <button type="button" class="close-photo" autofocus @click="dialog?.close()">{{ t('关闭大图') }} <span aria-hidden="true">×</span></button>
        <img v-if="expanded" :src="photo.src" :alt="t(photo.alt)" />
        <p>{{ t(photo.caption) }}</p>
      </div>
    </dialog>
  </figure>
</template>

<style scoped>
.practice-photo { min-width: 0; }
.photo-trigger { position: relative; display: block; width: 100%; cursor: zoom-in; overflow: hidden; background: #eee8de; }
.photo-trigger img { display: block; width: 100%; aspect-ratio: 3 / 2; object-fit: cover; transition: transform .45s ease; }
.photo-trigger:hover img { transform: scale(1.025); }
.contain .photo-trigger img { object-fit: contain; }
.zoom-label { position: absolute; right: .75rem; bottom: .75rem; display: flex; align-items: center; gap: .6rem; background: #faf6f0f2; color: #50382c; padding: .3rem .65rem; font-size: .875rem; }
.zoom-label span { font-size: 1.1rem; }
figcaption { margin-top: .75rem; color: #75685e; font-size: .875rem; line-height: 1.8; }
.photo-trigger:focus-visible, .close-photo:focus-visible { outline: 3px solid #873e30; outline-offset: 4px; }
.photo-dialog { position: fixed; inset: 0; margin: auto; padding: 0; border: 0; max-width: min(1120px, 94vw); max-height: 94dvh; background: #faf6f0; color: #2c1810; }
.photo-dialog::backdrop { background: #17120de6; }
.dialog-content { padding: 1rem; }
.close-photo { display: flex; align-items: center; gap: 1rem; margin: 0 0 .75rem auto; min-height: 44px; padding: 0 .75rem; cursor: pointer; }
.close-photo span { font-size: 1.6rem; }
.dialog-content img { width: 100%; max-height: 72dvh; object-fit: contain; }
.dialog-content p { padding-top: 1rem; line-height: 1.7; }
@media (prefers-reduced-motion: reduce) { .photo-trigger img { transition: none; } }
</style>
