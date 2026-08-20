<script setup lang="ts">
import { computed, ref } from 'vue'
import { templateData } from '../../data/templateData'

const query = ref('')
const scenario = ref('all')
const scenarios = [
  { value: 'all', label: '全部' }, { value: 'remittance', label: '汇款' }, { value: 'greeting_safe', label: '平安' },
  { value: 'festival', label: '节日' }, { value: 'missing_family', label: '思念' }, { value: 'education', label: '教育' }
]
const iconMap: Record<string, string> = { remittance: '💰', greeting_safe: '🙏', festival: '🎊', apology: '📝', news_update: '📮', missing_family: '💌', education: '📚', birthday: '🎂' }
const relationshipMap: Record<string, string> = { parents: '父母', father: '父亲', mother: '母亲', wife: '妻子', husband: '丈夫', son: '儿子', daughter: '女儿', friend: '朋友' }
const filtered = computed(() => templateData.filter((item) => {
  const matchScenario = scenario.value === 'all' || item.scenario === scenario.value
  const source = `${item.title}${item.description}${item.tags.join('')}`.toLowerCase()
  return matchScenario && source.includes(query.value.toLowerCase())
}))

function openDetail(id: string) { uni.navigateTo({ url: `/pages/template-detail/index?id=${id}` }) }
</script>

<template>
  <view class="page">
    <view class="page-title">📜 侨批范文库</view>
    <view class="page-subtitle">从经典范文中，感受一封侨批的真情与规矩。</view>
    <input v-model="query" class="search" placeholder="搜索范文、场景或关键词" />
    <scroll-view class="scenario-scroll" scroll-x>
      <view class="scenario-row"><text v-for="item in scenarios" :key="item.value" class="scenario" :class="{ active: scenario === item.value }" @click="scenario = item.value">{{ item.label }}</text></view>
    </scroll-view>
    <view class="result-text">共 {{ filtered.length }} 篇范文</view>
    <view v-if="filtered.length" class="template-list">
      <view v-for="item in filtered" :key="item.id" class="paper template-card" @click="openDetail(item.id)">
        <view class="card-head"><text class="card-icon">{{ iconMap[item.scenario] || '✉️' }}</text><text class="relationship">{{ relationshipMap[item.relationship] || item.relationship }}</text></view>
        <view class="card-title">{{ item.title }}</view>
        <view class="card-desc">{{ item.description }}</view>
        <view><text v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</text></view>
      </view>
    </view>
    <view v-else class="empty">📭<text>没有找到匹配的范文</text></view>
  </view>
</template>

<style scoped>
.search { width: 100%; padding: 20rpx; background: #fffdf8; border: 1rpx solid #dfcfbb; border-radius: 12rpx; font-size: 28rpx; }
.scenario-scroll { white-space: nowrap; margin: 24rpx 0; }
.scenario-row { display: flex; gap: 16rpx; }
.scenario { padding: 12rpx 25rpx; color: #806f5d; background: #f2e7d4; border-radius: 100rpx; font-size: 26rpx; }
.scenario.active { color: #fff; background: #9c2f28; }
.result-text { margin-bottom: 16rpx; color: #927e6d; font-size: 24rpx; }
.template-list { display: grid; gap: 20rpx; }
.template-card { padding: 28rpx; }
.card-head { display: flex; align-items: center; justify-content: space-between; }
.card-icon { font-size: 44rpx; }.relationship { color: #927e6d; font-size: 24rpx; }
.card-title { margin: 12rpx 0 8rpx; font-size: 33rpx; font-weight: 700; }
.card-desc { margin-bottom: 18rpx; color: #806f5d; font-size: 26rpx; line-height: 1.65; }
.empty { display: flex; flex-direction: column; align-items: center; gap: 16rpx; padding: 120rpx 0; color: #927e6d; font-size: 54rpx; }.empty text { font-size: 28rpx; }
</style>
