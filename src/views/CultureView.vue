<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'history' | 'format' | 'terms' | 'classic'>('history')

const tabs = [
  { key: 'history' as const, label: '侨批历史', icon: '📜' },
  { key: 'format' as const, label: '书写格式', icon: '✍️' },
  { key: 'terms' as const, label: '常用敬语', icon: '📖' },
  { key: 'classic' as const, label: '经典赏析', icon: '🏛️' },
]

const timeline = [
  { year: '1820s', event: '侨批萌芽', desc: '随着"水客"往返南洋与中国之间，最早的侨批形式出现。水客既带信又带钱，是侨批系统的雏形。' },
  { year: '1850s', event: '批局兴起', desc: '专业侨批局（民信局）开始在东南亚各地设立，形成覆盖南洋各埠的侨批网络。' },
  { year: '1870s', event: '鼎盛时期', desc: '侨批局遍布东南亚各大城市，形成"批脚—批局—侨眷"的成熟跨国通信金融网络。' },
  { year: '1930s', event: '抗战时期', desc: '抗战期间，侨批成为连接海外华侨与祖国的生命线，大量侨汇支持国内抗战和民生。' },
  { year: '1950s', event: '公私合营', desc: '新中国成立后，侨批局逐步纳入国家邮政和银行体系，侨批转为银行汇款。' },
  { year: '1970s', event: '侨批时代终结', desc: '随着现代通信和银行系统普及，传统侨批完成历史使命，逐渐退出历史舞台。' },
  { year: '2013', event: '世界记忆遗产', desc: '侨批档案正式入选联合国教科文组织《世界记忆名录》，成为全人类共同的文化遗产。' },
]

const honorificTerms = [
  { term: '膝下', usage: '对父母或祖父母的提称语', example: '双亲大人膝下', note: '表示子女在父母膝前承欢之意' },
  { term: '尊前', usage: '对长辈的提称语', example: '父亲大人尊前', note: '表示在尊者面前恭敬之意' },
  { term: '妆次', usage: '对妻子的提称语', example: '贤妻妆次', note: '妆次指梳妆台旁，表示亲密' },
  { term: '英鉴', usage: '对丈夫或男性的提称语', example: '夫君英鉴', note: '请对方查看之意' },
  { term: '如晤', usage: '对平辈的提称语', example: '贤弟如晤', note: '如同见面一样' },
  { term: '收知', usage: '对晚辈的提称语', example: '吾儿收知', note: '收到并知晓' },
  { term: '敬禀者', usage: '对长辈书信的起首语', example: '敬禀者，...', note: '恭敬地禀告' },
  { term: '叩禀', usage: '对长辈的具名语', example: '男 阿福 叩禀', note: '磕头禀告，最恭敬的署名方式' },
  { term: '手启', usage: '对平辈的具名语', example: '夫 阿福 手启', note: '亲手开启/书写' },
  { term: '福安', usage: '对长辈的祝颂语', example: '恭请福安', note: '祝福平安' },
  { term: '妆安', usage: '对妻子的祝颂语', example: '顺颂妆安', note: '祝妻子安好' },
  { term: '时祺', usage: '对平辈的祝颂语', example: '顺颂时祺', note: '祝时时吉祥' },
]

const classicLetters = [
  {
    title: '最简短的侨批',
    content: '双亲大人膝下：内外平安。',
    context: '这是一封只有九个字的侨批，出自一位不善言辞的华侨之手。短短几字，道尽了海外游子对父母最朴素的牵挂。',
  },
  {
    title: '感人至深的思乡信',
    content: '双亲大人膝下：\n敬禀者，自违慈颜，瞬逾三载。每值夜阑人静，辄忆家中情景。祖母年迈，未知步履尚健否；门前那棵龙眼树，今年结实否。男在洋中，虽则粗安，然每怀家国，未尝不临风陨涕。惟望早积余资，得以早日归省。纸短情长，难尽欲言。',
    context: '这是一位在暹罗（今泰国）打工的青年写给父母的信。信中不提苦楚，却用"门前龙眼树"这样具体的意象表达乡愁，令人动容。',
  },
]
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <h1 class="text-2xl md:text-3xl font-serif font-bold text-ink text-center mb-2">
      🏛️ 侨批文化
    </h1>
    <p class="text-center text-ink/50 font-serif mb-8">
      了解侨批的历史、格式和传统，感受百年家书的文化底蕴
    </p>

    <!-- Tab Navigation -->
    <div class="flex flex-wrap justify-center gap-2 mb-8">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-2 rounded-lg text-sm font-serif transition-colors"
        :class="activeTab === tab.key
          ? 'bg-red-seal text-white'
          : 'bg-ink/5 text-ink/70 hover:bg-ink/10'"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- History Tab -->
    <section v-if="activeTab === 'history'" class="vintage-paper rounded-xl p-6 md:p-10">
      <h2 class="text-xl font-serif font-bold text-ink mb-6 text-center">侨批历史时间线</h2>
      <div class="relative border-l-2 border-red-seal/20 pl-6 space-y-8 ml-4">
        <div v-for="item in timeline" :key="item.year" class="relative">
          <div class="absolute -left-[31px] w-4 h-4 rounded-full bg-red-seal border-2 border-[#faf6f0]"></div>
          <span class="text-xs font-serif text-red-seal font-semibold">{{ item.year }}</span>
          <h3 class="text-base font-serif font-semibold text-ink mt-0.5">{{ item.event }}</h3>
          <p class="text-sm text-ink/60 font-serif mt-1">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Format Tab -->
    <section v-if="activeTab === 'format'" class="space-y-6">
      <div class="vintage-paper rounded-xl p-6 md:p-10">
        <h2 class="text-xl font-serif font-bold text-ink mb-6 text-center">侨批格式图解</h2>
        <div class="vintage-paper rounded-lg border border-ink/10 p-6 space-y-4 max-w-lg mx-auto">
          <div class="text-center">
            <span class="text-xs text-ink/40 font-serif bg-red-seal/5 px-3 py-1 rounded-full">1. 称谓 + 提称语</span>
            <p class="text-lg font-serif text-ink mt-1">双亲大人膝下：</p>
          </div>
          <div class="text-center">
            <span class="text-xs text-ink/40 font-serif bg-amber-50 px-3 py-1 rounded-full">2. 起首语</span>
            <p class="text-lg font-serif text-ink mt-1">敬禀者，拜别以来，倏经数月，念念！</p>
          </div>
          <div class="border-t border-ink/5 pt-4 space-y-2">
            <span class="text-xs text-ink/40 font-serif bg-amber-50 px-3 py-1 rounded-full">3. 正文</span>
            <p class="text-base font-serif text-ink/80">男在外一切安好，请勿挂念。<br><span class="text-red-seal">兹逢邮便，特寄回银壹佰元正</span>，到祈查收。<br>款到之后，祈为示复，以慰远怀。<br>近来天气渐凉，恳祈双亲大人加衣珍重。</p>
          </div>
          <div class="text-center border-t border-ink/5 pt-4">
            <span class="text-xs text-ink/40 font-serif bg-amber-50 px-3 py-1 rounded-full">4-5. 结束语 + 祝颂语</span>
            <p class="text-lg font-serif text-ink mt-1">专此奉禀，恭请福安。</p>
          </div>
          <div class="text-right border-t border-ink/5 pt-4">
            <span class="text-xs text-ink/40 font-serif bg-amber-50 px-3 py-1 rounded-full">6-7. 落款 + 日期</span>
            <p class="text-lg font-serif text-ink mt-1">男 阿福 叩禀</p>
            <p class="text-sm font-serif text-ink/50">乙巳年腊月初八</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Terms Tab -->
    <section v-if="activeTab === 'terms'" class="space-y-4">
      <div class="vintage-paper rounded-xl p-6 md:p-10">
        <h2 class="text-xl font-serif font-bold text-ink mb-6 text-center">常用敬语与礼节用词</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="item in honorificTerms"
            :key="item.term"
            class="vintage-paper rounded-lg p-4 border border-ink/5"
          >
            <h3 class="text-lg font-serif font-bold text-red-seal">{{ item.term }}</h3>
            <p class="text-xs text-ink/50 font-serif mt-1">{{ item.usage }}</p>
            <p class="text-sm font-serif text-ink mt-2">{{ item.example }}</p>
            <p class="text-xs text-ink/40 font-serif mt-1">💡 {{ item.note }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Classic Tab -->
    <section v-if="activeTab === 'classic'" class="space-y-6">
      <div
        v-for="item in classicLetters"
        :key="item.title"
        class="vintage-paper rounded-xl p-6 md:p-10"
      >
        <h2 class="text-xl font-serif font-bold text-ink mb-4">{{ item.title }}</h2>
        <div class="vintage-paper rounded-lg border border-ink/10 p-6 mb-4">
          <div class="vintage-text whitespace-pre-line text-base leading-loose">{{ item.content }}</div>
        </div>
        <p class="text-sm text-ink/60 font-serif italic">{{ item.context }}</p>
      </div>
    </section>
  </div>
</template>
