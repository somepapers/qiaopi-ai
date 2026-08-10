<script setup lang="ts">
import { useRouter } from 'vue-router'
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Hero Section -->
    <section class="py-16 md:py-24 text-center">
      <div class="text-6xl md:text-7xl mb-6">📮</div>
      <h1 class="text-3xl md:text-5xl font-serif font-bold text-ink mb-4">
        侨批AI代书人
      </h1>
      <p class="text-lg md:text-xl text-ink-light font-serif mb-2">
        传承百年侨批，AI续写家书
      </p>
      <p class="text-sm text-ink/40 font-serif max-w-md mx-auto leading-loose">
        侨批，又称"银信"，是海外华侨寄回家乡的家书与汇款凭证，
        2013年入选联合国教科文组织《世界记忆名录》
      </p>

      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <router-link to="/write" class="btn-primary no-underline inline-block text-center min-w-[180px]">
          ✍️ 开始写批
        </router-link>
        <router-link to="/culture" class="btn-secondary no-underline inline-block text-center min-w-[180px]">
          📖 学习侨批文化
        </router-link>
      </div>
    </section>

    <!-- Feature Cards -->
    <section class="py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="vintage-paper rounded-xl p-6 text-center">
        <div class="text-4xl mb-3">🤖</div>
        <h3 class="text-lg font-serif font-semibold text-ink mb-2">AI智能生成</h3>
        <p class="text-sm text-ink-light font-serif">
          口语说你想说的话，AI自动将其转化为传统侨批格式的古典家书
        </p>
      </div>
      <div class="vintage-paper rounded-xl p-6 text-center">
        <div class="text-4xl mb-3">📜</div>
        <h3 class="text-lg font-serif font-semibold text-ink mb-2">经典模板</h3>
        <p class="text-sm text-ink-light font-serif">
          收录多种场景的侨批范文模板，寄钱汇款、节日祝福、问候平安一应俱全
        </p>
      </div>
      <div class="vintage-paper rounded-xl p-6 text-center">
        <div class="text-4xl mb-3">🏛️</div>
        <h3 class="text-lg font-serif font-semibold text-ink mb-2">文化传承</h3>
        <p class="text-sm text-ink-light font-serif">
          了解侨批历史、书写格式、敬语传统，让百年文化遗产在指尖延续
        </p>
      </div>
    </section>

    <!-- Quick Start -->
    <section class="py-12 text-center">
      <h2 class="text-2xl font-serif font-bold text-ink mb-6">三步写一封侨批</h2>
      <div class="flex flex-col md:flex-row items-start justify-center gap-8 max-w-3xl mx-auto">
        <div class="flex-1 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-red-seal/10 flex items-center justify-center text-red-seal font-bold text-lg">1</div>
          <p class="font-serif text-ink font-semibold">选择收信人</p>
          <p class="text-sm text-ink-light mt-1">父母、妻子、兄弟……告诉AI给谁写信</p>
        </div>
        <div class="hidden md:block text-ink/20 text-2xl mt-4">→</div>
        <div class="flex-1 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-red-seal/10 flex items-center justify-center text-red-seal font-bold text-lg">2</div>
          <p class="font-serif text-ink font-semibold">输入想说的话</p>
          <p class="text-sm text-ink-light mt-1">用口语描述你想传达的内容</p>
        </div>
        <div class="hidden md:block text-ink/20 text-2xl mt-4">→</div>
        <div class="flex-1 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-red-seal/10 flex items-center justify-center text-red-seal font-bold text-lg">3</div>
          <p class="font-serif text-ink font-semibold">AI生成侨批</p>
          <p class="text-sm text-ink-light mt-1">一键生成，导出精美书信图片分享</p>
        </div>
      </div>
    </section>
  </div>
</template>
