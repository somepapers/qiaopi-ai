<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { LetterInput, Relationship } from '../../types/letter'
import { relationshipOptions, draftLetter } from '../../utils/letter'
import { generateLetter } from '../../utils/api'

const form = ref<LetterInput>({ plainSpeech: '', recipient: '', relationship: 'parents', preferredTone: 'warm', senderName: '' })
const relationshipIndex = ref(0)
const generating = ref(false)
const generated = ref('')
const error = ref('')
const currentRelationship = computed(() => relationshipOptions[relationshipIndex.value])

onShow(() => {
  const selected = uni.getStorageSync('qiaopi-template') as { relationship?: Relationship }
  if (!selected?.relationship) return
  const index = relationshipOptions.findIndex((item) => item.value === selected.relationship)
  if (index >= 0) {
    relationshipIndex.value = index
    form.value.relationship = selected.relationship
  }
  uni.removeStorageSync('qiaopi-template')
})

function chooseRelationship(event: any) {
  relationshipIndex.value = Number(event.detail.value)
  form.value.relationship = relationshipOptions[relationshipIndex.value].value
}

function chooseTone(event: any) {
  form.value.preferredTone = event.detail.value
}

async function submit() {
  error.value = ''
  if (!form.value.recipient.trim() || !form.value.plainSpeech.trim()) {
    error.value = '请先填写收信人和想说的话。'
    return
  }
  generating.value = true
  try {
    generated.value = await generateLetter(form.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '生成失败，请稍后重试。'
  } finally {
    generating.value = false
  }
}

function preview() {
  error.value = ''
  if (!form.value.plainSpeech.trim()) { error.value = '先写下你想说的话，再预览格式。'; return }
  generated.value = draftLetter(form.value.relationship as Relationship, form.value.plainSpeech, form.value.senderName)
}

function copyLetter() {
  uni.setClipboardData({ data: generated.value })
}

function restart() { generated.value = ''; error.value = '' }
</script>

<template>
  <view class="page">
    <template v-if="!generated">
      <view class="page-title">✍️ 写一封侨批</view>
      <view class="page-subtitle">把想对亲人说的话告诉我们，AI 将为你写成传统侨批。</view>
      <view class="paper form-card">
        <view class="field"><text class="label">收信人 *</text><input v-model="form.recipient" placeholder="例如：父亲、阿妈、妻子" maxlength="20" /></view>
        <view class="field"><text class="label">与收信人的关系 *</text><picker :range="relationshipOptions" range-key="label" :value="relationshipIndex" @change="chooseRelationship"><view class="picker">{{ currentRelationship.label }} <text>⌄</text></view></picker></view>
        <view class="field"><text class="label">你的名字（选填）</text><input v-model="form.senderName" placeholder="用于落款" maxlength="20" /></view>
        <view class="field"><text class="label">你想说的话 *</text><textarea v-model="form.plainSpeech" placeholder="例如：我在外面一切都好，天气凉了，请你们多添衣。这个月寄了五百元回家……" maxlength="500" auto-height /></view>
        <view class="field"><text class="label">语气</text><radio-group class="tone-row" @change="chooseTone"><label v-for="tone in [{ value: 'warm', label: '亲切温暖' }, { value: 'formal', label: '正式恭敬' }, { value: 'concise', label: '简洁明了' }]" :key="tone.value" class="tone"><radio :checked="form.preferredTone === tone.value" :value="tone.value" color="#9c2f28" />{{ tone.label }}</label></radio-group></view>
        <text v-if="error" class="error">{{ error }}</text>
        <button class="primary-btn submit" :loading="generating" @click="submit">{{ generating ? '正在写批…' : '请 AI 代书' }}</button>
        <button class="preview" @click="preview">先预览传统格式</button>
      </view>
    </template>
    <template v-else>
      <view class="page-title">📜 侨批已写成</view>
      <view class="page-subtitle">你可以复制全文，或点击右上角分享给亲人。</view>
      <view class="paper letter"><text class="letter-content">{{ generated }}</text></view>
      <button class="primary-btn action" @click="copyLetter">复制全文</button>
      <button class="secondary-btn action" @click="restart">重新写一封</button>
    </template>
  </view>
</template>

<style scoped>
.form-card { padding: 30rpx; }
.field { margin-bottom: 30rpx; }
.label { display: block; margin-bottom: 12rpx; color: #684b37; font-size: 27rpx; font-weight: 700; }
input, textarea, .picker { width: 100%; padding: 20rpx; color: #342b25; font-size: 29rpx; background: #fffdf8; border: 1rpx solid #dfcfbb; border-radius: 10rpx; }
textarea { min-height: 230rpx; line-height: 1.7; }
.picker { display: flex; justify-content: space-between; }
.tone-row { display: flex; flex-wrap: wrap; gap: 20rpx; }
.tone { color: #684b37; font-size: 27rpx; }
.tone radio { transform: scale(.78); }
.submit { margin-top: 12rpx; }
.preview { margin-top: 14rpx; background: transparent; color: #806f5d; font-size: 27rpx; }
.error { display: block; margin-bottom: 18rpx; color: #b54138; font-size: 26rpx; }
.letter { padding: 48rpx 42rpx; min-height: 600rpx; background-color: #fff9ed; background-image: repeating-linear-gradient(0deg, rgba(156,47,40,.04), rgba(156,47,40,.04) 1rpx, transparent 1rpx, transparent 58rpx); }
.letter-content { white-space: pre-wrap; font-size: 31rpx; line-height: 2.05; letter-spacing: 1rpx; }
.action { margin-top: 20rpx; }
</style>
