<script setup lang="ts">
function goTo(path: string) {
  if (path === '/pages/write/index') uni.switchTab({ url: path })
  else uni.switchTab({ url: path })
}

const features = [
  { icon: '🤖', title: 'AI 智能生成', text: '把日常想说的话写成一封有温度的传统侨批。' },
  { icon: '📜', title: '经典范文', text: '按场景浏览侨批范文，学习称谓、祝颂和落款。' },
  { icon: '🏛️', title: '文化传承', text: '在一封封家书里认识华侨记忆与家国情怀。' },
]
</script>

<template>
  <view class="page home">
    <view class="hero">
      <text class="hero-icon">📮</text>
      <view class="hero-title">侨批AI代书人</view>
      <view class="hero-slogan">传承百年侨批，AI续写家书</view>
      <view class="hero-desc">侨批，又称“银信”，是海外华侨寄回家乡的家书与汇款凭证。</view>
      <view class="hero-actions">
        <button class="primary-btn hero-action" @click="goTo('/pages/write/index')">开始写批</button>
        <button class="secondary-btn hero-action" @click="goTo('/pages/culture/index')">学习侨批文化</button>
      </view>
    </view>

    <view class="feature-list">
      <view v-for="item in features" :key="item.title" class="paper feature-card">
        <text class="feature-icon">{{ item.icon }}</text>
        <view class="feature-title">{{ item.title }}</view>
        <view class="muted">{{ item.text }}</view>
      </view>
    </view>

    <view class="section-title">三步写一封侨批</view>
    <view class="paper steps">
      <view class="step"><text class="step-num">1</text><view><text>选择收信人</text><text class="step-desc">告诉 AI 这封信写给谁</text></view></view>
      <view class="step"><text class="step-num">2</text><view><text>输入想说的话</text><text class="step-desc">用自己的话写下牵挂</text></view></view>
      <view class="step"><text class="step-num">3</text><view><text>生成并分享</text><text class="step-desc">保存、转发你的专属家书</text></view></view>
    </view>
  </view>
</template>

<style scoped>
.hero { padding: 72rpx 28rpx 56rpx; text-align: center; }
.hero-icon { display: block; font-size: 96rpx; }
.hero-title { margin-top: 18rpx; font-size: 54rpx; font-weight: 700; letter-spacing: 3rpx; }
.hero-slogan { margin-top: 16rpx; color: #9c2f28; font-size: 32rpx; }
.hero-desc { margin: 22rpx auto 0; max-width: 580rpx; color: #806f5d; font-size: 26rpx; line-height: 1.8; }
.hero-actions { margin-top: 42rpx; display: flex; gap: 20rpx; }
.hero-action { flex: 1; }
.feature-list { display: grid; gap: 20rpx; }
.feature-card { padding: 30rpx; }
.feature-icon { font-size: 52rpx; }
.feature-title { margin: 14rpx 0 8rpx; font-size: 32rpx; font-weight: 700; }
.steps { padding: 14rpx 28rpx; }
.step { display: flex; gap: 22rpx; padding: 26rpx 0; border-bottom: 1rpx solid #ecdfce; font-size: 30rpx; }
.step:last-child { border: 0; }
.step-num { display: flex; flex: 0 0 46rpx; height: 46rpx; align-items: center; justify-content: center; color: #9c2f28; background: #f5e0d5; border-radius: 50%; font-weight: 700; }
.step-desc { display: block; margin-top: 6rpx; color: #927e6d; font-size: 25rpx; }
</style>
