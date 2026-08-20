<script setup lang="ts">
const photos = [
  { src: '/static/exhibition/侨批1.jpg', title: '侨批原件展示（一）' },
  { src: '/static/exhibition/侨批2.jpg', title: '侨批原件展示（二）' },
]

function preview(index: number) {
  uni.previewImage({ current: photos[index].src, urls: photos.map((item) => item.src) })
}
</script>

<template>
  <view class="page">
    <view class="page-title">🏛️ 侨批展览馆</view>
    <view class="page-subtitle">一纸侨批，百年乡愁。点击图片可放大查看。</view>
    <view class="photos"><view v-for="(photo, index) in photos" :key="photo.src" class="paper photo-card" @click="preview(index)"><image :src="photo.src" mode="widthFix" class="photo" /><view class="caption">{{ photo.title }}</view></view></view>
    <view class="credit">照片来源：福建省档案馆</view>
  </view>
</template>

<style scoped>
.photos { display: grid; gap: 24rpx; }.photo-card { overflow: hidden; padding: 16rpx; }.photo { display: block; width: 100%; border-radius: 12rpx; }.caption { padding: 18rpx 8rpx 4rpx; color: #684b37; font-size: 27rpx; text-align: center; }.credit { margin-top: 50rpx; color: #927e6d; font-size: 25rpx; text-align: center; }
</style>
