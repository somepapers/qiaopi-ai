<script setup lang="ts">
import { ref } from 'vue'

const active = ref<'history' | 'format' | 'terms' | 'classic'>('history')
const tabs = [{ key: 'history', label: '历史' }, { key: 'format', label: '格式' }, { key: 'terms', label: '敬语' }, { key: 'classic', label: '赏析' }] as const
const timeline = [
  ['1820年代', '侨批萌芽', '“水客”往返南洋与中国之间，最早的侨批形式出现。'],
  ['1850年代', '批局兴起', '专业侨批局在东南亚各地设立，逐渐形成跨国网络。'],
  ['1930年代', '家国纽带', '抗战期间，侨批成为海外华侨与祖国之间的重要生命线。'],
  ['2013年', '世界记忆遗产', '侨批档案入选联合国教科文组织《世界记忆名录》。'],
]
const terms = [['膝下', '用于父母、祖父母等长辈', '双亲大人膝下'], ['妆次', '用于妻子的提称语', '贤妻妆次'], ['如晤', '用于平辈，意为如同见面', '贤弟如晤'], ['叩禀', '对长辈恭敬的具名方式', '男 阿福 叩禀'], ['福安', '祝长辈平安吉祥', '恭请福安']]
</script>

<template>
  <view class="page">
    <view class="page-title">🏛️ 侨批文化</view>
    <view class="page-subtitle">一纸侨批，百年乡愁。了解它的历史和书写传统。</view>
    <view class="tabs"><text v-for="tab in tabs" :key="tab.key" class="tab" :class="{ active: active === tab.key }" @click="active = tab.key">{{ tab.label }}</text></view>
    <view v-if="active === 'history'" class="paper panel"><view v-for="item in timeline" :key="item[0]" class="timeline"><text class="dot"></text><view><text class="year">{{ item[0] }}</text><text class="event">{{ item[1] }}</text><text class="description">{{ item[2] }}</text></view></view></view>
    <view v-else-if="active === 'format'" class="paper panel"><view class="format-title">一封传统侨批的七个部分</view><view class="format-part"><text>1. 称谓与提称语</text><text>双亲大人膝下：</text></view><view class="format-part"><text>2. 起首问候</text><text>敬禀者，拜别以来，倏经数月，念念！</text></view><view class="format-part"><text>3. 正文</text><text>报平安、叙近况、寄托思念或说明汇款。</text></view><view class="format-part"><text>4. 结束与祝颂</text><text>纸短情长，难尽欲言。恭请福安。</text></view><view class="format-part"><text>5. 落款与日期</text><text>男 阿福 叩禀</text></view></view>
    <view v-else-if="active === 'terms'" class="paper panel"><view v-for="item in terms" :key="item[0]" class="term"><text class="term-name">{{ item[0] }}</text><view><text class="term-usage">{{ item[1] }}</text><text class="term-example">例：{{ item[2] }}</text></view></view></view>
    <view v-else class="paper panel"><view class="classic-title">最简短的侨批</view><view class="classic-letter">双亲大人膝下：<br/>内外平安。</view><view class="description">短短九字，道尽了海外游子对父母最朴素、最真切的牵挂。</view><view class="classic-title second">侨批的意义</view><view class="description">它既是一封家书，也常附有汇款凭证；是漂泊者的乡愁，也是一个时代跨越山海的亲情档案。</view></view>
  </view>
</template>

<style scoped>
.tabs { display: flex; gap: 12rpx; margin-bottom: 26rpx; }.tab { flex: 1; padding: 16rpx 0; color: #806f5d; font-size: 27rpx; text-align: center; background: #f2e7d4; border-radius: 10rpx; }.tab.active { color: #fff; background: #9c2f28; }
.panel { padding: 34rpx; }.timeline { position: relative; display: flex; gap: 25rpx; padding: 0 0 40rpx 8rpx; border-left: 3rpx solid #eed6ce; }.timeline:last-child { padding-bottom: 0; }.dot { position: absolute; left: -11rpx; top: 4rpx; width: 18rpx; height: 18rpx; background: #9c2f28; border: 4rpx solid #fffaf2; border-radius: 50%; }.year, .event, .description { display: block; }.year { color: #9c2f28; font-size: 25rpx; }.event { margin: 5rpx 0; font-size: 31rpx; font-weight: 700; }.description { color: #806f5d; font-size: 26rpx; line-height: 1.7; }
.format-title, .classic-title { font-size: 33rpx; font-weight: 700; text-align: center; }.format-part { padding: 25rpx 0; border-bottom: 1rpx solid #e9dac5; }.format-part text { display: block; }.format-part text:first-child { color: #9c2f28; font-size: 26rpx; }.format-part text:last-child { margin-top: 8rpx; color: #684b37; font-size: 28rpx; line-height: 1.65; }.term { display: flex; gap: 20rpx; padding: 23rpx 0; border-bottom: 1rpx solid #e9dac5; }.term-name { min-width: 90rpx; color: #9c2f28; font-size: 31rpx; font-weight: 700; }.term-usage, .term-example { display: block; }.term-usage { font-size: 27rpx; }.term-example { margin-top: 8rpx; color: #927e6d; font-size: 24rpx; }.classic-letter { margin: 30rpx 0; padding: 34rpx; background: #fff5e5; font-size: 32rpx; line-height: 2; text-align: center; }.second { margin-top: 45rpx; }.description { margin-top: 18rpx; }
</style>
