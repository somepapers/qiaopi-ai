<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { templateData } from '../../data/templateData'

const templateId = ref('')
onLoad((options) => { templateId.value = options?.id || '' })
const template = computed(() => templateData.find((item) => item.id === templateId.value))

function useTemplate() {
  if (!template.value) return
  uni.setStorageSync('qiaopi-template', {
    relationship: template.value.relationship,
  })
  uni.switchTab({ url: '/pages/write/index' })
}
</script>

<template>
  <view class="page">
    <view v-if="template">
      <view class="page-title">{{ template.title }}</view>
      <view class="page-subtitle">{{ template.description }}</view>
      <view class="paper letter"><text class="letter-content">{{ template.example }}</text></view>
      <view class="paper structure"><view class="structure-title">📋 书信结构解析</view><view v-for="section in template.structure" :key="section.label" class="structure-row"><text class="status" :class="section.isVariable ? 'editable' : 'fixed'">{{ section.isVariable ? '可修改' : '固定格式' }}</text><view><text class="section-name">{{ section.label }}</text><text class="section-example">{{ section.example }}</text></view></view></view>
      <button class="primary-btn use-btn" @click="useTemplate">以此格式写信</button>
    </view>
    <view v-else class="not-found"><text>📭</text><view>未找到这篇范文</view></view>
  </view>
</template>

<style scoped>
.letter { padding: 42rpx; }.letter-content { white-space: pre-wrap; font-size: 30rpx; line-height: 2; }
.structure { margin-top: 24rpx; padding: 28rpx; }.structure-title { font-size: 32rpx; font-weight: 700; }
.structure-row { display: flex; gap: 16rpx; padding: 22rpx 0; border-bottom: 1rpx solid #ecdfce; }.structure-row:last-child { border: 0; }
.status { height: fit-content; padding: 5rpx 12rpx; border-radius: 8rpx; font-size: 21rpx; white-space: nowrap; }.editable { color: #9b6010; background: #fff0d7; }.fixed { color: #3d7447; background: #e7f3e7; }
.section-name, .section-example { display: block; }.section-name { font-size: 27rpx; font-weight: 700; }.section-example { margin-top: 6rpx; color: #806f5d; font-size: 24rpx; line-height: 1.5; }
.use-btn { margin-top: 28rpx; }.not-found { padding: 180rpx 0; color: #806f5d; text-align: center; font-size: 30rpx; }.not-found text { display: block; margin-bottom: 20rpx; font-size: 64rpx; }
</style>
