<script setup lang="ts">
import { locale, t } from '@/i18n'
import { ref, reactive, computed } from 'vue'
import { useLetterStore } from '@/stores/letter'
import { useLetterGenerate } from '@/composables/useLetterGenerate'
import { RELATIONSHIP_LABELS, RELATIONSHIP_GROUPS } from '@/utils/constants'
import type { LetterInput as LetterInputType, Relationship } from '@/types/letter'

const letterStore = useLetterStore()
const { generate } = useLetterGenerate()

const form = reactive<LetterInputType>({
  plainSpeech: '',
  recipient: '',
  relationship: 'parents' as Relationship,
  remittanceAmount: '',
  additionalInfo: '',
  preferredTone: 'formal',
  senderName: '',
})

const errors = ref<Record<string, string>>({})

// An untouched default follows the interface language. Typed addresses stay as entered.
const fromLocation = computed({
  get: () => form.fromLocation ?? t('南洋'),
  set: (value: string) => { form.fromLocation = value },
})
const toLocation = computed({
  get: () => form.toLocation ?? t('家乡'),
  set: (value: string) => { form.toLocation = value },
})

function validate(): boolean {
  errors.value = {}
  if (!form.plainSpeech.trim()) {
    errors.value.plainSpeech = '请输入你想说的话'
  }
  if (form.plainSpeech.trim().length < 5) {
    errors.value.plainSpeech = '内容太短，至少输入5个字'
  }
  if (!form.recipient.trim()) {
    errors.value.recipient = '请输入收信人姓名或称呼'
  }
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  const input: LetterInputType = {
    locale: locale.value,
    plainSpeech: form.plainSpeech,
    recipient: form.recipient,
    relationship: form.relationship,
    remittanceAmount: form.remittanceAmount || undefined,
    fromLocation: fromLocation.value || undefined,
    toLocation: toLocation.value || undefined,
    additionalInfo: form.additionalInfo || undefined,
    preferredTone: form.preferredTone,
    senderName: form.senderName || undefined,
  }
  letterStore.setInput(input)
  await generate(input)
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-xl font-serif font-semibold text-ink text-center">
      {{ t('请告诉AI代书先生，你想写什么') }}
    </h2>

    <!-- Recipient -->
    <div class="space-y-2">
      <label class="block text-sm font-serif text-ink/70">{{ t('收信人') }}</label>
      <div class="flex gap-3">
        <input
          v-model="form.recipient"
          type="text"
          :placeholder="t('如：母亲大人、阿福吾儿、贤妻阿珍')"
          class="flex-1 px-4 py-2.5 rounded-lg border border-ink/20 bg-white/80 font-serif text-ink placeholder:text-ink/30 focus:outline-none focus:border-red-seal/50"
        />
      </div>
      <p v-if="errors.recipient" class="text-red-seal text-xs">{{ t(errors.recipient) }}</p>
    </div>

    <!-- Relationship -->
    <div class="space-y-2">
      <label class="block text-sm font-serif text-ink/70">{{ t('收信人与你的关系') }}</label>
      <div v-for="group in RELATIONSHIP_GROUPS" :key="group.label" class="mb-2">
        <span class="text-xs text-ink/40 mr-2">{{ t(group.label) }}：</span>
        <div class="inline-flex flex-wrap gap-1.5">
          <button
            v-for="rel in group.items"
            :key="rel"
            @click="form.relationship = rel"
            class="px-3 py-1 rounded-full text-xs font-serif transition-colors"
            :class="form.relationship === rel
              ? 'bg-red-seal text-white'
              : 'bg-ink/5 text-ink/70 hover:bg-ink/10'"
          >
            {{ t(RELATIONSHIP_LABELS[rel]) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Optional: Remittance -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="space-y-1">
        <label class="block text-sm font-serif text-ink/70">{{ t('汇款金额（可选）') }}</label>
        <input
          v-model="form.remittanceAmount"
          type="text"
          :placeholder="t('如：伍佰新币')"
          class="w-full px-3 py-2 rounded-lg border border-ink/20 bg-white/80 font-serif text-ink text-sm placeholder:text-ink/30 focus:outline-none focus:border-red-seal/50"
        />
      </div>
      <div class="space-y-1">
        <label class="block text-sm font-serif text-ink/70">{{ t('寄批地（可选）') }}</label>
        <input
          v-model="fromLocation"
          type="text"
          :placeholder="t('如：新加坡')"
          class="w-full px-3 py-2 rounded-lg border border-ink/20 bg-white/80 font-serif text-ink text-sm placeholder:text-ink/30 focus:outline-none focus:border-red-seal/50"
        />
      </div>
      <div class="space-y-1">
        <label class="block text-sm font-serif text-ink/70">{{ t('收批地（可选）') }}</label>
        <input
          v-model="toLocation"
          type="text"
          :placeholder="t('如：潮汕')"
          class="w-full px-3 py-2 rounded-lg border border-ink/20 bg-white/80 font-serif text-ink text-sm placeholder:text-ink/30 focus:outline-none focus:border-red-seal/50"
        />
      </div>
    </div>

    <!-- Plain Speech -->
    <div class="space-y-2">
      <label class="block text-sm font-serif text-ink/70">{{ t('你想说的话') }}</label>
      <textarea
        v-model="form.plainSpeech"
        rows="6"
        maxlength="500"
        :placeholder="t('用日常口语告诉AI你想说什么……\n\n例如：\n爸妈，我在新加坡打工挺好的，不用担心。这几个月攒了些钱，寄了500块新币回来，你们拿着补贴家用。天冷了多加衣服，保重身体。\n\nAI会帮你写成符合传统侨批格式的古典家书——加上敬语、农历日期、大写金额……')"
        class="w-full px-4 py-3 rounded-lg border border-ink/20 bg-white/80 font-serif text-ink placeholder:text-ink/30 focus:outline-none focus:border-red-seal/50 resize-none leading-relaxed"
      ></textarea>
      <div class="flex justify-between items-center">
        <p v-if="errors.plainSpeech" class="text-red-seal text-xs">{{ t(errors.plainSpeech) }}</p>
        <span class="text-xs text-ink/30 font-serif ml-auto">{{ form.plainSpeech.length }}/500</span>
      </div>
    </div>

    <!-- Sender Name -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="block text-sm font-serif text-ink/70">{{ t('你的署名（可选）') }}</label>
        <input
          v-model="form.senderName"
          type="text"
          :placeholder="t('如：阿福')"
          class="w-full px-3 py-2 rounded-lg border border-ink/20 bg-white/80 font-serif text-ink text-sm placeholder:text-ink/30 focus:outline-none focus:border-red-seal/50"
        />
      </div>
      <div class="space-y-1">
        <label class="block text-sm font-serif text-ink/70">{{ t('语气偏好（可选）') }}</label>
        <select
          v-model="form.preferredTone"
          class="w-full px-3 py-2 rounded-lg border border-ink/20 bg-white/80 font-serif text-ink text-sm focus:outline-none focus:border-red-seal/50"
        >
          <option value="formal">{{ t('正式恭敬') }}</option>
          <option value="warm">{{ t('亲切温暖') }}</option>
          <option value="concise">{{ t('简洁明了') }}</option>
        </select>
      </div>
    </div>

    <!-- Submit -->
    <div class="text-center pt-4">
      <button
        class="btn-primary text-lg px-10 py-3"
        :disabled="letterStore.isGenerating"
        @click="handleSubmit"
      >
        <span v-if="letterStore.isGenerating" class="flex items-center gap-2">
          <span class="animate-pulse">🖋️</span> {{ t('AI正在书写中...') }}
        </span>
        <span v-else>{{ t('🖋️ 生成侨批') }}</span>
      </button>
    </div>
  </div>
</template>
